import express from 'express';
import { memoryDb } from '../db/pool.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to handle single node detail query
function handleGetNodeDetail(req, res) {
  try {
    const rawId = req.query.id || req.params.id;
    const nodeId = Number.parseInt(rawId, 10);
    const node = memoryDb.nodes.find(n => n.id === nodeId);

    if (!node) {
      return res.status(404).json({
        error: 'NODE_NOT_FOUND',
        message: `El nodo con ID ${nodeId} no existe en la ramificacion del sistema.`
      });
    }

    const breadcrumbs = memoryDb.getBreadcrumbs(nodeId);
    const lead = memoryDb.users.find(u => u.id === node.lead_id);
    const parentNode = node.parent_id ? memoryDb.nodes.find(n => n.id === node.parent_id) : null;

    // Direct children nodes
    const children = memoryDb.nodes
      .filter(n => n.parent_id === nodeId)
      .map(child => {
        const childTasks = memoryDb.tasks.filter(t => t.node_id === child.id);
        const completed = childTasks.filter(t => t.status === 'DONE').length;
        const childLead = memoryDb.users.find(u => u.id === child.lead_id);
        return {
          ...child,
          task_count: childTasks.length,
          completed_task_count: completed,
          lead_name: childLead ? childLead.full_name : 'Sin asignar'
        };
      });

    // Direct tasks on this node
    const tasks = memoryDb.tasks
      .filter(t => t.node_id === nodeId)
      .map(t => {
        const assignee = memoryDb.users.find(u => u.id === t.assigned_to);
        return {
          ...t,
          assignee_name: assignee ? assignee.full_name : 'Sin asignar',
          assignee_username: assignee ? assignee.username : null,
          assignee_avatar: assignee ? assignee.avatar_color : '#6b7280'
        };
      });

    res.json({
      node: {
        ...node,
        lead_name: lead ? lead.full_name : 'Sin asignar',
        lead_username: lead ? lead.username : null,
        parent_name: parentNode ? parentNode.name : null,
        parent_code: parentNode ? parentNode.code : null
      },
      breadcrumbs,
      children,
      tasks,
      stats: {
        totalChildren: children.length,
        totalTasks: tasks.length,
        doneTasks: tasks.filter(t => t.status === 'DONE').length,
        inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        blockedTasks: tasks.filter(t => t.status === 'BLOCKED').length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'NODE_FETCH_ERROR', message: err.message });
  }
}

// Helper to handle breadcrumbs query
function handleGetBreadcrumbs(req, res) {
  try {
    const rawId = req.query.id || req.params.id;
    const nodeId = Number.parseInt(rawId, 10);
    const breadcrumbs = memoryDb.getBreadcrumbs(nodeId);
    res.json({ breadcrumbs });
  } catch (err) {
    res.status(500).json({ error: 'BREADCRUMBS_FAILED', message: err.message });
  }
}

// GET /api/projects/tree - Complete hierarchy tree
router.get('/tree', authenticateToken, (req, res) => {
  try {
    const tree = memoryDb.getFullTree(null);
    res.json({ tree });
  } catch (err) {
    res.status(500).json({ error: 'TREE_LOAD_FAILED', message: err.message });
  }
});

// Support both query param (/detail?id=1) and route param (/:id)
router.get('/detail', authenticateToken, handleGetNodeDetail);
router.get('/breadcrumbs', authenticateToken, handleGetBreadcrumbs);
router.get('/:id/breadcrumbs', authenticateToken, handleGetBreadcrumbs);
router.get('/:id', authenticateToken, handleGetNodeDetail);

// POST /api/projects - Create a new node/project/module
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, code, type, parent_id, description, priority, lead_id, metadata } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'El nombre y codigo del nodo/proyecto son obligatorios.'
      });
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '-');

    // Check duplicate code
    const existing = memoryDb.nodes.find(n => n.code === cleanCode);
    if (existing) {
      return res.status(409).json({
        error: 'DUPLICATE_CODE',
        message: `El identificador de nodo '${cleanCode}' ya esta en uso.`
      });
    }

    const parentIdNum = parent_id ? Number.parseInt(parent_id, 10) : null;
    if (parentIdNum) {
      const parentExists = memoryDb.nodes.find(n => n.id === parentIdNum);
      if (!parentExists) {
        return res.status(400).json({
          error: 'INVALID_PARENT',
          message: `El nodo padre con ID ${parentIdNum} no existe.`
        });
      }
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newNode = {
      id: memoryDb.nextNodeId++,
      code: cleanCode,
      name: name.trim(),
      slug: slug || 'branch',
      type: type || 'PROJECT',
      parent_id: parentIdNum,
      description: description || '',
      status: 'ACTIVE',
      priority: priority || 'NORMAL',
      lead_id: lead_id ? Number.parseInt(lead_id, 10) : req.user.id,
      progress: 0,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memoryDb.nodes.push(newNode);

    // Audit log
    memoryDb.logAudit(
      req.user.id,
      'NODE_CREATE',
      'NODE',
      newNode.id,
      `node create --code ${cleanCode} --type ${newNode.type}`,
      `Nodo '${newNode.name}' [${cleanCode}] creado bajo parent_id=${parentIdNum || 'ROOT'}`
    );

    res.status(201).json({
      success: true,
      node: newNode,
      message: `Nodo de proyecto ${cleanCode} registrado correctamente.`
    });
  } catch (err) {
    res.status(500).json({ error: 'CREATE_FAILED', message: err.message });
  }
});

