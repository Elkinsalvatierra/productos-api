# Documentación de pruebas en Postman
## API REST - Productos JWT

**Servidor local:** `http://localhost:3000`
Esta documentación contiene las solicitudes utilizadas para probar la API REST desarrollada con Node.js, Express, SQLite y JWT.

## 1. Autenticación
### 1.1 Registrar usuario
- **Método:** POST
- **URL:** `/auth/registro`
- **Autorización:** No requiere token.

**Body:**
```json
{
  "nombre": "Usuario Prueba",
  "correo": "prueba@gmail.com",
  "password": "Prueba12345"
}
```

### 1.2 Iniciar sesión
- **Método:** POST
- **URL:** `/auth/login`
- **Autorización:** No requiere token.

**Body:**
```json
{
  "correo": "prueba@gmail.com",
  "password": "Prueba12345"
}
```

La respuesta proporciona un token JWT que permite acceder a las rutas protegidas.

## 2. Productos

### 2.1 Listar productos
- **Método:** GET
- **URL:** `/productos`
- **Autorización:** Pública.

### 2.2 Buscar producto por ID
- **Método:** GET
- **URL:** `/productos/1`
- **Autorización:** Pública.

### 2.3 Registrar producto
- **Método:** POST
- **URL:** `/productos`
- **Autorización:** Bearer Token (administrador).

**Body:**
```json
{
  "nombre": "Tablet Xiaomi",
  "descripcion": "Tablet de 10 pulgadas",
  "categoria": "Tecnología",
  "precio": 280
}
```

### 2.4 Actualizar producto
- **Método:** PUT
- **URL:** `/productos/1`
- **Autorización:** Bearer Token (administrador).

**Body:**
```json
{
  "nombre": "Laptop Lenovo IdeaPad actualizada",
  "descripcion": "Laptop Lenovo con mejoras de almacenamiento",
  "categoria": "Tecnología",
  "precio": 700
}
```

### 2.5 Eliminar producto
- **Método:** DELETE
- **URL:** `/productos/1`
- **Autorización:** Bearer Token (administrador).

## 3. Favoritos

Todas las operaciones de favoritos requieren un token JWT de un usuario autenticado.

### 3.1 Agregar favorito
- **Método:** POST
- **URL:** `/favoritos`
- **Autorización:** Bearer Token.

**Body:**
```json
{
  "productoId": 1
}
```

### 3.2 Listar mis favoritos
- **Método:** GET
- **URL:** `/favoritos`
- **Autorización:** Bearer Token.

Devuelve únicamente los favoritos del usuario autenticado.

### 3.3 Eliminar favorito
- **Método:** DELETE
- **URL:** `/favoritos/1`
- **Autorización:** Bearer Token.

Elimina el favorito del usuario autenticado sin afectar los favoritos de otros usuarios.

## 4. Códigos de respuesta HTTP

| Código | Descripción |
|---|---|
| 200 | Solicitud procesada correctamente. |
| 201 | Recurso creado correctamente. |
| 400 | Datos de entrada incorrectos. |
| 401 | No autenticado o token inválido. |
| 403 | No tiene permisos suficientes. |
| 404 | Recurso no encontrado. |
| 409 | Conflicto o recurso duplicado. |

## 5. Consideraciones

- Los usuarios deben iniciar sesión para obtener su token JWT.
- Las operaciones de creación, actualización y eliminación de productos requieren permisos de administrador.
- Las operaciones de favoritos requieren autenticación.
- La información se almacena en una base de datos SQLite.
- No se deben compartir públicamente contraseñas ni tokens JWT.