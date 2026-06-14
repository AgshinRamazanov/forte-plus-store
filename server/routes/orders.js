import express from 'express';
import { getDatabase } from '../db.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create Order (Checkout)
router.post('/', authenticateToken, async (req, res) => {
  const { cartItems, shippingAddress, totalAmount } = req.body;
  if (!cartItems || cartItems.length === 0 || !shippingAddress || !totalAmount) {
    return res.status(400).json({ message: 'Sipariş detayları eksik.' });
  }

  const db = await getDatabase();

  try {
    // Start Transaction
    await db.run('BEGIN TRANSACTION');

    // 1. Validate and update product stock
    for (const item of cartItems) {
      const product = await db.get('SELECT stock, name FROM products WHERE id = ?', [item.id]);
      if (!product) {
        throw new Error(`Ürün bulunamadı: ID ${item.id}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Stok yetersiz: ${product.name} (Kalan: ${product.stock}, İstenen: ${item.quantity})`);
      }

      // Deduct stock
      await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
    }

    // 2. Insert Order
    const orderResult = await db.run(
      `INSERT INTO orders (user_id, total_amount, shipping_address, payment_status, order_status) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, parseFloat(totalAmount), shippingAddress, 'Paid', 'Pending']
    );
    const orderId = orderResult.lastID;

    // 3. Insert Order Items
    for (const item of cartItems) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, parseFloat(item.price)]
      );
    }

    // Commit Transaction
    await db.run('COMMIT');

    res.status(201).json({
      message: 'Siparişiniz başarıyla alındı.',
      orderId
    });
  } catch (error) {
    // Rollback Transaction
    await db.run('ROLLBACK');
    console.error(error);
    res.status(400).json({ message: error.message || 'Sipariş işlenirken bir hata oluştu.' });
  }
});

// Get Logged-In User's Orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Get user's orders
    const orders = await db.all(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Fetch items for each order
    const ordersWithItems = [];
    for (const order of orders) {
      const items = await db.all(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      ordersWithItems.push({
        ...order,
        items
      });
    }

    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Siparişleriniz yüklenirken sunucu hatası oluştu.' });
  }
});

// Get All Orders (Admin Only)
router.get('/', authorizeAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    
    const orders = await db.all(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    const ordersWithItems = [];
    for (const order of orders) {
      const items = await db.all(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      ordersWithItems.push({
        ...order,
        items
      });
    }

    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Tüm siparişler listelenirken sunucu hatası oluştu.' });
  }
});

// Update Order Status (Admin Only)
router.put('/:id/status', authorizeAdmin, async (req, res) => {
  const { order_status, payment_status } = req.body;
  const db = await getDatabase();

  try {
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı.' });
    }

    await db.run(
      `UPDATE orders 
       SET order_status = ?, payment_status = ? 
       WHERE id = ?`,
      [
        order_status || order.order_status,
        payment_status || order.payment_status,
        req.params.id
      ]
    );

    res.json({ message: 'Sipariş durumu güncellendi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sipariş durumu güncellenirken sunucu hatası oluştu.' });
  }
});

export default router;