// Helper for node update
function handleUpdateNode(req, res) {
  try {
    const rawId = req.query.id || req.body.id || req.params.id;
    const nodeId = Number.parseInt(rawId, 10);
    const nodeIndex = memoryDb.nodes.findIndex(n => n.id === nodeId);

    if (nodeIndex === -1) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Nodo no encontrado.' });
    }

    const node = memoryDb.nodes[nodeIndex];
    const { name, description, status, priority, progress, lead_id, parent_id } = req.body;

    if (name !== undefined) node.name = name.trim();
    if (description !== undefined) node.description = description;
    if (status !== undefined) node.status = status;
    if (priority !== undefined) node.priority = priority;
    if (progress !== undefined) node.progress = Math.min(100, Math.max(0, Number.parseInt(progress, 10)));
    if (lead_id !== undefined) node.lead_id = lead_id ? Number.parseInt(lead_id, 10) : null;
    if (parent_id !== undefined && parent_id !== node.id) {
      node.parent_id = parent_id ? Number.parseInt(parent_id, 10) : null;
    }
    node.updated_at = new Date().toISOString();

    memoryDb.logAudit(
      req.user.id,
      'NODE_UPDATE',
      'NODE',
      node.id,
      `node update ${node.code} --status ${node.status} --progress ${node.progress}%`,
      `Actualizacion de propiedades del nodo ${node.code}`
    );

    res.json({ success: true, node });
  } catch (err) {
    res.status(500).json({ error: 'UPDATE_FAILED', message: err.message });
  }
}

router.put('/update', authenticateToken, handleUpdateNode);
router.put('/:id', authenticateToken, handleUpdateNode);

// Helper for node deletion
function handleDeleteNode(req, res) {
  try {
    const rawId = req.query.id || req.params.id;
    const nodeId = Number.parseInt(rawId, 10);
    const node = memoryDb.nodes.find(n => n.id === nodeId);

    if (!node) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Nodo no encontrado.' });
    }

    if (node.id === 1) {
      return res.status(403).json({
        error: 'CANNOT_DELETE_ROOT',
        message: 'El nodo maestro ROOT (SYS-CORE) no puede ser eliminado.'
      });
    }

    // Recursive helper to get all descendants
    const getDescendantIds = (pid) => {
      let ids = [];
      const children = memoryDb.nodes.filter(n => n.parent_id === pid);
      for (const child of children) {
        ids.push(child.id);
        ids = ids.concat(getDescendantIds(child.id));
      }
      return ids;
    };

    const toDeleteIds = [nodeId, ...getDescendantIds(nodeId)];

    // Delete tasks on these nodes
    memoryDb.tasks = memoryDb.tasks.filter(t => !toDeleteIds.includes(t.node_id));

    // Delete nodes
    memoryDb.nodes = memoryDb.nodes.filter(n => !toDeleteIds.includes(n.id));

    memoryDb.logAudit(
      req.user.id,
      'NODE_DELETE',
      'NODE',
      nodeId,
      `node rm -rf ${node.code}`,
      `Eliminado nodo ${node.code} y ${toDeleteIds.length - 1} sub-nodos en cascada.`
    );

    res.json({
      success: true,
      deletedCount: toDeleteIds.length,
      message: `Nodo ${node.code} y su ramificacion asociada han sido purgados del sistema.`
    });
  } catch (err) {
    res.status(500).json({ error: 'DELETE_FAILED', message: err.message });
  }
}

router.delete('/remove', authenticateToken, requireAdmin, handleDeleteNode);
router.delete('/:id', authenticateToken, requireAdmin, handleDeleteNode);

export default router;
