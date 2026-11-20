const express = require('express');
const db = require('../database');
const verificarToken = require('../middleware/auth');

const router = express.Router();

// Todas las rutas de favoritos requieren autenticación
router.use(verificarToken);

// AGREGAR PRODUCTO A FAVORITOS
router.post('/', (req, res) => {
  const productoId = Number(req.body?.productoId);
  const usuarioId = req.usuario.id;

  if (!Number.isInteger(productoId) || productoId <= 0) {
    return res.status(400).json({
      error: 'ID de producto inválido'
    });
  }

  // Comprobar que el producto exista
  db.get(
    'SELECT id FROM productos WHERE id = ?',
    [productoId],
    (err, producto) => {
      if (err) {
        return res.status(500).json({
          error: 'Error al consultar el producto'
        });
      }

      if (!producto) {
        return res.status(404).json({
          error: 'Producto no encontrado'
        });
      }

      // Registrar el favorito
      db.run(
        'INSERT INTO favoritos (usuario_id, producto_id) VALUES (?, ?)',
        [usuarioId, productoId],
        function (err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
              return res.status(409).json({
                error: 'Este producto ya está en tus favoritos'
              });
            }

            return res.status(500).json({
              error: 'Error al agregar favorito'
            });
          }

          return res.status(201).json({
            mensaje: 'Producto agregado a favoritos',
            id: this.lastID,
            productoId
          });
        }
      );
    }
  );
});

// LISTAR FAVORITOS DEL USUARIO AUTENTICADO
router.get('/', (req, res) => {
  const usuarioId = req.usuario.id;

  db.all(
    `SELECT
       productos.id,
       productos.nombre,
       productos.descripcion,
       productos.categoria,
       productos.precio
     FROM favoritos
     INNER JOIN productos
       ON favoritos.producto_id = productos.id
     WHERE favoritos.usuario_id = ?`,
    [usuarioId],
    (err, favoritos) => {
      if (err) {
        return res.status(500).json({
          error: 'Error al consultar favoritos'
        });
      }

      return res.status(200).json(favoritos);
    }
  );
});

// ELIMINAR PRODUCTO DE FAVORITOS
router.delete('/:productoId', (req, res) => {
  const productoId = Number(req.params.productoId);
  const usuarioId = req.usuario.id;

  if (!Number.isInteger(productoId) || productoId <= 0) {
    return res.status(400).json({
      error: 'ID de producto inválido'
    });
  }

  db.run(
    `DELETE FROM favoritos
     WHERE usuario_id = ? AND producto_id = ?`,
    [usuarioId, productoId],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: 'Error al eliminar favorito'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'El producto no está en tus favoritos'
        });
      }

      return res.status(200).json({
        mensaje: 'Producto eliminado de favoritos'
      });
    }
  );
});

module.exports = router;
