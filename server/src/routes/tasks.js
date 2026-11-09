import express from 'express';
import { memoryDb } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/tasks - List tasks with query filter
router.get('/', authenticateToken, (req, res) => {
  try {
    const { node_id, status, priority, assigned_to } = req.query;

    let results = [...memoryDb.tasks];

    if (node_id) {
      const nid = parseInt(node_id, 10);
      results = results.filter(t => t.node_id === nid);
    }
    if (status) {
      results = results.filter(t => t.status.toUpperCase() === status.toUpperCase());
    }
    if (priority) {
      results = results.filter(t => t.priority.toUpperCase() === priority.toUpperCase());
    }
    if (assigned_to) {
      const uid = parseInt(assigned_to, 10);
      results = results.filter(t => t.assigned_to === uid);
    }

    const decorated = results.map(t => {
      const assignee = memoryDb.users.find(u => u.id === t.assigned_to);
      const node = memoryDb.nodes.find(n => n.id === t.node_id);
      return {
        ...t,
        assignee_name: assignee ? assignee.full_name : 'Sin asignar',
        assignee_username: assignee ? assignee.username : null,
        node_name: node ? node.name : 'Unknown',
        node_code: node ? node.code : 'UNKNOWN'
      };
    });

    res.json({ tasks: decorated });
  } catch (err) {
    res.status(500).json({ error: 'FETCH_TASKS_FAILED', message: err.message });
  }
});

// POST /api/tasks - Create task
router.post('/', authenticateToken, (req, res) => {
  try {
    const { node_id, title, description, priority, assigned_to, estimated_hours, tags } = req.body;

    if (!node_id || !title) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'node_id y title son campos requeridos.'
      });
    }

    const nodeIdNum = parseInt(node_id, 10);
    const targetNode = memoryDb.nodes.find(n => n.id === nodeIdNum);
    if (!targetNode) {
      return res.status(404).json({ error: 'NODE_NOT_FOUND', message: 'El nodo especificado no existe.' });
    }

    const taskCount = memoryDb.tasks.filter(t => t.node_id === nodeIdNum).length + 1;
    const taskCode = `${targetNode.code}-T${String(taskCount).padStart(2, '0')}`;

    const newTask = {
      id: memoryDb.nextTaskId++,
      code: taskCode,
      node_id: nodeIdNum,
      title: title.trim(),
      description: description || '',
      status: 'TODO',
      priority: priority || 'NORMAL',
      assigned_to: assigned_to ? parseInt(assigned_to, 10) : req.user.id,
      estimated_hours: parseFloat(estimated_hours) || 4.0,
      logged_hours: 0,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(s => s.trim()) : ['dev']),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memoryDb.tasks.push(newTask);

    memoryDb.logAudit(
      req.user.id,
      'TASK_CREATE',
      'TASK',
      newTask.id,
      `task add --code ${taskCode} --node ${targetNode.code}`,
      `Tarea '${newTask.title}' registrada bajo ${targetNode.code}`
    );

    res.status(201).json({ success: true, task: newTask });
  } catch (err) {
    res.status(500).json({ error: 'CREATE_TASK_FAILED', message: err.message });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const taskIndex = memoryDb.tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Tarea no encontrada.' });
    }

    const task = memoryDb.tasks[taskIndex];
    const { title, description, status, priority, assigned_to, estimated_hours, logged_hours, tags } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assigned_to !== undefined) task.assigned_to = assigned_to ? parseInt(assigned_to, 10) : null;
    if (estimated_hours !== undefined) task.estimated_hours = parseFloat(estimated_hours);
    if (logged_hours !== undefined) task.logged_hours = parseFloat(logged_hours);
    if (tags !== undefined) task.tags = Array.isArray(tags) ? tags : tags.split(',').map(s => s.trim());

    task.updated_at = new Date().toISOString();

    memoryDb.logAudit(
      req.user.id,
      'TASK_UPDATE',
      'TASK',
      task.id,
      `task update ${task.code} --status ${task.status}`,
      `Estado de tarea ${task.code} actualizado a ${task.status}`
    );

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ error: 'UPDATE_TASK_FAILED', message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const taskIndex = memoryDb.tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Tarea no encontrada.' });
    }

    const task = memoryDb.tasks[taskIndex];
    memoryDb.tasks.splice(taskIndex, 1);

    memoryDb.logAudit(
      req.user.id,
      'TASK_DELETE',
      'TASK',
      taskId,
      `task rm ${task.code}`,
      `Tarea ${task.code} eliminada del sistema.`
    );

    res.json({ success: true, message: `Tarea ${task.code} purgada.` });
  } catch (err) {
    res.status(500).json({ error: 'DELETE_TASK_FAILED', message: err.message });
  }
});

export default router;
