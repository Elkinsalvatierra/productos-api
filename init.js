require('dotenv').config();

const bcrypt = require('bcrypt');
const db = require('./database');

const nombre = process.env.INIT_NOMBRE;
const correo = process.env.INIT_CORREO?.trim().toLowerCase();
const password = process.env.INIT_PASSWORD;

// Cinco productos iniciales
const productosIniciales = [
  {
    nombre: 'Laptop Lenovo IdeaPad',
    descripcion: 'Laptop para estudio y trabajo',
    categoria: 'Tecnología',
    precio: 650
  },
  {
    nombre: 'Mouse Logitech M170',
    descripcion: 'Mouse inalámbrico USB',
    categoria: 'Accesorios',
    precio: 15
  },
  {
    nombre: 'Teclado mecánico Redragon',
    descripcion: 'Teclado mecánico para computadora',
    categoria: 'Accesorios',
    precio: 45
  },
  {
    nombre: 'Monitor Samsung 24 pulgadas',
    descripcion: 'Monitor Full HD para computadora',
    categoria: 'Tecnología',
    precio: 180
  },
  {
    nombre: 'Audífonos JBL Tune',
    descripcion: 'Audífonos para escuchar música',
    categoria: 'Audio',
    precio: 35
  }
];

// Función para consultar datos
function consultar(sql, parametros = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, parametros, (err, resultado) => {
      if (err) reject(err);
      else resolve(resultado);
    });
  });
}

// Función para insertar datos
function ejecutar(sql, parametros = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, parametros, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Crear administrador si no existe
async function crearAdministrador() {
  if (!nombre || !correo || !password) {
    throw new Error(
      'Faltan INIT_NOMBRE, INIT_CORREO o INIT_PASSWORD en el archivo .env'
    );
  }

  const existente = await consultar(
    'SELECT id FROM usuarios WHERE correo = ?',
    [correo]
  );

  if (existente) {
    console.log('El administrador ya existe.');
    return;
  }

  const hash = await bcrypt.hash(password, 12);

  const resultado = await ejecutar(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol)
     VALUES (?, ?, ?, ?)`,
    [nombre.trim(), correo, hash, 'admin']
  );

  console.log('Administrador creado correctamente.');
  console.log('ID:', resultado.lastID);
  console.log('Correo:', correo);
  console.log('Rol: admin');
}

// Insertar productos sin duplicarlos
async function crearProductos() {
  for (const producto of productosIniciales) {
    const existente = await consultar(
      'SELECT id FROM productos WHERE nombre = ? LIMIT 1',
      [producto.nombre]
    );

    if (existente) {
      console.log('Producto ya existente:', producto.nombre);
      continue;
    }

    const resultado = await ejecutar(
      `INSERT INTO productos
       (nombre, descripcion, categoria, precio)
       VALUES (?, ?, ?, ?)`,
      [
        producto.nombre,
        producto.descripcion,
        producto.categoria,
        producto.precio
      ]
    );

    console.log(
      'Producto creado:',
      producto.nombre,
      '| ID:',
      resultado.lastID
    );
  }
}

// Inicializar el proyecto
async function inicializar() {
  try {
    await crearAdministrador();
    await crearProductos();

    console.log('\nInicialización completada correctamente.');
  } catch (error) {
    console.error('Error al inicializar:', error.message);
    process.exitCode = 1;
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
      }
    });
  }
}

inicializar();
