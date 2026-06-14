import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '10k-endustriyel-secret-key-123456';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Erişim engellendi: Token bulunamadı' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }
    req.user = user;
    next();
  });
}

export function authorizeAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Erişim engellendi: Yetkisiz işlem (Yalnızca Admin)' });
    }
    next();
  });
}
