import React from 'react';
import { ChevronRight, Home, Copy, Check, Folder, Layers, Box, Milestone } from 'lucide-react';

export default function Breadcrumbs({ breadcrumbs = [], onSelectNode }) {
  const [copied, setCopied] = React.useState(false);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ROOT':
        return <Home className="w-3.5 h-3.5 text-term-green" />;
      case 'DOMAIN':
        return <Folder className="w-3.5 h-3.5 text-term-cyan" />;
      case 'PROJECT':
        return <Box className="w-3.5 h-3.5 text-term-green-bright" />;
      case 'MODULE':
        return <Layers className="w-3.5 h-3.5 text-term-amber" />;
      case 'MILESTONE':
        return <Milestone className="w-3.5 h-3.5 text-term-purple" />;
      default:
        return <Folder className="w-3.5 h-3.5 text-term-muted" />;
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'ROOT':
        return 'text-term-green bg-term-green/10 border-term-green/30';
      case 'DOMAIN':
        return 'text-term-cyan bg-term-cyan/10 border-term-cyan/30';
      case 'PROJECT':
        return 'text-term-green-bright bg-emerald-500/10 border-emerald-500/30 font-bold';
      case 'MODULE':
        return 'text-term-amber bg-term-amber/10 border-term-amber/30';
      case 'MILESTONE':
        return 'text-term-purple bg-term-purple/10 border-term-purple/30';
      default:
        return 'text-term-muted bg-term-panel border-term-border';
    }
  };

  const fullPath = '/' + breadcrumbs.map(b => b.code.toLowerCase()).join('/');

  const copyPath = () => {
    navigator.clipboard.writeText(fullPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-term-surface border-b border-term-border px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
      {/* Breadcrumb pills chain */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
        <span className="text-term-muted font-mono select-none mr-1 flex items-center gap-1">
          <span className="text-term-green">$</span>
          <span>pwd:</span>
        </span>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={crumb.id}>
              <button
                onClick={() => onSelectNode(crumb.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all ${
                  isLast
                    ? 'bg-term-panel border-term-green/50 text-term-text font-bold shadow-sm shadow-term-green/10 ring-1 ring-term-green/30'
                    : 'bg-term-bg/60 border-term-border text-term-muted hover:text-term-text hover:border-term-line hover:bg-term-panel'
                }`}
                title={`Saltar a nivel: [${crumb.code}] ${crumb.name}`}
              >
                {getTypeIcon(crumb.type)}
                <span className={`text-[10px] px-1 py-0.2 rounded border font-mono ${getTypeBadgeStyle(crumb.type)}`}>
                  {crumb.type}
                </span>
                <span className="font-mono text-term-text font-medium">
                  {crumb.code}
                </span>
                <span className="text-term-muted hidden sm:inline text-[11px] max-w-[120px] truncate">
                  ({crumb.name})
                </span>
              </button>

              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-term-border shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Path string & quick copy */}
      <div className="flex items-center gap-2 bg-term-bg border border-term-border rounded px-2.5 py-1 text-[11px] font-mono shrink-0">
        <span className="text-term-muted">PATH:</span>
        <span className="text-term-cyan truncate max-w-[200px] md:max-w-xs">{fullPath}</span>
        <button
          onClick={copyPath}
          className="text-term-muted hover:text-term-green transition-colors"
          title="Copiar ruta de migajas de pan al portapapeles"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-term-green" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
