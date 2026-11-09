
const bcrypt = require('bcrypt');
const db = require('./database');

const usuario = process.env.INIT_USER;
const password = process.env.INIT_PASSWORD;

if (!usuario || !password) {
  console.error('Faltan INIT_USER o INIT_PASSWORD');
  process.exit(1);
}

async function inicializar() {
  try {
    const hash = await bcrypt.hash(password, 12);

    db.run(
      'INSERT INTO usuarios (usuario, password_hash) VALUES (?, ?)',
      [usuario, hash],
      function (err) {
        if (err) {
          console.error('No se pudo crear el usuario:', err.message);
        } else {
          console.log('Usuario de prueba creado correctamente');
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('Error al generar el hash:', error.message);
    db.close();
  }
}

inicializar();
