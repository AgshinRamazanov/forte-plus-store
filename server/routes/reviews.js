import express from 'express';
import { getDatabase } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Submit Product Review
router.post('/products/:id/reviews', authenticateToken, async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  if (rating === undefined || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Lütfen 1-5 arasında bir puan veriniz.' });
  }

  const db = await getDatabase();

  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }

    // Check if user has already reviewed this product
    const existingReview = await db.get(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [productId, req.user.id]
    );

    if (existingReview) {
      // Update review
      await db.run(
        `UPDATE reviews 
         SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [rating, comment, existingReview.id]
      );
      return res.json({ message: 'Değerlendirmeniz güncellendi.' });
    }

    // Insert new review
    await db.run(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [productId, req.user.id, req.user.name, rating, comment]
    );

    res.status(201).json({ message: 'Değerlendirmeniz başarıyla eklendi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Değerlendirme kaydedilirken sunucu hatası oluştu.' });
  }
});

export default router;
