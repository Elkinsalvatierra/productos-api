require('dotenv').config();

const express = require('express');
require('./database');

const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/productosRoutes');
const favoritosRoutes = require('./routes/favoritosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    mensaje: 'API REST de productos funcionando'
  });
});

// Ruta pública de autenticación
app.use('/auth', authRoutes);

// Rutas protegidas de productos
app.use('/productos', productosRoutes);
app.use('/favoritos', favoritosRoutes);

app.listen(PORT, () => {
  console.log(
    `Servidor ejecutándose en http://localhost:${PORT}`
  );
});
