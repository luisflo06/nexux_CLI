import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import tasksRoutes from './routes/tasks.js';
import adminRoutes from './routes/admin.js';
import cliRoutes from './routes/cli.js';
import { dbStatusMessage, isRealPostgres } from './db/pool.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cli', cliRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'nexus-pm-cli-backend',
    timestamp: new Date().toISOString(),
    postgres: {
      connected: isRealPostgres,
      status: dbStatusMessage
    }
  });
});

app.listen(PORT, () => {
  console.log(`
\x1b[32m╔════════════════════════════════════════════════════════════════════════╗
║             NEXUS-CLI PROJECT MANAGEMENT SYSTEM DAEMON                 ║
╠════════════════════════════════════════════════════════════════════════╣
║  [REST API]   http://localhost:${PORT}/api                               ║
║  [DB STATUS]  ${dbStatusMessage.padEnd(52, ' ')}║
║  [CLI SHELL]  Interactive Shell API ready on /api/cli/exec             ║
║  [STACK]      Node.js 24 + Express + PostgreSQL + JWT                  ║
╚════════════════════════════════════════════════════════════════════════╝\x1b[0m
  `);
});
