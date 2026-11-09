import React from 'react';

export default function AsciiBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="text-[10px] text-term-green/70 font-mono tracking-tighter leading-none select-none">
        <pre>{`_  _ ____ _  _ _  _ ____    ____ _    _ 
|\\ | |___  \\/  |  | [__  __ |    |    | 
| \\| |___ _/\\_ |__| ___]    |___ |___ | `}</pre>
      </div>
    );
  }

  return (
    <div className="font-mono text-term-green select-none overflow-x-auto py-2">
      <pre className="text-[11px] leading-tight glow-green font-bold">
{` ███╗   ██╗███████╗██╗   ██╗██╗   ██╗███████╗       ██████╗██╗     ██╗
 ████╗  ██║██╔════╝╚██╗ ██╔╝██║   ██║██╔════╝      ██╔════╝██║     ██║
 ██╔██╗ ██║█████╗   ╚████╔╝ ██║   ██║███████╗█████╗██║     ██║     ██║
 ██║╚██╗██║██╔══╝    ╚██╔╝  ██║   ██║╚════██║╚════╝██║     ██║     ██║
 ██║ ╚████║███████╗   ██║   ╚██████╔╝███████║      ╚██████╗███████╗██║
 ╚═╝  ╚═══╝╚══════╝   ╚═╝    ╚═════╝ ╚══════╝       ╚═════╝╚══════╝╚═╝`}
      </pre>
      <div className="flex items-center gap-3 text-xs text-term-muted mt-1 border-t border-term-border pt-1">
        <span className="text-term-cyan-bright font-semibold">KERNEL v2.4.0-ACID</span>
        <span>::</span>
        <span className="text-term-amber-bright">RAMIFIED PROJECT TREE OS</span>
        <span>::</span>
        <span className="text-term-green-bright">POSTGRESQL REPOSITORY ENGINE</span>
      </div>
    </div>
  );
}
