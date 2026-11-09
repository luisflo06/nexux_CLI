import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { memoryDb, isRealPostgres, query } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_nexus_cli_jwt_key_2026';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Credenciales incompletas. Ingrese usuario y contraseña.'
      });
    }

    let user = null;

    if (isRealPostgres) {
      const result = await query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    } else {
      user = memoryDb.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({
        error: 'AUTH_FAILED',
        message: `Usuario '${username}' no registrado en el directorio del sistema.`
      });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        error: 'AUTH_FAILED',
        message: 'Contraseña de acceso incorrecta.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Audit log
    memoryDb.logAudit(
      user.id,
      'AUTH_LOGIN',
      'USER',
      user.id,
      `auth login --user ${user.username}`,
      `Inicio de sesion exitoso para ${user.username} [${user.role}].`
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        avatar_color: user.avatar_color
      },
      system: {
        hostname: 'nexus-pm-core',
        dbDriver: isRealPostgres ? 'PostgreSQL (Active Native)' : 'PostgreSQL-Memory Adapter (Online)',
        kernel: 'Node.js/v24.20.0-cli-sys'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = memoryDb.users.find(u => u.id === req.user.id);
  res.json({
    user: user ? {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
      email: user.email,
      avatar_color: user.avatar_color
    } : req.user,
    session: {
      active: true,
      issued_at: new Date(req.user.iat * 1000).toISOString(),
      expires_at: new Date(req.user.exp * 1000).toISOString()
    }
  });
});

// GET /api/auth/users
router.get('/users', authenticateToken, (req, res) => {
  const safeUsers = memoryDb.users.map(u => ({
    id: u.id,
    username: u.username,
    role: u.role,
    full_name: u.full_name,
    email: u.email,
    avatar_color: u.avatar_color
  }));
  res.json({ users: safeUsers });
});

export default router;
