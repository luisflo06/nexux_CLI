import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Server, 
  Layers, 
  Box, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Download, 
  Search, 
  ShieldAlert, 
  Trash2, 
  Edit, 
  ArrowUpRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { adminService, projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onSelectNode, onOpenNewNodeModal, onOpenEditNodeModal }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isResetting, setIsResetting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, logsData, treeData] = await Promise.all([
        adminService.getMetrics(),
        adminService.getAuditLogs(),
        projectService.getTree()
      ]);

      setMetrics(metricsData);
      setAuditLogs(logsData.logs || []);

      // Flatten tree to list for the table
      const flatList = [];
      const flatten = (nodes, depth = 0) => {
        nodes.forEach(n => {
          flatList.push({ ...n, depth });
          if (n.children && n.children.length > 0) {
            flatten(n.children, depth + 1);
          }
        });
      };
      flatten(treeData.tree || []);
      setAllNodes(flatList);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s polling
    return () => clearInterval(interval);
  }, []);

  const handleResetDemo = async () => {
    if (window.confirm('¿Confirmar reinicio maestro? Todos los proyectos y tareas volveran al estado inicial predeterminado.')) {
      try {
        setIsResetting(true);
        await adminService.resetDemo();
        await loadData();
        alert('Base de datos restaurada al conjunto de demostracion.');
      } catch (err) {
        alert(`Error al reiniciar: ${err.message}`);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleDeleteNode = async (node) => {
    if (node.id === 1) {
      alert('El nodo raiz maestro no puede ser eliminado.');
      return;
    }
    if (window.confirm(`¿Purgar permanentemente el nodo [${node.code}] ${node.name} y todas sus sub-ramas?`)) {
      try {
        await projectService.deleteNode(node.id);
        await loadData();
      } catch (err) {
        alert(`Error al eliminar: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleExportTopology = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allNodes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexus_topology_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredNodes = allNodes.filter(node => {
    const matchesSearch = searchTerm === '' ||
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || node.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading && !metrics) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-term-muted text-xs font-mono">
        <div className="text-center space-y-2">
          <Activity className="w-8 h-8 text-term-purple/60 mx-auto animate-pulse" />
          <p>[Iniciando telemetria administrativa del sistema...]</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Admin Title & Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-term-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-term-purple">
            <span className="font-bold">ADMIN://ROOT_CONSOLE</span>
            <span>::</span>
            <span className="text-term-muted">GESTION CENTRALIZADA DE PROYECTOS</span>
          </div>
          <h1 className="text-2xl font-bold text-term-text font-mono glow-cyan mt-1">
            Dashboard Administrativo
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTopology}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-term-panel hover:bg-term-border text-term-cyan border border-term-border rounded font-mono transition-colors"
            title="Exportar topologia de proyectos en JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Topologia</span>
          </button>

          <button
            onClick={() => onOpenNewNodeModal(null)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-term-green hover:bg-term-green-bright text-term-bg font-bold rounded shadow-md shadow-term-green/20 transition-all font-mono"
            title="Crear nuevo proyecto en el arbol"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Proyecto</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-term-red/10 hover:bg-term-red/20 text-term-red border border-term-red/40 rounded font-mono transition-colors"
              title="Restaurar base de datos a datos iniciales de demo"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset DEMO</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Projects & Nodes */}
          <div className="bg-term-surface border border-term-border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-term-muted text-xs font-mono">
              <span>TOPOLOGIA TOTAL</span>
              <Box className="w-4 h-4 text-term-cyan" />
            </div>
            <div className="text-2xl font-bold font-mono text-term-text">
              {metrics.overview.totalNodes} <span className="text-xs text-term-muted font-normal">nodos</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-term-muted border-t border-term-border/60 pt-2">
              <span>{metrics.overview.domainsCount} Dominios</span>
              <span>{metrics.overview.projectsCount} Proyectos</span>
              <span>{metrics.overview.modulesCount} Modulos</span>
            </div>
          </div>

          {/* Card 2: Task Completion Rate */}
          <div className="bg-term-surface border border-term-border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-term-muted text-xs font-mono">
              <span>TASA DE EXITO</span>
              <CheckCircle2 className="w-4 h-4 text-term-green" />
            </div>
            <div className="text-2xl font-bold font-mono text-term-green-bright">
              {metrics.tasks.completionRate}%
            </div>
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-term-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-term-green"
                  style={{ width: `${metrics.tasks.completionRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-term-muted">
                <span>{metrics.tasks.done} resueltas</span>
                <span>{metrics.tasks.inProgress} en curso</span>
                <span>{metrics.tasks.blocked} bloqueadas</span>
              </div>
            </div>
          </div>

          {/* Card 3: Work Hours & Velocity */}
          <div className="bg-term-surface border border-term-border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-term-muted text-xs font-mono">
              <span>HORAS REPORTADAS</span>
              <Activity className="w-4 h-4 text-term-amber" />
            </div>
            <div className="text-2xl font-bold font-mono text-term-text">
              {metrics.tasks.totalLoggedHours}h <span className="text-xs text-term-muted font-normal">/ {metrics.tasks.totalEstHours}h</span>
            </div>
            <div className="text-[11px] font-mono text-term-muted border-t border-term-border/60 pt-2 flex justify-between">
              <span>Progreso Medio Proyectos:</span>
              <span className="text-term-amber font-bold">{metrics.overview.avgProjectProgress}%</span>
            </div>
          </div>

          {/* Card 4: System & Database Engine */}
          <div className="bg-term-surface border border-term-border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-term-muted text-xs font-mono">
              <span>HOST TELEMETRY</span>
              <Database className="w-4 h-4 text-term-green" />
            </div>
            <div className="text-sm font-bold font-mono text-term-green-bright flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-term-green animate-pulse"></span>
              {metrics.system.isRealPostgres ? 'PostgreSQL Native' : 'PostgreSQL Adapter'}
            </div>
            <div className="text-[10px] font-mono text-term-muted border-t border-term-border/60 pt-2 space-y-0.5">
              <div className="flex justify-between">
                <span>RAM Node Heap:</span>
                <span className="text-term-text">{metrics.system.memoryUsageMb} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime Server:</span>
                <span className="text-term-text">{metrics.system.uptimeSeconds}s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Management Table */}
      <div className="bg-term-surface border border-term-border rounded-lg overflow-hidden shadow-sm space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-term-cyan font-mono">
            <span>$</span>
            <span>TABLA DE CONTROL DE PROYECTOS Y RAMAS ({filteredNodes.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-term-panel border border-term-border rounded px-2.5 py-1 text-xs text-term-text font-mono focus:outline-none"
            >
              <option value="ALL">Todos los Tipos</option>
              <option value="DOMAIN">Dominios</option>
              <option value="PROJECT">Proyectos</option>
              <option value="MODULE">Modulos</option>
              <option value="MILESTONE">Hitos</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-term-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar codigo o nombre..."
                className="bg-term-panel border border-term-border rounded pl-8 pr-2.5 py-1 text-xs text-term-text font-mono placeholder-term-muted focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-term-panel/80 text-term-muted border-b border-term-border">
                <th className="py-2.5 px-3">CODIGO</th>
                <th className="py-2.5 px-3">NOMBRE</th>
                <th className="py-2.5 px-3">TIPO</th>
                <th className="py-2.5 px-3">ESTADO</th>
                <th className="py-2.5 px-3">PRIORIDAD</th>
                <th className="py-2.5 px-3">PROGRESO</th>
                <th className="py-2.5 px-3">LIDER</th>
                <th className="py-2.5 px-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-term-border/40">
              {filteredNodes.map(node => (
                <tr key={node.id} className="hover:bg-term-panel/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-term-green-bright">
                    [{node.code}]
                  </td>
                  <td className="py-2 px-3 text-term-text max-w-xs truncate">
                    <span style={{ marginLeft: `${(node.depth || 0) * 8}px` }} className="mr-1 text-term-muted">
                      {node.depth > 0 ? '↳' : '•'}
                    </span>
                    {node.name}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] px-1.5 py-0.2 rounded border bg-term-bg border-term-border text-term-cyan">
                      {node.type}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] text-term-text font-bold">
                      {node.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold ${
                      node.priority === 'CRITICAL' ? 'text-term-red' :
                      node.priority === 'HIGH' ? 'text-term-amber' : 'text-term-muted'
                    }`}>
                      {node.priority}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-term-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-term-green"
                          style={{ width: `${node.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-term-muted">{node.progress}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-term-muted max-w-[120px] truncate">
                    {node.lead_name || 'Sin asignar'}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectNode(node.id)}
                        className="p-1 hover:text-term-green hover:bg-term-green/10 rounded transition-colors"
                        title="Ver en vista arbol / ramificada"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenEditNodeModal(node)}
                        className="p-1 hover:text-term-cyan hover:bg-term-cyan/10 rounded transition-colors"
                        title="Editar parametros"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {node.id !== 1 && (
                        <button
                          onClick={() => handleDeleteNode(node)}
                          className="p-1 hover:text-term-red hover:bg-term-red/10 rounded transition-colors"
                          title="Eliminar nodo y sub-ramas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLI Audit Log Stream */}
      <div className="bg-term-surface border border-term-border rounded-lg p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-term-amber tracking-wider">
            <span>$</span>
            <span>TAIL -F /VAR/LOG/NEXUS/AUDIT.LOG ({auditLogs.length} EVENTOS)</span>
          </div>
          <span className="text-[10px] text-term-muted animate-pulse">STREAMING LIVE</span>
        </div>

        <div className="bg-[#070a10] border border-term-border rounded p-3 max-h-48 overflow-y-auto space-y-1.5 text-xs text-term-text">
          {auditLogs.length === 0 ? (
            <div className="text-term-muted">[No hay registros de auditoria registrados]</div>
          ) : (
            auditLogs.map(log => {
              const time = new Date(log.created_at).toLocaleTimeString();
              return (
                <div key={log.id} className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <span className="text-term-muted shrink-0">[{time}]</span>
                  <span className="text-term-cyan font-semibold shrink-0">
                    @{log.operator || 'system'}
                  </span>
                  <span className="px-1 py-0.2 rounded text-[10px] bg-term-panel border border-term-border text-term-amber shrink-0">
                    {log.action}
                  </span>
                  <span className="text-term-text truncate flex-1">
                    {log.command_executed || log.details}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
