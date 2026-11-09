import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Save, AlertCircle } from 'lucide-react';
import { taskService, authService } from '../services/api';

export default function TaskModal({ isOpen, onClose, nodeId, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'NORMAL',
    assigned_to: '',
    estimated_hours: 4,
    tags: 'core, backend'
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
        console.error('Failed to load users for task modal:', err);
      }
    }
    if (isOpen) {
      fetchUsers();
      setFormData({
        title: '',
        description: '',
        priority: 'NORMAL',
        assigned_to: '',
        estimated_hours: 4,
        tags: 'infra, dev'
      });
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('El titulo de la tarea es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await taskService.createTask({
        node_id: nodeId,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
        estimated_hours: parseFloat(formData.estimated_hours) || 4,
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean)
      });

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
      <div className="w-full max-w-md bg-term-surface border border-term-border rounded-lg shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="bg-term-panel border-b border-term-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-term-green-bright font-bold">
            <CheckSquare className="w-4 h-4" />
            <span>NUEVA TAREA EN NODO [{nodeId}]</span>
          </div>
          <button onClick={onClose} className="text-term-muted hover:text-term-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-term-red/10 border border-term-red/40 rounded text-term-red flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-term-muted mb-1 font-bold">
              TITULO DE LA TAREA:
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ej: Validar integridad ACID en replicacion..."
              className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none focus:border-term-green"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-term-muted mb-1 font-bold">
                PRIORIDAD:
              </label>
              <select
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
              <label className="block text-term-muted mb-1 font-bold">
                HORAS ESTIMADAS:
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-term-muted mb-1 font-bold">
              ASIGNAR A OPERADOR:
            </label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none"
            >
              <option value="">Sin asignar (Backlog General)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name} (@{u.username})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-term-muted mb-1 font-bold">
              ETIQUETAS (SEPARADAS POR COMA):
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="k8s, security, backend"
              className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-term-muted mb-1 font-bold">
              DESCRIPCION DETALLADA:
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Criterios de aceptacion..."
              className="w-full bg-term-bg border border-term-border rounded p-2 text-term-text focus:outline-none text-xs"
            ></textarea>
          </div>

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
              <span>{isSubmitting ? 'Creando...' : 'Registrar Tarea'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
