import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || '10k-endustriyel-secret-key-123456';

// Register Customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
    }

    const db = await getDatabase();
    
    // Check email uniqueness
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase(), hashedPassword, 'customer']
    );

    const token = jwt.sign(
      { id: result.lastID, email: email.toLowerCase(), name, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: result.lastID, name, email: email.toLowerCase(), role: 'customer' }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre zorunludur.' });
    }

    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz e-posta adresi veya şifre.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz e-posta adresi veya şifre.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});

// Get current user context
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const user = await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});

export default router;
