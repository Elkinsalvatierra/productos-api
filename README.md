# API REST de Productos
API REST desarrollada con Node.js, Express y SQLite, que permite administrar productos, registrar usuarios, autenticar mediante JWT y gestionar listas personales de favoritos.

## Tecnologías utilizadas
- Node.js
- Express
- SQLite
- bcrypt
- JSON Web Token (JWT)
- dotenv
- Postman

## Requisitos
- Node.js instalado.
- npm instalado.

## Instalación
1. Clonar el repositorio:
   git clone https://github.com/Elkinsalvatierra/api-productos.git

2. Entrar en la carpeta:
   cd api-productos

3. Instalar las dependencias:
   npm install

4. Crear un archivo `.env` tomando como referencia `.env.example`.

5. Configurar las variables de entorno con valores propios y seguros.

## Inicialización de la base de datos
Ejecutar:

npm run init

Este comando crea el administrador inicial y registra cinco productos de ejemplo.

## Ejecutar el servidor
npm start

La API estará disponible en:

http://localhost:3000

## Endpoints principales

### Autenticación
| Método | Endpoint | Descripción |
|---|---|---|
| POST | /auth/registro | Registrar usuario |
| POST | /auth/login | Iniciar sesión |

### Productos
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET | /productos | Listar productos | Público |
| GET | /productos/:id | Consultar producto | Público |
| POST | /productos | Crear producto | Administrador |
| PUT | /productos/:id | Actualizar producto | Administrador |
| DELETE | /productos/:id | Eliminar producto | Administrador |

### Favoritos
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET | /favoritos | Listar favoritos propios | Autenticado |
| POST | /favoritos | Agregar favorito | Autenticado |
| DELETE | /favoritos/:productoId | Eliminar favorito propio | Autenticado |

## Autenticación y seguridad
- Las contraseñas se almacenan mediante hashes con bcrypt.

- La autenticación utiliza tokens JWT con expiración de una hora.

- Las rutas administrativas requieren el rol `admin`.

- Los usuarios normales no pueden administrar productos.

- Cada usuario solamente puede consultar y eliminar sus propios favoritos.

- No se permiten favoritos duplicados.

Para las rutas protegidas se debe enviar el encabezado:

Authorization: Bearer TU_TOKEN_JWT

## Códigos de respuesta
| Código | Significado |
|---|---|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 400 | Datos incorrectos |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Recurso no encontrado |
| 409 | Conflicto o registro duplicado |
| 500 | Error interno |

## Estructura del proyecto
api-productos/
- middleware/
         auth.js
         roles.js 
- routes/
         authRoutes.js
         favoritosRoutes.js
         productosRoutes.js
- .env.example
- .gitignore
- database.js
- init.js
- server.js
- package.json
- package-lock.json

## Base de datos
El proyecto utiliza SQLite para almacenar:

- Usuarios.
- Productos.
- Favoritos.

Los datos permanecen guardados aunque se reinicie el servidor.


