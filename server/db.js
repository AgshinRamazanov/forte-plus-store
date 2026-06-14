import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');

let db = null;

export async function getDatabase() {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await initializeSchema();
  return db;
}

async function initializeSchema() {
  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  // Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      features TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      shipping_address TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'Pending',
      order_status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Order Items Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    )
  `);

  // Reviews Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Seed default data if users table is empty
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['10K Admin', 'admin@10kendustriyel.com', adminPassword, 'admin']
    );

    await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Standard Customer', 'customer@10kendustriyel.com', customerPassword, 'customer']
    );
  }

  // Seed products if products table is empty
  const productCount = await db.get('SELECT COUNT(*) as count FROM products');
  if (productCount.count === 0) {
    const defaultProducts = [
      {
        name: '10K Endüstriyel Espresso Makinesi Temizleme Tableti (100x2.5g)',
        description: 'Kahve makinelerinizin grup başlıkları, solenoid valfleri ve su yollarını kahve yağları ve kireç tortularından arındırmak için özel olarak üretilmiştir. Her tablet 2.5 gramdır.',
        price: 450,
        image_url: '/products/WhatsApp Image 2026-06-13 at 21.40.28.jpeg',
        category: 'Coffee Care',
        stock: 85,
        features: JSON.stringify(['2.5g ideal tablet boyutu', 'Kahve yağlarını söker', 'Makine ömrünü uzatır', 'Tüm espresso makinelerine uygun'])
      },
      {
        name: '10K Endüstriyel Endüstriyel Fırın Yıkama Tableti (100 Adet)',
        description: 'Profesyonel endüstriyel fırınlar için geliştirilmiş ultra güçlü temizleme ve yağ sökücü tablet. Yanmış katı yağları ve karbonlaşmış kalıntıları zahmetsizce çözer.',
        price: 1250,
        image_url: '/products/WhatsApp Image 2026-06-13 at 21.40.41 (2).jpeg',
        category: 'Industrial Care',
        stock: 20,
        features: JSON.stringify(['Profesyonel mutfaklar için', 'Katı yağ ve yanık kirlerini söker', 'Kolay suda çözünür', 'Yoğun temizleme gücü'])
      },
      {
        name: '10K Endüstriyel Endüstriyel Durulama Tableti (120 Adet)',
        description: 'Endüstriyel fırınlar ve konveksiyonel pişiriciler için asidik durulama ve kireç önleyici tablet. Hızlı kuruma sağlar ve paslanmaz çelik yüzeylerin parlamasına yardımcı olur.',
        price: 1400,
        image_url: '/products/WhatsApp Image 2026-06-13 at 21.40.41 (2).jpeg', // sharing same product illustration image
        category: 'Industrial Care',
        stock: 15,
        features: JSON.stringify(['Nötralize edici formül', 'Kireç lekesini önler', 'Yüzeyleri parlatır', '120 adet ekonomik paket'])
      },
      {
        name: '10K Endüstriyel Sıvı Kahve Makinesi Temizleyici (900ml)',
        description: 'Kahve makinelerinin süt köpürtücü pipetleri, süt sürahileri ve buhar çubuklarında biriken süt kalıntılarını ve bakterileri sökmek için formüle edilmiş konsantre sıvı temizleyici.',
        price: 350,
        image_url: '/products/WhatsApp Image 2026-06-13 at 21.40.42 (3).jpeg',
        category: 'Coffee Care',
        stock: 50,
        features: JSON.stringify(['900ml Konsantre sıvı', 'Süt taşı ve kalıntılarını söker', 'Bakterileri giderir', 'Hafif durulama gerektirir'])
      },
      {
        name: '10K Endüstriyel Kireç Çözücü Sıvı (1000ml)',
        description: 'Tüm espresso makineleri, filtre kahve makineleri ve çaydanlıklar için etkili kireç çözücü solüsyon. Düzenli kullanım ısıtıcı rezistansı korur ve enerji verimliliği sağlar.',
        price: 280,
        image_url: '/products/WhatsApp Image 2026-06-14T11:12:06Z', // wait, let's keep original image url: /products/WhatsApp Image 2026-06-13 at 21.40.42 (2).jpeg
        image_url: '/products/WhatsApp Image 2026-06-13 at 21.40.42 (2).jpeg',
        category: 'Coffee Care',
        stock: 90,
        features: JSON.stringify(['1 Litre şişe', 'Rezistans koruyucu', 'Enerji tasarrufu sağlar', 'Hızlı reaksiyon formülü'])
      },
      {
        name: '10K Endüstriyel Süper Yağ Çözücü Sprey (750ml)',
        description: 'Mutfak tezgahları, ocaklar, aspiratörler ve fırın dış yüzeylerindeki en inatçı donmuş yağ lekelerini anında nüfuz ederek söken sprey formüllü yağ çözücü.',
        price: 180,
        image_url: '/products/WhatsApp Image 2026-06-13 at 21.40.41 (4).jpeg',
        category: 'Household Care',
        stock: 110,
        features: JSON.stringify(['750ml Sprey başlık', 'Anında etki', 'Mutfak genel temizliği', 'Hoş kokulu'])
      }
    ];

    for (const p of defaultProducts) {
      await db.run(
        'INSERT INTO products (name, description, price, image_url, category, stock, features) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.description, p.price, p.image_url, p.category, p.stock, p.features]
      );
    }
  }
}
