require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();

// REGISTRO DE USUARIOS
router.post('/registro', async (req, res) => {
  const { nombre, correo, password } = req.body || {};

  // Validar los datos recibidos
  if (
    typeof nombre !== 'string' ||
    !nombre.trim() ||
    typeof correo !== 'string' ||
    !correo.trim() ||
    typeof password !== 'string' ||
    password.length < 8
  ) {
    return res.status(400).json({
      error: 'Nombre, correo y contraseña (mínimo 8 caracteres) son obligatorios'
    });
  }

  const correoNormalizado = correo.trim().toLowerCase();

  try {
    // Comprobar si el correo ya está registrado
    db.get(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correoNormalizado],
      async (err, usuarioExistente) => {
        if (err) {
          return res.status(500).json({
            error: 'Error al consultar la base de datos'
          });
        }

        if (usuarioExistente) {
          return res.status(409).json({
            error: 'El correo ya está registrado'
          });
        }

        try {
          // Cifrar la contraseña
          const hash = await bcrypt.hash(password, 12);

          // Crear siempre un usuario con rol usuario
          db.run(
            `INSERT INTO usuarios (nombre, correo, password_hash, rol)
             VALUES (?, ?, ?, ?)`,
            [nombre.trim(), correoNormalizado, hash, 'usuario'],
            function (err) {
              if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                  return res.status(409).json({
                    error: 'El correo ya está registrado'
                  });
                }

                return res.status(500).json({
                  error: 'Error al registrar el usuario'
                });
              }

              return res.status(201).json({
                mensaje: 'Usuario registrado correctamente',
                usuario: {
                  id: this.lastID,
                  nombre: nombre.trim(),
                  correo: correoNormalizado,
                  rol: 'usuario'
                }
              });
            }
          );
        } catch (error) {
          return res.status(500).json({
            error: 'Error al cifrar la contraseña'
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      error: 'Error al procesar el registro'
    });
  }
});

// INICIO DE SESIÓN
router.post('/login', (req, res) => {
  const { correo, password } = req.body || {};

  if (
    typeof correo !== 'string' ||
    !correo.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    return res.status(400).json({
      error: 'Correo y contraseña son obligatorios'
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      error: 'Configuración JWT incompleta'
    });
  }

  const correoNormalizado = correo.trim().toLowerCase();

  db.get(
    `SELECT id, nombre, correo, password_hash, rol
     FROM usuarios
     WHERE correo = ?`,
    [correoNormalizado],
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

        // Crear JWT con identidad y rol del usuario
        const token = jwt.sign(
          {
            id: user.id,
            correo: user.correo,
            rol: user.rol
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1h',
            algorithm: 'HS256'
          }
        );

        return res.status(200).json({
          mensaje: 'Inicio de sesión exitoso',
          token,
          expiresIn: '1h',
          usuario: {
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            rol: user.rol
          }
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Error al procesar el inicio de sesión'
        });
      }
    }
  );
});

module.exports = router;
