import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_nexus_cli_jwt_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de autorizacion ausente. Inicie sesion con: login <user> <pass>'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Token de sesion invalido o expirado. Vuelva a iniciar sesion.'
      });
    }
    req.user = decodedUser;
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'root') {
    return res.status(403).json({
      error: 'PERMISSION_DENIED',
      message: 'Se requieren privilegios ROOT / ADMIN para ejecutar esta operacion administrativa.'
    });
  }

  next();
}
