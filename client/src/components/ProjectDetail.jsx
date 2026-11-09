import React from 'react';
import { 
  Plus, 
  Box, 
  Layers, 
  Clock, 
  User, 
  Trash2, 
  Edit3, 
  ArrowUpRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { taskService } from '../services/api';

export default function ProjectDetail({ 
  nodeData, 
  onRefresh, 
  onSelectNode, 
  onOpenTaskModal, 
  onOpenNodeModal, 
  onOpenEditNodeModal
}) {

  if (!nodeData || !nodeData.node) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-term-muted text-xs font-mono">
        <div className="text-center space-y-2">
          <Cpu className="w-8 h-8 text-term-green/40 mx-auto animate-pulse" />
          <p>[Cargando nodo de la jerarquia...]</p>
        </div>
      </div>
    );
  }

  const { node, children = [], tasks = [], stats = {} } = nodeData;

  const handleQuickStatusChange = async (task, newStatus) => {
    try {
      await taskService.updateTask(task.id, {
        status: newStatus,
        logged_hours: newStatus === 'DONE' ? task.estimated_hours : task.logged_hours
      });
      onRefresh();
    } catch (err) {
      alert(`Error al actualizar estado: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId, taskCode) => {
    if (window.confirm(`¿Confirmar eliminacion de la tarea [${taskCode}]?`)) {
      try {
        await taskService.deleteTask(taskId);
        onRefresh();
      } catch (err) {
        alert(`Error al eliminar tarea: ${err.message}`);
      }
    }
  };



  const getStatusBadge = (status) => {
    switch (status) {
      case 'DONE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-term-green/20 text-term-green-bright border border-term-green/40">DONE</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">IN PROGRESS</span>;
      case 'REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40">REVIEW</span>;
      case 'BLOCKED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">BLOCKED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40">TODO</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-term-red/20 text-term-red border border-term-red/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-term-amber/20 text-term-amber border border-term-amber/40">HIGH</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-term-muted border border-term-border">NORMAL</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Node Header Card */}
      <div className="bg-term-surface border border-term-border rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-term-green/10 text-term-green-bright border border-term-green/30">
                [{node.code}]
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-term-panel text-term-cyan border border-term-border">
                {node.type}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-term-panel text-term-text border border-term-border">
                ESTADO: {node.status}
              </span>
              {getPriorityBadge(node.priority)}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-term-text font-mono glow-green">
              {node.name}
            </h1>
            <p className="text-xs text-term-muted max-w-2xl">
              {node.description || 'Sin descripcion definida para esta rama del proyecto.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenEditNodeModal(node)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-term-panel hover:bg-term-border text-term-text border border-term-border rounded transition-colors"
              title="Editar parametros del nodo"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Nodo</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenNodeModal(node.id)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-term-cyan/10 hover:bg-term-cyan/20 text-term-cyan border border-term-cyan/40 rounded transition-colors"
              title="Crear una sub-rama o proyecto hijo"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Sub-Rama</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenTaskModal(node.id)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-term-green hover:bg-term-green-bright text-term-bg font-bold rounded shadow-md shadow-term-green/20 transition-all"
              title="Registrar nueva tarea"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tarea</span>
            </button>
          </div>
        </div>

        {/* Progress bar & metadata banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-term-border/70 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex justify-between text-term-muted">
              <span>Progreso Global</span>
              <span className="text-term-green-bright font-bold">{node.progress}%</span>
            </div>
            <div className="w-full h-2 bg-term-panel border border-term-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-term-green to-term-cyan transition-all duration-300"
                style={{ width: `${node.progress || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-term-muted shrink-0" />
            <div>
              <div className="text-[10px] text-term-muted">LIDER TECNICO</div>
              <div className="text-term-text font-medium truncate">{node.lead_name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-term-amber shrink-0" />
            <div>
              <div className="text-[10px] text-term-muted">TAREAS TOTALES</div>
              <div className="text-term-text font-medium">
                {stats.doneTasks || 0} / {stats.totalTasks || 0} resueltas
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-term-cyan shrink-0" />
            <div>
              <div className="text-[10px] text-term-muted">SUB-RAMAS HIJAS</div>
              <div className="text-term-text font-medium">{children.length} ramas activas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-branches Section (Sistema Ramificado) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-term-cyan tracking-wider">
            <span className="text-term-green">├──</span>
            <span>SUB-RAMAS / PROYECTOS DERIVADOS ({children.length})</span>
          </div>
        </div>

        {children.length === 0 ? (
          <div className="p-4 border border-dashed border-term-border rounded text-xs text-term-muted font-mono flex items-center justify-between">
            <span>[No existen sub-ramas derivadas bajo este nodo. Es una rama terminal]</span>
            <button
              onClick={() => onOpenNodeModal(node.id)}
              className="text-term-cyan hover:underline flex items-center gap-1"
            >
              <span>Crear sub-rama</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {children.map(child => (
              <div
                key={child.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectNode(child.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectNode(child.id);
                  }
                }}
                className="bg-term-surface border border-term-border hover:border-term-cyan/50 rounded p-3 cursor-pointer transition-all hover:bg-term-panel/80 group space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-term-cyan">{child.type === 'PROJECT' ? <Box className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}</span>
                    <span className="text-xs font-mono font-bold text-term-text group-hover:text-term-cyan transition-colors">
                      [{child.code}]
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded border font-mono bg-term-bg border-term-border text-term-muted">
                    {child.type}
                  </span>
                </div>

                <div className="text-xs font-semibold text-term-text truncate">
                  {child.name}
                </div>

                <div className="space-y-1 text-[11px] font-mono text-term-muted">
                  <div className="flex justify-between">
                    <span>Progreso:</span>
                    <span className="text-term-cyan font-bold">{child.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-term-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-term-cyan"
                      style={{ width: `${child.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-term-muted pt-1 border-t border-term-border/50">
                  <span>{child.task_count} tareas</span>
                  <div className="flex items-center gap-1 text-term-cyan group-hover:translate-x-0.5 transition-transform">
                    <span>Explorar</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-term-green-bright tracking-wider">
            <span className="text-term-green">└──</span>
            <span>TAREAS DEL NODO ACTIVO ({tasks.length})</span>
          </div>

          <button
            onClick={() => onOpenTaskModal(node.id)}
            className="flex items-center gap-1 text-xs text-term-green hover:underline font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar tarea</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="p-6 border border-dashed border-term-border rounded-lg text-center text-xs text-term-muted font-mono space-y-2">
            <Clock className="w-6 h-6 mx-auto text-term-muted" />
            <p>No hay tareas registradas en este nivel jerarquico.</p>
            <button
              onClick={() => onOpenTaskModal(node.id)}
              className="px-3 py-1 bg-term-panel hover:bg-term-border text-term-green-bright border border-term-border rounded text-xs"
            >
              + Crear primera tarea
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-term-surface border border-term-border hover:border-term-line rounded p-3 flex flex-wrap items-center justify-between gap-3 transition-colors text-xs font-mono"
              >
                {/* Left: Code, Status, Title, Tags */}
                <div className="space-y-1.5 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-term-green-bright">
                      [{task.code}]
                    </span>
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}

                    {task.tags && task.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] text-term-muted bg-term-bg border border-term-border px-1.5 py-0.2 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm text-term-text font-medium font-sans">
                    {task.title}
                  </div>

                  {task.description && (
                    <div className="text-xs text-term-muted font-sans line-clamp-1">
                      {task.description}
                    </div>
                  )}
                </div>

                {/* Center: Assignee & Hours */}
                <div className="flex items-center gap-4 text-term-muted shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: task.assignee_avatar || '#6b7280' }}
                    ></div>
                    <span className="text-term-text">{task.assignee_name}</span>
                  </div>

                  <div className="text-[11px] text-term-muted">
                    {task.logged_hours}h / {task.estimated_hours}h
                  </div>
                </div>

                {/* Right: Quick Status Toggles & Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {task.status !== 'DONE' ? (
                    <button
                      type="button"
                      onClick={() => { void handleQuickStatusChange(task, 'DONE'); }}
                      className="px-2 py-1 rounded bg-term-green/10 hover:bg-term-green/20 text-term-green-bright border border-term-green/30 text-[11px] font-bold transition-colors"
                      title="Marcar como COMPLETADA (DONE)"
                    >
                      ✓ Resolver
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { void handleQuickStatusChange(task, 'IN_PROGRESS'); }}
                      className="px-2 py-1 rounded bg-term-panel hover:bg-term-border text-term-muted text-[11px] transition-colors"
                      title="Reabrir tarea"
                    >
                      ↺ Reabrir
                    </button>
                  )}

                  {task.status === 'TODO' && (
                    <button
                      type="button"
                      onClick={() => { void handleQuickStatusChange(task, 'IN_PROGRESS'); }}
                      className="px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] transition-colors"
                      title="Comenzar trabajo"
                    >
                      ▶ Iniciar
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => { void handleDeleteTask(task.id, task.code); }}
                    className="p-1 text-term-muted hover:text-term-red hover:bg-term-red/10 rounded transition-colors"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
