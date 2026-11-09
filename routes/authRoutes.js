
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();

router.post('/login', (req, res) => {
  const { usuario, password } = req.body || {};

  if (!usuario || !password) {
    return res.status(400).json({
      error: 'Usuario y contraseña obligatorios'
    });
  }

  db.get(
    'SELECT * FROM usuarios WHERE usuario = ?',
    [usuario],
    async (err, user) => {
      if (err) {
        return res.status(500).json({
          error: 'Error de base de datos'
        });
      }

      if (!user) {
        return res.status(401).json({
          error: 'Credenciales incorrectas'
        });
      }

      try {
        const valido = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!valido) {
          return res.status(401).json({
            error: 'Credenciales incorrectas'
          });
        }

        if (!process.env.JWT_SECRET) {
          return res.status(500).json({
            error: 'Configuración JWT incompleta'
          });
        }

        const token = jwt.sign(
          { id: user.id, usuario: user.usuario },
          process.env.JWT_SECRET,
          { expiresIn: '1h', algorithm: 'HS256' }
        );

        res.status(200).json({
          mensaje: 'Inicio de sesión exitoso',
          token,
          expiresIn: '1h'
        });
      } catch (error) {
        res.status(500).json({
          error: 'Error al procesar el login'
        });
      }
    }
  );
});

module.exports = router;
