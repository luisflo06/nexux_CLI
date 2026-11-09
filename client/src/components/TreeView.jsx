import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  Box, 
  Layers, 
  Milestone, 
  Plus, 
  Search, 
  Zap
} from 'lucide-react';

export default function TreeView({ tree = [], selectedNodeId, onSelectNode, onOpenNewNodeModal }) {
  const [expandedMap, setExpandedMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedMap(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  const isExpanded = (node) => {
    // By default: expand ROOT and DOMAINS, unless user collapsed
    if (expandedMap[node.id] !== undefined) {
      return expandedMap[node.id];
    }
    return node.type === 'ROOT' || node.type === 'DOMAIN' || node.type === 'PROJECT';
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case 'ROOT':
        return <Zap className="w-4 h-4 text-term-green" />;
      case 'DOMAIN':
        return <Folder className="w-4 h-4 text-term-cyan" />;
      case 'PROJECT':
        return <Box className="w-4 h-4 text-emerald-400" />;
      case 'MODULE':
        return <Layers className="w-4 h-4 text-term-amber" />;
      case 'MILESTONE':
        return <Milestone className="w-4 h-4 text-term-purple" />;
      default:
        return <Folder className="w-4 h-4 text-term-muted" />;
    }
  };

  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="w-1.5 h-1.5 rounded-full bg-term-red animate-ping" title="Prioridad Critica"></span>;
      case 'HIGH':
        return <span className="w-1.5 h-1.5 rounded-full bg-term-amber" title="Prioridad Alta"></span>;
      default:
        return null;
    }
  };

  const renderNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const expanded = isExpanded(node);
    const isSelected = selectedNodeId === node.id;

    // Filter check
    const matchesSearch = searchTerm === '' ||
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.code.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      <div key={node.id} className="select-none">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectNode(node.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectNode(node.id);
            }
          }}
          style={{ paddingLeft: `${Math.max(8, depth * 16)}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2.5 my-0.5 rounded cursor-pointer transition-all border ${
            isSelected
              ? 'bg-term-panel border-term-green/50 text-term-text font-bold shadow-sm shadow-term-green/10 ring-1 ring-term-green/20'
              : 'border-transparent text-term-muted hover:text-term-text hover:bg-term-panel/60'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Expand / Collapse arrow */}
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(node.id, e)}
                className="p-0.5 rounded text-term-muted hover:text-term-text hover:bg-term-bg/80 shrink-0"
              >
                {expanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-term-green" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-4 h-4 inline-block shrink-0 text-term-border text-center text-xs">·</span>
            )}

            {/* Type Icon */}
            <span className="shrink-0">{getNodeIcon(node.type)}</span>

            {/* Code & Name */}
            <span className={`font-mono text-xs truncate ${isSelected ? 'text-term-green-bright font-bold' : 'text-term-text'}`}>
              [{node.code}]
            </span>
            <span className="text-xs text-term-muted truncate group-hover:text-term-text transition-colors">
              {node.name}
            </span>

            {getPriorityIndicator(node.priority)}
          </div>

          {/* Right badge: Progress / Task info */}
          <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono">
            {node.task_count > 0 && (
              <span className="text-term-muted hidden sm:inline">
                {node.completed_task_count}/{node.task_count} tsk
              </span>
            )}

            <div className="w-12 h-1.5 bg-term-border rounded-full overflow-hidden hidden md:block">
              <div
                className={`h-full ${
                  node.progress === 100 ? 'bg-term-green' : node.progress > 50 ? 'bg-term-cyan' : 'bg-term-amber'
                }`}
                style={{ width: `${node.progress || 0}%` }}
              ></div>
            </div>

            <span className="text-term-muted">{node.progress}%</span>
          </div>
        </div>

        {/* Render child branches recursively */}
        {hasChildren && expanded && (
          <div className="border-l border-term-border/40 ml-4 pl-1">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full h-full flex flex-col bg-term-surface border-r border-term-border overflow-hidden">
      {/* Sidebar Header & Search */}
      <div className="p-3 border-b border-term-border space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-term-green-bright tracking-wider">
            <span className="text-term-green">$</span>
            <span>SISTEMA RAMIFICADO</span>
          </div>
          <button
            onClick={() => onOpenNewNodeModal(selectedNodeId)}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-term-panel hover:bg-term-green/20 text-term-green-bright border border-term-green/40 rounded transition-colors"
            title="Crear nueva rama o sub-proyecto"
          >
            <Plus className="w-3 h-3" />
            <span>Rama</span>
          </button>
        </div>

        {/* Tree Search Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-term-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar ramas / nodos..."
            className="w-full bg-term-bg border border-term-border rounded pl-8 pr-2 py-1 text-xs text-term-text placeholder-term-muted focus:outline-none focus:border-term-green/60 font-mono"
          />
        </div>
      </div>

      {/* Tree Node List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {tree.length === 0 ? (
          <div className="text-center py-8 text-xs text-term-muted font-mono">
            <span>[-- Inicializando topologia de nodos --]</span>
          </div>
        ) : (
          tree.map(rootNode => renderNode(rootNode, 0))
        )}
      </div>

      {/* Tree footer stats */}
      <div className="p-2 border-t border-term-border bg-term-panel/40 text-[10px] text-term-muted flex justify-between items-center shrink-0">
        <span>Arbol: PostgreSQL Model</span>
        <span className="text-term-cyan font-mono">v1.30-STABLE</span>
      </div>
    </aside>
  );
}
