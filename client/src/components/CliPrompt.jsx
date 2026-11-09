import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, X, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { cliService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CliPrompt({ 
  currentNode, 
  onNavigateToNode, 
  onRefreshData,
  isOpen, 
  onToggle 
}) {
  const { user } = useAuth();
  const [inputCmd, setInputCmd] = useState('');
  const [history, setHistory] = useState([
    {
      id: 1,
      type: 'system',
      text: `NEXUS-CLI v2.4 Shell Inicializada. Escriba 'help' o presione los accesos rapidos para comandos.`
    }
  ]);
  const [cmdHistoryList, setCmdHistoryList] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleExecute = async (commandToRun) => {
    const cmd = (commandToRun || inputCmd).trim();
    if (!cmd) return;

    // Special local clear command
    if (cmd.toLowerCase() === 'clear') {
      setHistory([]);
      setInputCmd('');
      return;
    }

    // Add command to history list for up/down navigation
    setCmdHistoryList(prev => [cmd, ...prev.filter(c => c !== cmd)]);
    setHistoryPointer(-1);

    // Append to visible log
    const userPrompt = `${user?.username || 'operator'}@nexus:${currentNode?.code || 'ROOT'}$ ${cmd}`;
    setHistory(prev => [...prev, { id: Date.now(), type: 'input', text: userPrompt }]);
    setInputCmd('');
    setIsExecuting(true);

    try {
      const res = await cliService.exec(cmd, currentNode?.id || 1);

      if (res.output) {
        setHistory(prev => [...prev, { id: Date.now() + 1, type: 'output', text: res.output }]);
      }

      if (res.newPathId) {
        onNavigateToNode(res.newPathId);
      }

      if (res.action === 'REFRESH') {
        onRefreshData();
      }
    } catch (err) {
      setHistory(prev => [
        ...prev, 
        { id: Date.now() + 1, type: 'error', text: `CLI Error: ${err.response?.data?.message || err.message}` }
      ]);
    } finally {
      setIsExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistoryList.length > 0) {
        const nextPointer = Math.min(historyPointer + 1, cmdHistoryList.length - 1);
        setHistoryPointer(nextPointer);
        setInputCmd(cmdHistoryList[nextPointer]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer > 0) {
        const nextPointer = historyPointer - 1;
        setHistoryPointer(nextPointer);
        setInputCmd(cmdHistoryList[nextPointer]);
      } else if (historyPointer === 0) {
        setHistoryPointer(-1);
        setInputCmd('');
      }
    }
  };

  const quickCommands = [
    'help',
    'ls',
    'tree',
    'status',
    'pwd',
    'whoami',
    'admin stats',
    'clear'
  ];

  if (!isOpen) return null;

  return (
    <div className="bg-term-bg border-t-2 border-term-green/50 shadow-2xl flex flex-col font-mono text-xs z-30 transition-all max-h-[360px] h-[320px]">
      {/* Shell Title Bar */}
      <div className="bg-term-surface border-b border-term-border px-3 py-1.5 flex items-center justify-between text-term-muted select-none shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-term-green-bright" />
          <span className="font-bold text-term-green-bright">TERMINAL INTERACTIVA // CLI SHELL</span>
          <span className="text-[11px] text-term-muted">
            [{currentNode?.code || 'ROOT'}]
          </span>
        </div>

        {/* Quick Command Chips */}
        <div className="hidden md:flex items-center gap-1">
          {quickCommands.map((qCmd) => (
            <button
              key={qCmd}
              onClick={() => handleExecute(qCmd)}
              className="px-2 py-0.5 rounded bg-term-panel hover:bg-term-green/20 text-term-green hover:text-term-green-bright border border-term-border text-[10px] transition-colors"
            >
              {qCmd}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistory([])}
            className="p-1 hover:text-term-amber transition-colors"
            title="Limpiar buffer (clear)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:text-term-red transition-colors"
            title="Cerrar terminal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Output Log Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-1.5 bg-[#070a10] terminal-screen text-term-text select-text"
      >
        {history.map((item) => (
          <div key={item.id} className="leading-relaxed">
            {item.type === 'input' && (
              <div className="text-term-cyan font-bold flex items-start gap-1">
                <span>{item.text}</span>
              </div>
            )}
            {item.type === 'system' && (
              <div className="text-term-muted text-[11px] italic">
                {item.text}
              </div>
            )}
            {item.type === 'error' && (
              <div className="text-term-red bg-term-red/10 border-l-2 border-term-red pl-2 py-0.5">
                {item.text}
              </div>
            )}
            {item.type === 'output' && (
              <pre className="text-term-text whitespace-pre-wrap font-mono text-[11.5px] leading-snug">
                {item.text}
              </pre>
            )}
          </div>
        ))}

        {isExecuting && (
          <div className="text-term-amber animate-pulse">
            [Ejecutando operacion en motor del sistema...]
          </div>
        )}
      </div>

      {/* Input Prompt Line */}
      <div className="p-2.5 bg-term-surface border-t border-term-border flex items-center gap-2 shrink-0">
        <span className="text-term-green-bright font-bold shrink-0">
          {user?.username || 'operator'}@nexus:[{currentNode?.code || 'ROOT'}]$
        </span>

        <input
          ref={inputRef}
          type="text"
          value={inputCmd}
          onChange={(e) => setInputCmd(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escriba un comando (ej: ls, cd DOM-INFRA, tree, task add 'Test', help)..."
          className="flex-1 bg-transparent text-term-text font-mono text-xs focus:outline-none placeholder-term-muted/50"
          autoFocus
        />

        <button
          onClick={() => handleExecute()}
          disabled={!inputCmd.trim() || isExecuting}
          className="px-2.5 py-1 rounded bg-term-green hover:bg-term-green-bright disabled:opacity-30 text-term-bg font-bold flex items-center gap-1 transition-all"
        >
          <Send className="w-3 h-3" />
          <span className="hidden sm:inline">Ejecutar</span>
        </button>
      </div>
    </div>
  );
}
