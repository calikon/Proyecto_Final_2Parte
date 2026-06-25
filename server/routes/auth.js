const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'username y password son obligatorios' });
  }

  db.get('SELECT * FROM usuarios WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ message: 'Error de base de datos' });
    if (!user || !bcrypt.compareSync(password, user.passwd)) {
      return res.status(401).json({ message: 'Usuario o contrasena incorrectos' });
    }

    const jwt_token = jwt.sign(
      { user_id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ jwt_token, user_id: user.id });
  });
});

module.exports = router;
