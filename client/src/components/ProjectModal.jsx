import React, { useState, useEffect } from 'react';
import { X, Box, Save, AlertCircle } from 'lucide-react';
import { projectService, authService } from '../services/api';

export default function ProjectModal({ isOpen, onClose, parentId, editNode, onSaved, allNodes = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'PROJECT',
    parent_id: '',
    description: '',
    priority: 'NORMAL',
    status: 'ACTIVE',
    progress: 0,
    lead_id: ''
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await authService.getUsers();
        setUsers(res.users || []);
      } catch (err) {
        console.error('Failed to load users for modal:', err);
      }
    }
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editNode) {
      setFormData({
        name: editNode.name || '',
        code: editNode.code || '',
        type: editNode.type || 'PROJECT',
        parent_id: editNode.parent_id !== null ? String(editNode.parent_id) : '',
        description: editNode.description || '',
        priority: editNode.priority || 'NORMAL',
        status: editNode.status || 'ACTIVE',
        progress: editNode.progress || 0,
        lead_id: editNode.lead_id ? String(editNode.lead_id) : ''
      });
    } else {
      setFormData({
        name: '',
        code: '',
        type: parentId === 1 ? 'DOMAIN' : 'PROJECT',
        parent_id: parentId ? String(parentId) : '',
        description: '',
        priority: 'NORMAL',
        status: 'ACTIVE',
        progress: 0,
        lead_id: ''
      });
    }
    setError(null);
  }, [editNode, parentId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || (!editNode && !formData.code.trim())) {
      setError('Nombre y Codigo son obligatorios.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (editNode) {
        await projectService.updateNode(editNode.id, {
          name: formData.name,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          progress: parseInt(formData.progress, 10),
          lead_id: formData.lead_id ? parseInt(formData.lead_id, 10) : null,
          parent_id: formData.parent_id ? parseInt(formData.parent_id, 10) : null
        });
      } else {
        await projectService.createNode({
          name: formData.name,
          code: formData.code,
          type: formData.type,
          parent_id: formData.parent_id ? parseInt(formData.parent_id, 10) : null,
          description: formData.description,
          priority: formData.priority,
          lead_id: formData.lead_id ? parseInt(formData.lead_id, 10) : null
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-term-surface border border-term-border rounded-lg shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="bg-term-panel border-b border-term-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-term-green-bright font-bold">
            <Box className="w-4 h-4" />
            <span>{editNode ? `EDITAR NODO: [${editNode.code}]` : 'NUEVA RAMA / PROYECTO EN ARBOL'}</span>
          </div>
          <button onClick={onClose} className="text-term-muted hover:text-term-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-term-red/10 border border-term-red/40 rounded text-term-red flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="node-code-input" className="block text-term-muted mb-1 font-bold">
                CODIGO UNICO (ID CLI):
              </label>
              <input
                id="node-code-input"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={!!editNode}
                placeholder="ej: PRJ-AUTH, MOD-API"
                className="w-full bg-term-bg border border-term-border disabled:opacity-50 rounded p-2 text-term-green-bright font-bold focus:outline-none focus:border-term-green"
                required
              />
            </div>

            <div>
              <label htmlFor="node-type-select" className="block text-term-muted mb-1 font-bold">
                TIPO DE NODO:
              </label>
              <select
                id="node-type-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={!!editNode}
                className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none focus:border-term-green"
              >
                <option value="DOMAIN">DOMAIN (Area / Division)</option>
                <option value="PROJECT">PROJECT (Proyecto Principal)</option>
                <option value="MODULE">MODULE (Modulo / Track)</option>
                <option value="MILESTONE">MILESTONE (Hito / Gate)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="node-name-input" className="block text-term-muted mb-1 font-bold">
              NOMBRE DESCRIPTIVO:
            </label>
            <input
              id="node-name-input"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ej: Microservicio de Facturacion Electronica"
              className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none focus:border-term-green"
              required
            />
          </div>

          <div>
            <label htmlFor="node-parent-select" className="block text-term-muted mb-1 font-bold">
              RAMA PADRE (HERENCIA EN ARBOL):
            </label>
            <select
              id="node-parent-select"
              value={formData.parent_id}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none focus:border-term-green"
            >
              <option value="">Raiz Maestro (SYS-ROOT)</option>
              {allNodes
                .filter(n => !editNode || n.id !== editNode.id)
                .map(n => (
                  <option key={n.id} value={n.id}>
                    [{n.code}] {n.name} ({n.type})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="node-status-select" className="block text-term-muted mb-1 font-bold">
                ESTADO:
              </label>
              <select
                id="node-status-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none"
              >
                <option value="PLANNING">PLANNING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label htmlFor="node-priority-select" className="block text-term-muted mb-1 font-bold">
                PRIORIDAD:
              </label>
              <select
                id="node-priority-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label htmlFor="node-lead-select" className="block text-term-muted mb-1 font-bold">
                LIDER ASIGNADO:
              </label>
              <select
                id="node-lead-select"
                value={formData.lead_id}
                onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none"
              >
                <option value="">Sin asignar</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editNode && (
            <div>
              <div className="flex justify-between text-term-muted mb-1 font-bold">
                <label htmlFor="node-progress-range">PROGRESO (%):</label>
                <span className="text-term-green-bright">{formData.progress}%</span>
              </div>
              <input
                id="node-progress-range"
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          )}

          <div>
            <label htmlFor="node-desc-textarea" className="block text-term-muted mb-1 font-bold">
              DESCRIPCION / OBJETIVOS:
            </label>
            <textarea
              id="node-desc-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles sobre este componente arquitectonico..."
              className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none focus:border-term-green text-xs"
            ></textarea>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-term-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-term-panel hover:bg-term-border text-term-muted rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-term-green hover:bg-term-green-bright text-term-bg font-bold rounded flex items-center gap-1.5 shadow-md shadow-term-green/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Guardando...' : (editNode ? 'Actualizar Nodo' : 'Crear Rama')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
