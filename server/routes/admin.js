import express from 'express';
import { getDatabase } from '../db.js';
import { authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get Admin Statistics
router.get('/stats', authorizeAdmin, async (req, res) => {
  try {
    const db = await getDatabase();

    // 1. Total Sales (Paid orders)
    const salesResult = await db.get("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'Paid'");
    const totalSales = salesResult.total || 0;

    // 2. Total Orders
    const ordersResult = await db.get("SELECT COUNT(*) as count FROM orders");
    const totalOrders = ordersResult.count || 0;

    // 3. Low Stock Alert (Products with stock < 20)
    const lowStockResult = await db.get("SELECT COUNT(*) as count FROM products WHERE stock < 20");
    const lowStockAlerts = lowStockResult.count || 0;

    // 4. Total Customers
    const usersResult = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const totalCustomers = usersResult.count || 0;

    // 5. Category-wise Sales breakdown
    const categorySales = await db.all(`
      SELECT p.category, SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'Paid'
      GROUP BY p.category
    `);

    // 6. Recent Orders list
    const recentOrders = await db.all(`
      SELECT o.id, o.total_amount, o.order_status, o.created_at, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // 7. Stock status breakdown for products
    const stockStatus = await db.all(`
      SELECT name, stock, category FROM products ORDER BY stock ASC LIMIT 5
    `);

    res.json({
      metrics: {
        totalSales,
        totalOrders,
        lowStockAlerts,
        totalCustomers
      },
      categorySales,
      recentOrders,
      stockStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'İstatistikler yüklenirken sunucu hatası oluştu.' });
  }
});

export default router;
