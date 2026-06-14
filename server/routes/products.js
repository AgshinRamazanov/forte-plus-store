import express from 'express';
import { getDatabase } from '../db.js';
import { authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get All Products (with filtering & sorting)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice } = req.query;
    const db = await getDatabase();
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      query += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }

    // Sort mappings
    if (sort) {
      switch (sort) {
        case 'price_asc':
          query += ' ORDER BY price ASC';
          break;
        case 'price_desc':
          query += ' ORDER BY price DESC';
          break;
        case 'newest':
          query += ' ORDER BY created_at DESC';
          break;
        default:
          query += ' ORDER BY id ASC';
      }
    } else {
      query += ' ORDER BY id ASC';
    }

    const products = await db.all(query, params);
    
    // Parse features field from JSON string to array
    const formattedProducts = products.map(p => ({
      ...p,
      features: p.features ? JSON.parse(p.features) : []
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ürünler listelenirken sunucu hatası oluştu.' });
  }
});

// Get Single Product & Reviews
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }

    const reviews = await db.all('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [req.params.id]);

    const formattedProduct = {
      ...product,
      features: product.features ? JSON.parse(product.features) : [],
      reviews
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ürün detayı alınırken sunucu hatası oluştu.' });
  }
});

// Create Product (Admin Only)
router.post('/', authorizeAdmin, async (req, res) => {
  try {
    const { name, description, price, image_url, category, stock, features } = req.body;
    if (!name || !description || price === undefined || !image_url || !category || stock === undefined) {
      return res.status(400).json({ message: 'Tüm zorunlu alanlar doldurulmalıdır.' });
    }

    const db = await getDatabase();
    const result = await db.run(
      'INSERT INTO products (name, description, price, image_url, category, stock, features) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        description,
        parseFloat(price),
        image_url,
        category,
        parseInt(stock),
        features ? JSON.stringify(features) : JSON.stringify([])
      ]
    );

    res.status(201).json({
      id: result.lastID,
      name,
      description,
      price,
      image_url,
      category,
      stock,
      features: features || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ürün eklenirken sunucu hatası oluştu.' });
  }
});

// Update Product (Admin Only)
router.put('/:id', authorizeAdmin, async (req, res) => {
  try {
    const { name, description, price, image_url, category, stock, features } = req.body;
    const db = await getDatabase();
    
    const existing = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ message: 'Güncellenecek ürün bulunamadı.' });
    }

    await db.run(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, image_url = ?, category = ?, stock = ?, features = ?
       WHERE id = ?`,
      [
        name || existing.name,
        description || existing.description,
        price !== undefined ? parseFloat(price) : existing.price,
        image_url || existing.image_url,
        category || existing.category,
        stock !== undefined ? parseInt(stock) : existing.stock,
        features ? JSON.stringify(features) : existing.features,
        req.params.id
      ]
    );

    const updated = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({
      ...updated,
      features: updated.features ? JSON.parse(updated.features) : []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ürün güncellenirken sunucu hatası oluştu.' });
  }
});

// Delete Product (Admin Only)
router.delete('/:id', authorizeAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Silinecek ürün bulunamadı.' });
    }

    res.json({ message: 'Ürün başarıyla silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ürün silinirken sunucu hatası oluştu.' });
  }
});

export default router;
