-- Esquema de base de datos de MiniTwitter (SQLite)
-- Las respuestas se modelan como tuits con parent_id, sin tabla aparte.

CREATE TABLE IF NOT EXISTS usuarios (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  passwd   TEXT NOT NULL,
  nombre   TEXT,
  avatar   TEXT
);

CREATE TABLE IF NOT EXISTS tuits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  texto      TEXT NOT NULL,
  media_type TEXT,
  media_url  TEXT,
  parent_id  INTEGER,
  fecha      TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (parent_id)  REFERENCES tuits(id)
);

CREATE TABLE IF NOT EXISTS likes (
  usuario_id INTEGER NOT NULL,
  tuit_id    INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, tuit_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (tuit_id)    REFERENCES tuits(id)
);

CREATE TABLE IF NOT EXISTS retuits (
  usuario_id INTEGER NOT NULL,
  tuit_id    INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, tuit_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (tuit_id)    REFERENCES tuits(id)
);

CREATE INDEX IF NOT EXISTS idx_tuits_usuario  ON tuits(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tuits_parent   ON tuits(parent_id);
CREATE INDEX IF NOT EXISTS idx_tuits_fecha    ON tuits(fecha);
