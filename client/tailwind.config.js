/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        term: {
          bg: '#0a0d14',
          surface: '#0f141e',
          panel: '#151b28',
          border: '#1f293d',
          line: '#27344d',
          green: '#10b981',
          'green-bright': '#00ff88',
          cyan: '#06b6d4',
          'cyan-bright': '#38bdf8',
          amber: '#f59e0b',
          'amber-bright': '#fbbf24',
          red: '#f43f5e',
          purple: '#a855f7',
          muted: '#64748b',
          text: '#e2e8f0'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'Monaco', '"Ubuntu Mono"', 'monospace']
      },
      animation: {
        'cursor-blink': 'blink 1s step-start infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite'
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
}
