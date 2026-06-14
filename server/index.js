import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDatabase } from './db.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import reviewsRouter from './routes/reviews.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api', reviewsRouter); // mounts POST /api/products/:id/reviews
app.use('/api/admin', adminRouter);

// Serve product images from the Vite public folder during development
// In production, the built assets will be served
app.use('/products', express.static(path.join(__dirname, '../public/products')));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Sunucuda beklenmeyen bir hata oluştu.' });
});

// Initialize DB and start server
async function startServer() {
  try {
    console.log('Veritabanı başlatılıyor...');
    await getDatabase();
    console.log('Veritabanı başarıyla başlatıldı ve tohumlandı.');
    
    app.listen(PORT, () => {
      console.log(`Express API Sunucusu http://localhost:${PORT} portunda çalışıyor.`);
    });
  } catch (error) {
    console.error('Sunucu başlatılamadı:', error);
    process.exit(1);
  }
}

startServer();
