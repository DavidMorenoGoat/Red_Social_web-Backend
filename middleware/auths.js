const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(403).json({ mensaje: 'Token no proporcionado' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }

    req.userId = decoded.id; // Guardamos el ID en la request
    next();
  });
}

module.exports = verificarToken;
