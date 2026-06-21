const express = require('express');
const db = require('../db/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const TUIT_SELECT = `
  SELECT
    t.id, t.texto, t.media_type, t.media_url, t.parent_id, t.fecha,
    u.id   AS usuario_id,
    u.username,
    (SELECT COUNT(*) FROM likes   l WHERE l.tuit_id = t.id) AS num_likes,
    (SELECT COUNT(*) FROM retuits r WHERE r.tuit_id = t.id) AS num_retuits,
    (SELECT COUNT(*) FROM tuits   c WHERE c.parent_id = t.id) AS num_respuestas,
    EXISTS(SELECT 1 FROM likes   l WHERE l.tuit_id = t.id AND l.usuario_id = ?) AS liked,
    EXISTS(SELECT 1 FROM retuits r WHERE r.tuit_id = t.id AND r.usuario_id = ?) AS retuiteado
  FROM tuits t
  JOIN usuarios u ON u.id = t.usuario_id
`;

router.get('/tuits', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;

  const sql = `${TUIT_SELECT}
    WHERE t.parent_id IS NULL
    ORDER BY t.fecha DESC
    LIMIT ? OFFSET ?`;

  db.all(sql, [req.userId, req.userId, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error de base de datos' });
    res.json(rows.map(normalizeTuit));
  });
});

router.post('/tuit', (req, res) => {
  const { texto, media_type, media_url } = req.body;

  if (!texto || !texto.trim()) {
    return res.status(400).json({ message: 'El texto es obligatorio' });
  }
  if (texto.length > 300) {
    return res.status(400).json({ message: 'El texto no puede superar los 300 caracteres' });
  }

  db.run(
    'INSERT INTO tuits (usuario_id, texto, media_type, media_url) VALUES (?, ?, ?, ?)',
    [req.userId, texto.trim(), media_type || null, media_url || null],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error de base de datos' });
      db.get(`${TUIT_SELECT} WHERE t.id = ?`, [req.userId, req.userId, this.lastID], (err2, row) => {
        if (err2) return res.status(500).json({ message: 'Error de base de datos' });
        res.status(201).json(normalizeTuit(row));
      });
    }
  );
});

router.get('/tuit/:id', (req, res) => {
  db.get(`${TUIT_SELECT} WHERE t.id = ?`, [req.userId, req.userId, req.params.id], (err, row) => {
    if (err) return res.status(500).json({ message: 'Error de base de datos' });
    if (!row) return res.status(404).json({ message: 'Tuit no encontrado' });
    res.json(normalizeTuit(row));
  });
});

router.get('/usuario/:username/tuits', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;

  const sql = `${TUIT_SELECT}
    WHERE u.username = ? AND t.parent_id IS NULL
    ORDER BY t.fecha DESC
    LIMIT ? OFFSET ?`;

  db.all(sql, [req.userId, req.userId, req.params.username, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error de base de datos' });
    res.json(rows.map(normalizeTuit));
  });
});

router.get('/tuit/:id/respuestas', (req, res) => {
  const sql = `${TUIT_SELECT}
    WHERE t.parent_id = ?
    ORDER BY t.fecha ASC`;

  db.all(sql, [req.userId, req.userId, req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error de base de datos' });
    res.json(rows.map(normalizeTuit));
  });
});

router.post('/tuit/:id/responder', (req, res) => {
  const { texto, media_type, media_url } = req.body;

  if (!texto || !texto.trim()) {
    return res.status(400).json({ message: 'El texto es obligatorio' });
  }
  if (texto.length > 300) {
    return res.status(400).json({ message: 'El texto no puede superar los 300 caracteres' });
  }

  db.get('SELECT id FROM tuits WHERE id = ?', [req.params.id], (err, parent) => {
    if (err) return res.status(500).json({ message: 'Error de base de datos' });
    if (!parent) return res.status(404).json({ message: 'Tuit no encontrado' });

    db.run(
      'INSERT INTO tuits (usuario_id, texto, media_type, media_url, parent_id) VALUES (?, ?, ?, ?, ?)',
      [req.userId, texto.trim(), media_type || null, media_url || null, parent.id],
      function (err2) {
        if (err2) return res.status(500).json({ message: 'Error de base de datos' });
        db.get(`${TUIT_SELECT} WHERE t.id = ?`, [req.userId, req.userId, this.lastID], (err3, row) => {
          if (err3) return res.status(500).json({ message: 'Error de base de datos' });
          res.status(201).json(normalizeTuit(row));
        });
      }
    );
  });
});

router.delete('/tuit/:id', (req, res) => {
  db.get('SELECT usuario_id FROM tuits WHERE id = ?', [req.params.id], (err, tuit) => {
    if (err) return res.status(500).json({ message: 'Error de base de datos' });
    if (!tuit) return res.status(404).json({ message: 'Tuit no encontrado' });
    if (tuit.usuario_id !== req.userId) {
      return res.status(403).json({ message: 'Solo puedes borrar tus propios tuits' });
    }

    db.get('SELECT COUNT(*) AS n FROM tuits WHERE parent_id = ?', [req.params.id], (err2, row) => {
      if (err2) return res.status(500).json({ message: 'Error de base de datos' });
      if (row.n > 0) {
        return res.status(409).json({ message: 'No se puede borrar un tuit con respuestas' });
      }

      db.run('DELETE FROM tuits WHERE id = ?', [req.params.id], (err3) => {
        if (err3) return res.status(500).json({ message: 'Error de base de datos' });
        res.status(204).end();
      });
    });
  });
});

router.put('/tuit/:id/like', (req, res) => {
  db.run(
    'INSERT OR IGNORE INTO likes (usuario_id, tuit_id) VALUES (?, ?)',
    [req.userId, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error de base de datos' });
      res.status(204).end();
    }
  );
});

router.delete('/tuit/:id/like', (req, res) => {
  db.run(
    'DELETE FROM likes WHERE usuario_id = ? AND tuit_id = ?',
    [req.userId, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error de base de datos' });
      res.status(204).end();
    }
  );
});

router.put('/tuit/:id/retuit', (req, res) => {
  db.run(
    'INSERT OR IGNORE INTO retuits (usuario_id, tuit_id) VALUES (?, ?)',
    [req.userId, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error de base de datos' });
      res.status(204).end();
    }
  );
});

router.delete('/tuit/:id/retuit', (req, res) => {
  db.run(
    'DELETE FROM retuits WHERE usuario_id = ? AND tuit_id = ?',
    [req.userId, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error de base de datos' });
      res.status(204).end();
    }
  );
});

function normalizeTuit(row) {
  return {
    ...row,
    liked: !!row.liked,
    retuiteado: !!row.retuiteado,
  };
}

module.exports = router;
