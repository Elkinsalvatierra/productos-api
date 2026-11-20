function verificarRol(rolPermitido) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Debes iniciar sesión'
      });
    }

    if (req.usuario.rol !== rolPermitido) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
}

module.exports = verificarRol;
