const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

const USERS = [
  { username: 'alice', password: 'alice123', nombre: 'Alice' },
  { username: 'bob', password: 'bob123', nombre: 'Bob' },
  { username: 'carol', password: 'carol123', nombre: 'Carol' },
  { username: 'roque', password: 'roque123', nombre: 'Roque' },
  { username: 'pablo', password: 'pablo123', nombre: 'Pablo' },
];

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function seed() {
  await exec(schema);

  const userIds = {};
  for (const u of USERS) {
    const hash = bcrypt.hashSync(u.password, 10);
    const result = await run(
      'INSERT INTO usuarios (username, passwd, nombre) VALUES (?, ?, ?)',
      [u.username, hash, u.nombre]
    );
    userIds[u.username] = result.lastID;
  }

  const tuit1 = await run(
    'INSERT INTO tuits (usuario_id, texto) VALUES (?, ?)',
    [userIds.alice, '¡Hola MiniTwitter! Este es mi primer tuit.']
  );
  const tuit2 = await run(
    'INSERT INTO tuits (usuario_id, texto, media_type, media_url) VALUES (?, ?, ?, ?)',
    [userIds.bob, 'Mirad este vídeo de YouTube', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ']
  );
  const tuit3 = await run(
    'INSERT INTO tuits (usuario_id, texto) VALUES (?, ?)',
    [userIds.carol, 'Probando la nueva práctica final de Laboratorio de Ingeniería del Software.']
  );

  await run(
    'INSERT INTO tuits (usuario_id, texto, parent_id) VALUES (?, ?, ?)',
    [userIds.bob, '¡Bienvenida, Alice!', tuit1.lastID]
  );

  await run('INSERT INTO likes (usuario_id, tuit_id) VALUES (?, ?)', [userIds.bob, tuit1.lastID]);
  await run('INSERT INTO likes (usuario_id, tuit_id) VALUES (?, ?)', [userIds.carol, tuit1.lastID]);
  await run('INSERT INTO retuits (usuario_id, tuit_id) VALUES (?, ?)', [userIds.alice, tuit2.lastID]);
  await run('INSERT INTO likes (usuario_id, tuit_id) VALUES (?, ?)', [userIds.alice, tuit3.lastID]);

  console.log('Seed completado: usuarios alice/bob/carol/roque/pablo (passwd = "<username>123").');
  db.close();
}

seed().catch((err) => {
  console.error('Error en el seed:', err);
  db.close();
  process.exit(1);
});
