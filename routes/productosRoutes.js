const express = require('express');
const db = require('../database');
const verificarToken = require('../middleware/auth');

const router = express.Router();

// Proteger todas las rutas de productos
router.use(verificarToken);

// Validar los datos de un producto
function validarProducto(datos) {
  const { nombre, precio, stock } = datos || {};

  if (
    typeof nombre !== 'string' ||
    !nombre.trim() ||
    typeof precio !== 'number' ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return false;
  }

  return true;
}

// CREAR PRODUCTO
router.post('/', (req, res) => {
  if (!validarProducto(req.body)) {
    return res.status(400).json({
      error: 'Nombre, precio y stock válidos son obligatorios'
    });
  }

  const { nombre, precio, stock } = req.body;

  db.run(
    'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
    [nombre.trim(), precio, stock],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: 'Error al crear producto'
        });
      }

      res.status(201).json({
        mensaje: 'Producto creado',
        id: this.lastID
      });
    }
  );
});

// LISTAR PRODUCTOS
router.get('/', (req, res) => {
  db.all('SELECT * FROM productos', [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: 'Error al consultar productos'
      });
    }

    res.status(200).json(rows);
  });
});

// BUSCAR PRODUCTO POR ID
router.get('/:id', (req, res) => {
  db.get(
    'SELECT * FROM productos WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          error: 'Error al buscar producto'
        });
      }

      if (!row) {
        return res.status(404).json({
          error: 'Producto no encontrado'
        });
      }

      res.status(200).json(row);
    }
  );
});

// ACTUALIZAR PRODUCTO
router.put('/:id', (req, res) => {
  if (!validarProducto(req.body)) {
    return res.status(400).json({
      error: 'Nombre, precio y stock válidos son obligatorios'
    });
  }

  const { nombre, precio, stock } = req.body;

  db.run(
    `UPDATE productos
     SET nombre = ?, precio = ?, stock = ?
     WHERE id = ?`,
    [nombre.trim(), precio, stock, req.params.id],
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

      res.status(200).json({
        mensaje: 'Producto actualizado'
      });
    }
  );
});

// ELIMINAR PRODUCTO
router.delete('/:id', (req, res) => {
  db.run(
    'DELETE FROM productos WHERE id = ?',
    [req.params.id],
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

      res.status(200).json({
        mensaje: 'Producto eliminado'
      });
    }
  );
});

module.exports = router;
