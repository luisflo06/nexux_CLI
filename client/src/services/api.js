import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Security Helper: Sanitize route parameters to prevent
 * Client-Side Request Forgery (CSRF/SSRF) and API Path Traversal.
 * Whitelists only safe alphanumeric chars, underscores and hyphens.
 */
function sanitizeParam(param) {
  if (typeof param === 'number') {
    if (!Number.isFinite(param)) {
      throw new TypeError('Invalid numeric parameter');
    }
    return String(param);
  }
  if (typeof param === 'string') {
    const clean = param.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!clean) {
      throw new TypeError('Parameter contains invalid characters');
    }
    return encodeURIComponent(clean);
  }
  throw new TypeError('Parameter must be a number or string');
}

// Request interceptor: inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_cli_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('nexus_cli_token');
        localStorage.removeItem('nexus_cli_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/auth/users');
    return res.data;
  }
};

export const projectService = {
  getTree: async () => {
    const res = await api.get('/projects/tree');
    return res.data;
  },
  getNode: async (id) => {
    const safeId = sanitizeParam(id);
    const res = await api.get(`/projects/${safeId}`);
    return res.data;
  },
  getBreadcrumbs: async (id) => {
    const safeId = sanitizeParam(id);
    const res = await api.get(`/projects/${safeId}/breadcrumbs`);
    return res.data;
  },
  createNode: async (data) => {
    const res = await api.post('/projects', data);
    return res.data;
  },
  updateNode: async (id, data) => {
    const safeId = sanitizeParam(id);
    const res = await api.put(`/projects/${safeId}`, data);
    return res.data;
  },
  deleteNode: async (id) => {
    const safeId = sanitizeParam(id);
    const res = await api.delete(`/projects/${safeId}`);
    return res.data;
  }
};

export const taskService = {
  getTasks: async (filters = {}) => {
    const res = await api.get('/tasks', { params: filters });
    return res.data;
  },
  createTask: async (data) => {
    const res = await api.post('/tasks', data);
    return res.data;
  },
  updateTask: async (id, data) => {
    const safeId = sanitizeParam(id);
    const res = await api.put(`/tasks/${safeId}`, data);
    return res.data;
  },
  deleteTask: async (id) => {
    const safeId = sanitizeParam(id);
    const res = await api.delete(`/tasks/${safeId}`);
    return res.data;
  }
};

export const adminService = {
  getMetrics: async () => {
    const res = await api.get('/admin/metrics');
    return res.data;
  },
  getAuditLogs: async () => {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },
  resetDemo: async () => {
    const res = await api.post('/admin/reset-demo');
    return res.data;
  }
};

export const cliService = {
  exec: async (command, currentNodeId) => {
    const safeNodeId = currentNodeId !== undefined && currentNodeId !== null
      ? sanitizeParam(currentNodeId)
      : 1;
    const res = await api.post('/cli/exec', {
      command: String(command || ''),
      currentNodeId: Number(safeNodeId) || 1
    });
    return res.data;
  }
};

export default api;
