import express from 'express';
import os from 'os';
import { memoryDb, isRealPostgres, dbStatusMessage } from '../db/pool.js';
import { initialNodes, initialTasks, initialAuditLogs } from '../db/seedData.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const serverStartTime = Date.now();

// GET /api/admin/metrics - Global administrative metrics & telemetry
router.get('/metrics', authenticateToken, (req, res) => {
  try {
    const totalNodes = memoryDb.nodes.length;
    const domainsCount = memoryDb.nodes.filter(n => n.type === 'DOMAIN').length;
    const projectsCount = memoryDb.nodes.filter(n => n.type === 'PROJECT').length;
    const modulesCount = memoryDb.nodes.filter(n => n.type === 'MODULE').length;
    const milestonesCount = memoryDb.nodes.filter(n => n.type === 'MILESTONE').length;

    const totalTasks = memoryDb.tasks.length;
    const doneTasks = memoryDb.tasks.filter(t => t.status === 'DONE').length;
    const inProgressTasks = memoryDb.tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const reviewTasks = memoryDb.tasks.filter(t => t.status === 'REVIEW').length;
    const blockedTasks = memoryDb.tasks.filter(t => t.status === 'BLOCKED').length;
    const todoTasks = memoryDb.tasks.filter(t => t.status === 'TODO').length;

    const totalEstHours = memoryDb.tasks.reduce((acc, t) => acc + (Number(t.estimated_hours) || 0), 0);
    const totalLoggedHours = memoryDb.tasks.reduce((acc, t) => acc + (Number(t.logged_hours) || 0), 0);

    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Node project progress averages
    const projects = memoryDb.nodes.filter(n => n.type === 'PROJECT');
    const avgProjectProgress = projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
      : 0;

    const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);

    res.json({
      overview: {
        totalNodes,
        domainsCount,
        projectsCount,
        modulesCount,
        milestonesCount,
        avgProjectProgress
      },
      tasks: {
        total: totalTasks,
        done: doneTasks,
        inProgress: inProgressTasks,
        review: reviewTasks,
        blocked: blockedTasks,
        todo: todoTasks,
        completionRate,
        totalEstHours,
        totalLoggedHours
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
        freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
        uptimeSeconds,
        dbStatus: dbStatusMessage,
        isRealPostgres
      },
      operatorsCount: memoryDb.users.length
    });
  } catch (err) {
    res.status(500).json({ error: 'METRICS_FAILED', message: err.message });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', authenticateToken, (req, res) => {
  try {
    const logs = memoryDb.auditLogs.slice(0, 50).map(log => {
      const u = memoryDb.users.find(user => user.id === log.user_id);
      return {
        ...log,
        operator: u ? u.username : 'SYSTEM',
        operator_role: u ? u.role : 'DAEMON'
      };
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'AUDIT_LOGS_FAILED', message: err.message });
  }
});

// POST /api/admin/reset-demo - Re-seed system to initial state (Admin only)
router.post('/reset-demo', authenticateToken, requireAdmin, (req, res) => {
  try {
    memoryDb.nodes = JSON.parse(JSON.stringify(initialNodes));
    memoryDb.tasks = JSON.parse(JSON.stringify(initialTasks));
    memoryDb.auditLogs = JSON.parse(JSON.stringify(initialAuditLogs));

    memoryDb.logAudit(
      req.user.id,
      'SYS_FACTORY_RESET',
      'SYSTEM',
      1,
      'admin sys --reset-demo',
      'Base de datos restaurada al conjunto de datos demo inicial.'
    );

    res.json({
      success: true,
      message: 'Base de datos restaurada satisfactoriamente con la topologia de demostracion original.'
    });
  } catch (err) {
    res.status(500).json({ error: 'RESET_FAILED', message: err.message });
  }
});

export default router;
