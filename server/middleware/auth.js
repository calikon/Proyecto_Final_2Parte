const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.user_id;
    req.username = payload.username;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalido o caducado' });
  }
}

module.exports = requireAuth;
