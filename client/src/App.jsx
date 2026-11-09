import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginTerminal from './components/LoginTerminal';
import TerminalHeader from './components/TerminalHeader';
import Breadcrumbs from './components/Breadcrumbs';
import TreeView from './components/TreeView';
import ProjectDetail from './components/ProjectDetail';
import AdminDashboard from './components/AdminDashboard';
import CliPrompt from './components/CliPrompt';
import ProjectModal from './components/ProjectModal';
import TaskModal from './components/TaskModal';
import { projectService } from './services/api';

export default function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('tree'); // 'tree' | 'admin'
  const [tree, setTree] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(1);
  const [nodeData, setNodeData] = useState(null);
  const [isCliOpen, setIsCliOpen] = useState(true);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalParentId, setModalParentId] = useState(null);
  const [nodeToEdit, setNodeToEdit] = useState(null);

  // Load Tree
  const fetchTree = async () => {
    try {
      const res = await projectService.getTree();
      setTree(res.tree || []);
    } catch (err) {
      console.error('Failed to fetch project tree:', err);
    }
  };

  // Load selected Node
  const fetchNode = async (id) => {
    try {
      const res = await projectService.getNode(id);
      setNodeData(res);
      setSelectedNodeId(id);
    } catch (err) {
      console.error('Failed to load node:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTree();
      fetchNode(selectedNodeId);
    }
  }, [isAuthenticated, selectedNodeId]);

  // Global hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle CLI prompt on backtick or F12 (when not typing in form inputs)
      if ((e.key === '`' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') || e.key === 'F12') {
        e.preventDefault();
        setIsCliOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-term-bg flex items-center justify-center font-mono text-term-green text-xs">
        <span className="animate-pulse">[Cargando sesion criptografica...]</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginTerminal />;
  }

  const handleSelectNode = (nodeId) => {
    fetchNode(nodeId);
    if (currentView !== 'tree') {
      setCurrentView('tree');
    }
  };

  const handleRefreshAll = () => {
    fetchTree();
    if (selectedNodeId) {
      fetchNode(selectedNodeId);
    }
  };

  const handleOpenNewNodeModal = (parentId) => {
    setNodeToEdit(null);
    setModalParentId(parentId !== undefined ? parentId : selectedNodeId);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditNodeModal = (node) => {
    setNodeToEdit(node);
    setIsProjectModalOpen(true);
  };

  const handleOpenTaskModal = (nodeId) => {
    setModalParentId(nodeId || selectedNodeId);
    setIsTaskModalOpen(true);
  };

  // Flatten tree for select dropdown in modal
  const flattenNodes = (nodes) => {
    let list = [];
    nodes.forEach(n => {
      list.push(n);
      if (n.children && n.children.length > 0) {
        list = list.concat(flattenNodes(n.children));
      }
    });
    return list;
  };

  return (
    <div className="h-screen w-screen bg-term-bg flex flex-col overflow-hidden text-term-text select-none">
      {/* Top CLI Header */}
      <TerminalHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        isCliOpen={isCliOpen}
        setIsCliOpen={setIsCliOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {currentView === 'tree' ? (
          <>
            {/* Left Sidebar: Branched Tree View (Sistema Ramificado) */}
            <div className="w-80 sm:w-88 md:w-96 shrink-0 h-full hidden sm:block">
              <TreeView
                tree={tree}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleSelectNode}
                onOpenNewNodeModal={handleOpenNewNodeModal}
              />
            </div>

            {/* Right Pane: Breadcrumbs + Project Node Details & Tasks */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-term-bg">
              {/* Breadcrumbs (Migajas de Pan) */}
              <Breadcrumbs
                breadcrumbs={nodeData?.breadcrumbs || []}
                onSelectNode={handleSelectNode}
              />

              {/* Node Details & Sub-branches */}
              <ProjectDetail
                nodeData={nodeData}
                onRefresh={handleRefreshAll}
                onSelectNode={handleSelectNode}
                onOpenTaskModal={handleOpenTaskModal}
                onOpenNodeModal={handleOpenNewNodeModal}
                onOpenEditNodeModal={handleOpenEditNodeModal}
              />
            </div>
          </>
        ) : (
          /* Administrative Dashboard View */
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-term-bg">
            <AdminDashboard
              onSelectNode={handleSelectNode}
              onOpenNewNodeModal={handleOpenNewNodeModal}
              onOpenEditNodeModal={handleOpenEditNodeModal}
            />
          </div>
        )}
      </div>

      {/* Interactive Bottom CLI Prompt Drawer */}
      <CliPrompt
        currentNode={nodeData?.node}
        onNavigateToNode={handleSelectNode}
        onRefreshData={handleRefreshAll}
        isOpen={isCliOpen}
        onToggle={() => setIsCliOpen(!isCliOpen)}
      />

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        parentId={modalParentId}
        editNode={nodeToEdit}
        onSaved={handleRefreshAll}
        allNodes={flattenNodes(tree)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        nodeId={modalParentId || selectedNodeId}
        onSaved={handleRefreshAll}
      />
    </div>
  );
}
