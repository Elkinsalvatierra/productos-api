const express = require('express');
const db = require('../database');
const verificarToken = require('../middleware/auth');
const verificarRol = require('../middleware/roles');

const router = express.Router();

// VALIDAR LOS DATOS DEL PRODUCTO
function validarProducto(datos) {
  const { nombre, descripcion, categoria, precio } = datos || {};

  return (
    typeof nombre === 'string' &&
    nombre.trim().length > 0 &&
    typeof descripcion === 'string' &&
    descripcion.trim().length > 0 &&
    typeof categoria === 'string' &&
    categoria.trim().length > 0 &&
    typeof precio === 'number' &&
    Number.isFinite(precio) &&
    precio > 0
  );
}

// LISTAR PRODUCTOS (PÚBLICO)
router.get('/', (req, res) => {
  const { categoria } = req.query;

  let sql = 'SELECT * FROM productos';
  let parametros = [];

  if (categoria) {
    sql += ' WHERE LOWER(categoria) = LOWER(?)';
    parametros.push(categoria.trim());
  }

  db.all(sql, parametros, (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: 'Error al consultar productos'
      });
    }

    return res.status(200).json(rows);
  });
});

// BUSCAR PRODUCTO POR ID (PÚBLICO)
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'ID de producto inválido'
    });
  }

  db.get(
    'SELECT * FROM productos WHERE id = ?',
    [id],
    (err, producto) => {
      if (err) {
        return res.status(500).json({
          error: 'Error al buscar producto'
        });
      }

      if (!producto) {
        return res.status(404).json({
          error: 'Producto no encontrado'
        });
      }

      return res.status(200).json(producto);
    }
  );
});

// CREAR PRODUCTO (SOLO ADMIN)
router.post(
  '/',
  verificarToken,
  verificarRol('admin'),
  (req, res) => {
    if (!validarProducto(req.body)) {
      return res.status(400).json({
        error: 'Nombre, descripción, categoría y precio mayor que cero son obligatorios'
      });
    }

    const { nombre, descripcion, categoria, precio } = req.body;

    db.run(
      `INSERT INTO productos (nombre, descripcion, categoria, precio)
       VALUES (?, ?, ?, ?)`,
      [
        nombre.trim(),
        descripcion.trim(),
        categoria.trim(),
        precio
      ],
      function (err) {
        if (err) {
          return res.status(500).json({
            error: 'Error al crear producto'
          });
        }

        return res.status(201).json({
          mensaje: 'Producto creado correctamente',
          id: this.lastID
        });
      }
    );
  }
);

// ACTUALIZAR PRODUCTO (SOLO ADMIN)
router.put(
  '/:id',
  verificarToken,
  verificarRol('admin'),
  (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID de producto inválido'
      });
    }

    if (!validarProducto(req.body)) {
      return res.status(400).json({
        error: 'Nombre, descripción, categoría y precio mayor que cero son obligatorios'
      });
    }

    const { nombre, descripcion, categoria, precio } = req.body;

    db.run(
      `UPDATE productos
       SET nombre = ?, descripcion = ?, categoria = ?, precio = ?
       WHERE id = ?`,
      [
        nombre.trim(),
        descripcion.trim(),
        categoria.trim(),
        precio,
        id
      ],
      function (err) {
        if (err) {
          return res.status(500).json({
            error: 'Error al actualizar producto'
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            error: 'Producto no encontrado'
          });
        }

        return res.status(200).json({
          mensaje: 'Producto actualizado correctamente'
        });
      }
    );
  }
);

// ELIMINAR PRODUCTO (SOLO ADMIN)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('admin'),
  (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID de producto inválido'
      });
    }

    db.run(
      'DELETE FROM productos WHERE id = ?',
      [id],
      function (err) {
        if (err) {
          return res.status(500).json({
            error: 'Error al eliminar producto'
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            error: 'Producto no encontrado'
          });
        }

        return res.status(200).json({
          mensaje: 'Producto eliminado correctamente'
        });
      }
    );
  }
);

module.exports = router;
