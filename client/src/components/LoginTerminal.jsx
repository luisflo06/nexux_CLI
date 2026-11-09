import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AsciiBanner from './AsciiBanner';
import { Terminal, Lock, ArrowRight, AlertCircle, Key } from 'lucide-react';

export default function LoginTerminal() {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Credenciales incompletas. Ingrese usuario y contraseña.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Error de autenticacion en el host central.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-4 terminal-screen select-none">
      <div className="w-full max-w-2xl bg-term-surface border border-term-border rounded-lg shadow-2xl shadow-term-green/5 overflow-hidden">
        {/* Terminal Header Bar */}
        <div className="bg-term-panel border-b border-term-border px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-term-red/80 border border-red-500/50 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-term-amber/80 border border-yellow-500/50 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-term-green/80 border border-emerald-500/50 inline-block"></span>
            <span className="text-xs font-mono text-term-muted ml-2">nexus-login://tty1</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-term-green-bright">
            <Lock className="w-3.5 h-3.5" />
            <span>SECURE SHELL (SSH/TLS)</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* ASCII Banner */}
          <AsciiBanner />

          {/* System Boot Diagnostics Log */}
          <div className="bg-[#05080f] border border-term-border rounded p-3 text-xs font-mono space-y-1 text-term-muted">
            <div className="flex items-center gap-2">
              <span className="text-term-green-bright font-bold">[ OK ]</span>
              <span>Iniciando subsistema de proyectos jerarquicos...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-term-green-bright font-bold">[ OK ]</span>
              <span>Montando repositorio PostgreSQL relacional (ACID compliant)...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-term-cyan font-bold">[ INFO ]</span>
              <span>Modo: Sistema interno on-premise (No SaaS / Aislado).</span>
            </div>
            <div className="flex items-center gap-2 text-term-amber">
              <span className="font-bold">[ AUTH ]</span>
              <span>Autenticacion requerida para desbloquear arbol de proyectos.</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-term-red/10 border border-term-red/50 rounded flex items-center gap-2 text-xs text-term-red font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form CLI Formatted */}
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label htmlFor="cli-login-username" className="block text-term-muted mb-1 flex items-center gap-1.5">
                  <span className="text-term-green-bright">$</span>
                  <span>nexus.system login:</span>
                </label>
                <input
                  id="cli-login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario..."
                  className="w-full bg-[#05080f] border border-term-border rounded p-2.5 text-term-text focus:outline-none focus:border-term-green/80 font-mono text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="cli-login-password" className="block text-term-muted mb-1 flex items-center gap-1.5">
                  <span className="text-term-green-bright">$</span>
                  <span>password:</span>
                </label>
                <input
                  id="cli-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#05080f] border border-term-border rounded p-2.5 text-term-text focus:outline-none focus:border-term-green/80 font-mono text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-term-green hover:bg-term-green-bright disabled:opacity-50 text-term-bg font-mono font-bold rounded shadow-lg shadow-term-green/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Terminal className="w-4 h-4" />
              <span>{isSubmitting ? 'Verificando Hash...' : 'Desbloquear Sesion CLI'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Pre-seeded Demo Credentials */}
          <div className="border-t border-term-border pt-4 space-y-2">
            <div className="text-[11px] font-mono text-term-muted flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-term-amber" />
              <span>ACCESOS RAPIDOS PARA DEMO (Haga clic para auto-rellenar):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCredentials('admin', 'admin123')}
                className={`p-2 rounded border text-left font-mono text-xs transition-colors ${
                  username === 'admin'
                    ? 'bg-term-green/10 border-term-green/50 text-term-green-bright'
                    : 'bg-term-panel border-term-border text-term-text hover:border-term-line'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>admin</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-term-red/20 text-term-red">ROOT</span>
                </div>
                <div className="text-[10px] text-term-muted">pass: admin123</div>
              </button>

              <button
                type="button"
                onClick={() => setCredentials('operator', 'operator123')}
                className={`p-2 rounded border text-left font-mono text-xs transition-colors ${
                  username === 'operator'
                    ? 'bg-term-cyan/10 border-term-cyan/50 text-term-cyan'
                    : 'bg-term-panel border-term-border text-term-text hover:border-term-line'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>operator</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-term-cyan/20 text-term-cyan">LEAD</span>
                </div>
                <div className="text-[10px] text-term-muted">pass: operator123</div>
              </button>

              <button
                type="button"
                onClick={() => setCredentials('sarah', 'sarah123')}
                className={`p-2 rounded border text-left font-mono text-xs transition-colors ${
                  username === 'sarah'
                    ? 'bg-term-amber/10 border-term-amber/50 text-term-amber'
                    : 'bg-term-panel border-term-border text-term-text hover:border-term-line'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>sarah</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-term-amber/20 text-term-amber">ENG</span>
                </div>
                <div className="text-[10px] text-term-muted">pass: sarah123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-term-panel border-t border-term-border px-4 py-2 text-[11px] font-mono text-term-muted flex justify-between">
          <span>PORT: 4000 (Express Daemon)</span>
          <span className="text-term-green">STATUS: READY_FOR_HANDSHAKE</span>
        </div>
      </div>
    </div>
  );
}
