import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Shield, Activity, Database, LogOut, LayoutDashboard, GitBranch, Cpu } from 'lucide-react';

export default function TerminalHeader({ currentView, setCurrentView, isCliOpen, setIsCliOpen }) {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-term-surface border-b border-term-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Window Controls & System Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-term-red/80 border border-red-500/50 inline-block shadow-sm shadow-red-500/20" title="Close window"></span>
          <span className="w-3 h-3 rounded-full bg-term-amber/80 border border-yellow-500/50 inline-block shadow-sm shadow-yellow-500/20" title="Minimize"></span>
          <span className="w-3 h-3 rounded-full bg-term-green/80 border border-emerald-500/50 inline-block shadow-sm shadow-emerald-500/20" title="Maximize"></span>
        </div>

        <div className="h-4 w-px bg-term-border mx-1"></div>

        <div className="flex items-center gap-2 font-semibold">
          <Terminal className="w-4 h-4 text-term-green-bright" />
          <span className="text-term-green-bright tracking-wider">nexus-pm@host</span>
          <span className="text-term-muted">/dev/pts/0</span>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-term-panel border border-term-border rounded p-0.5 ml-2">
          <button
            onClick={() => setCurrentView('tree')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              currentView === 'tree'
                ? 'bg-term-green/20 text-term-green-bright font-bold border border-term-green/40 shadow-sm'
                : 'text-term-muted hover:text-term-text'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>[1] Arbol Ramificado</span>
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              currentView === 'admin'
                ? 'bg-term-purple/20 text-term-purple font-bold border border-term-purple/40 shadow-sm'
                : 'text-term-muted hover:text-term-text'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>[2] Admin Dashboard</span>
          </button>
        </div>
      </div>

      {/* Telemetry & User Badges */}
      <div className="flex items-center gap-3">
        {/* DB Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-term-panel border border-term-border rounded text-[11px] text-term-cyan">
          <Database className="w-3 h-3 text-term-cyan" />
          <span className="text-term-muted">DB:</span>
          <span className="font-semibold">PostgreSQL ACID</span>
          <span className="w-1.5 h-1.5 rounded-full bg-term-green-bright animate-pulse"></span>
        </div>

        {/* System Clock */}
        <div className="hidden md:flex items-center gap-1 text-[11px] text-term-muted px-2 py-0.5 bg-term-panel border border-term-border rounded">
          <Activity className="w-3 h-3 text-term-amber" />
          <span>{time}</span>
        </div>

        {/* User Identity */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-term-panel border border-term-border rounded">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: user?.avatar_color || '#10b981' }}
          ></div>
          <span className="text-term-text font-bold">
            {user?.username || 'operator'}
          </span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
            user?.role === 'admin' || user?.role === 'root'
              ? 'bg-term-red/20 text-term-red border border-term-red/40'
              : 'bg-term-cyan/20 text-term-cyan border border-term-cyan/40'
          }`}>
            {user?.role?.toUpperCase() || 'ENGINEER'}
          </span>
        </div>

        {/* Toggle CLI Panel Button */}
        <button
          onClick={() => setIsCliOpen(!isCliOpen)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-bold transition-all ${
            isCliOpen
              ? 'bg-term-green text-term-bg border-term-green font-black shadow-lg shadow-term-green/20'
              : 'bg-term-panel text-term-green-bright border-term-green/40 hover:bg-term-green/10'
          }`}
          title="Abrir o cerrar la terminal CLI interactiva"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>CLI (~ / F12)</span>
        </button>

        {/* Logout CLI Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1 px-2 py-1 text-term-muted hover:text-term-red hover:bg-term-red/10 border border-transparent hover:border-term-red/30 rounded transition-colors"
          title="Cerrar sesion (exit)"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">exit</span>
        </button>
      </div>
    </header>
  );
}
