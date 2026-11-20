const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  path.join(__dirname, 'productos.db'),
  (err) => {
    if (err) {
      console.error('Error al conectar SQLite:', err.message);
    } else {
      console.log('Base de datos SQLite conectada');
    }
  }
);

// Activar las claves foráneas
db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {

  // TABLA USUARIOS
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'usuario'
        CHECK (rol IN ('usuario', 'admin'))
    )
  `);

  // TABLA PRODUCTOS
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      categoria TEXT NOT NULL,
      precio REAL NOT NULL CHECK (precio > 0)
    )
  `);

  // TABLA FAVORITOS
  db.run(`
    CREATE TABLE IF NOT EXISTS favoritos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,

      FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

      FOREIGN KEY (producto_id)
        REFERENCES productos(id)
        ON DELETE CASCADE,

      UNIQUE (usuario_id, producto_id)
    )
  `);

  console.log('Tablas verificadas correctamente');
});

module.exports = db;
