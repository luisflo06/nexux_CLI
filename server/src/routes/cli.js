import express from 'express';
import { memoryDb, isRealPostgres } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function buildAsciiTree(nodes, parentId = null, prefix = '') {
  const children = nodes.filter(n => n.parent_id === parentId);
  let output = '';

  children.forEach((child, index) => {
    const isLast = index === children.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const icon = child.type === 'ROOT' ? '⚡ ' :
                 child.type === 'DOMAIN' ? '📁 ' :
                 child.type === 'PROJECT' ? '📦 ' :
                 child.type === 'MODULE' ? '🧩 ' : '🎯 ';

    output += `${prefix}${connector}${icon}[${child.code}] ${child.name} (${child.status} - ${child.progress}%)\n`;

    const subPrefix = prefix + (isLast ? '    ' : '│   ');
    output += buildAsciiTree(nodes, child.id, subPrefix);
  });

  return output;
}

// POST /api/cli/exec - Command Execution Parser
router.post('/exec', authenticateToken, (req, res) => {
  try {
    const { command, currentNodeId } = req.body;

    if (!command || typeof command !== 'string') {
      return res.json({ output: '' });
    }

    const trimmed = command.trim();
    if (!trimmed) {
      return res.json({ output: '' });
    }

    const parts = trimmed.split(' ').filter(Boolean);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const activeNodeId = currentNodeId ? parseInt(currentNodeId, 10) : 1;
    const currentNode = memoryDb.nodes.find(n => n.id === activeNodeId) || memoryDb.nodes[0];

    // Log the CLI execution
    memoryDb.logAudit(
      req.user.id,
      'CLI_EXEC',
      'TERMINAL',
      currentNode.id,
      trimmed,
      `Comando ejecutado desde prompt en ${currentNode.code}`
    );

    switch (cmd) {
      case 'help': {
        const helpText = `
\x1b[36m╔════════════════════════════════════════════════════════════════════════╗
║                   NEXUS-CLI OPERATING SYSTEM SHELL                     ║
╚════════════════════════════════════════════════════════════════════════╝\x1b[0m

\x1b[33mNAVEGACION Y ARBOL DE PROYECTOS:\x1b[0m
  pwd                     Muestra la ruta jerarquica actual (migajas de pan).
  ls                      Lista los sub-nodos y tareas en el nodo actual.
  cd <code|id|..|/>       Navega por las ramas del arbol (ej: cd DOM-INFRA, cd ..).
  tree                    Renderiza el arbol completo ramificado en ASCII.
  cat <code|id>           Muestra los detalles completos de un nodo o tarea.

\x1b[33mGESTION DE PROYECTOS Y TAREAS:\x1b[0m
  status                  Resumen de salud y progreso del nodo actual.
  task list               Lista todas las tareas del nodo actual.
  task done <code|id>     Marca una tarea como completada (DONE).
  task start <code|id>    Inicia el trabajo en una tarea (IN_PROGRESS).
  task add "<titulo>"     Crea una nueva tarea en el nodo activo.
  mkdir <code> "<nombre>" Crea una nueva rama o sub-proyecto bajo el nodo activo.

\x1b[33mSISTEMA Y ADMINISTRACION:\x1b[0m
  whoami                  Muestra usuario autenticado, rol y privilegios.
  admin stats             Telemetria de rendimiento y estado del sistema.
  audit                   Muestra los ultimos eventos del registro de auditoria.
  clear                   Limpia el buffer de la terminal.
`;
        return res.json({ output: helpText });
      }

      case 'pwd': {
        const crumbs = memoryDb.getBreadcrumbs(currentNode.id);
        const pathStr = '/' + crumbs.map(c => c.code.toLowerCase()).join('/');
        return res.json({ output: `Ruta jerarquica: \x1b[32m${pathStr}\x1b[0m (Nodo: [${currentNode.code}] ${currentNode.name})` });
      }

      case 'whoami': {
        return res.json({
          output: `
Operador:   \x1b[32m${req.user.username}\x1b[0m
Nombre:     ${req.user.full_name}
Nivel:      \x1b[33m${req.user.role.toUpperCase()}\x1b[0m
Host:       nexus-cli-server:4000
Motor DB:   ${isRealPostgres ? 'PostgreSQL Native' : 'PostgreSQL-Memory Bridge'}
`
        });
      }

      case 'tree': {
        const ascii = buildAsciiTree(memoryDb.nodes, null);
        return res.json({ output: `\x1b[36mARBOL JERARQUICO DEL SISTEMA:\x1b[0m\n${ascii}` });
      }

      case 'ls': {
        const children = memoryDb.nodes.filter(n => n.parent_id === currentNode.id);
        const tasks = memoryDb.tasks.filter(t => t.node_id === currentNode.id);

        let out = `\x1b[1mDIRECTORIO: [${currentNode.code}] ${currentNode.name}\x1b[0m\n`;
        out += `Tipo: ${currentNode.type} | Estado: ${currentNode.status} | Progreso: ${currentNode.progress}%\n\n`;

        out += `\x1b[33m--- RAMAS / SUB-NODOS (${children.length}) ---\x1b[0m\n`;
        if (children.length === 0) {
          out += `  (No hay sub-ramas directas. Nodo hoja)\n`;
        } else {
          children.forEach(c => {
            const padCode = c.code.padEnd(16, ' ');
            const padType = `[${c.type}]`.padEnd(12, ' ');
            out += `  📁 ${padCode} ${padType} ${c.name} (${c.progress}%)\n`;
          });
        }

        out += `\n\x1b[33m--- TAREAS ASIGNADAS (${tasks.length}) ---\x1b[0m\n`;
        if (tasks.length === 0) {
          out += `  (No hay tareas registradas en este nodo)\n`;
        } else {
          tasks.forEach(t => {
            const padCode = t.code.padEnd(16, ' ');
            const statusColor = t.status === 'DONE' ? '\x1b[32m' :
                                t.status === 'IN_PROGRESS' ? '\x1b[34m' :
                                t.status === 'BLOCKED' ? '\x1b[31m' : '\x1b[37m';
            out += `  ⚙️ ${padCode} ${statusColor}[${t.status.padEnd(11, ' ')}]\x1b[0m ${t.title}\n`;
          });
        }

        return res.json({ output: out });
      }

      case 'cd': {
        const target = args[0];
        if (!target || target === '/') {
          // Go to root
          const rootNode = memoryDb.nodes.find(n => n.parent_id === null) || memoryDb.nodes[0];
          return res.json({
            output: `Navegando a la raiz: [${rootNode.code}] ${rootNode.name}`,
            newPathId: rootNode.id
          });
        }

        if (target === '..') {
          if (currentNode.parent_id) {
            const parent = memoryDb.nodes.find(n => n.id === currentNode.parent_id);
            return res.json({
              output: `Subiendo un nivel a: [${parent.code}] ${parent.name}`,
              newPathId: parent.id
            });
          }
          return res.json({ output: `Ya te encuentras en el nodo raiz [${currentNode.code}]. No hay nivel superior.` });
        }

        // Search by code or id or slug
        const targetClean = target.toUpperCase();
        const found = memoryDb.nodes.find(n =>
          n.code.toUpperCase() === targetClean ||
          n.slug.toUpperCase() === targetClean ||
          n.id === parseInt(target, 10)
        );

        if (found) {
          return res.json({
            output: `Directorio cambiado a: \x1b[32m[${found.code}]\x1b[0m ${found.name} (${found.type})`,
            newPathId: found.id
          });
        }

        return res.json({
          output: `\x1b[31mError:\x1b[0m No se encontro ningun nodo con identificador '${target}'. Use 'ls' o 'tree' para ver las ramas disponibles.`
        });
      }

      case 'cat': {
        const targetCode = (args[0] || '').toUpperCase();
        if (!targetCode) {
          return res.json({ output: 'Uso: cat <codigo_tarea|codigo_nodo> (ej: cat TSK-101 o cat PRJ-K8S)' });
        }

        // Try task first
        const task = memoryDb.tasks.find(t => t.code.toUpperCase() === targetCode || t.id === parseInt(targetCode, 10));
        if (task) {
          const assignee = memoryDb.users.find(u => u.id === task.assigned_to);
          const node = memoryDb.nodes.find(n => n.id === task.node_id);
          return res.json({
            output: `
\x1b[36m=== DETALLES DE TAREA: [${task.code}] ===\x1b[0m
Titulo:         ${task.title}
Nodo Padre:     [${node ? node.code : '?'}] ${node ? node.name : '?'}
Estado:         \x1b[33m${task.status}\x1b[0m
Prioridad:      ${task.priority}
Asignado:       ${assignee ? assignee.full_name : 'Sin asignar'} (@${assignee ? assignee.username : 'none'})
Horas:          ${task.logged_hours}h / ${task.estimated_hours}h
Etiquetas:      ${task.tags ? task.tags.join(', ') : 'ninguna'}
Descripcion:
  ${task.description || '(Sin descripcion detallada)'}
`
          });
        }

        // Try node
        const node = memoryDb.nodes.find(n => n.code.toUpperCase() === targetCode || n.id === parseInt(targetCode, 10));
        if (node) {
          const lead = memoryDb.users.find(u => u.id === node.lead_id);
          const crumbs = memoryDb.getBreadcrumbs(node.id);
          return res.json({
            output: `
\x1b[36m=== ESPECIFICACION DE NODO: [${node.code}] ===\x1b[0m
Nombre:         ${node.name}
Tipo:           ${node.type}
Ruta:           ${crumbs.map(c => c.code).join(' > ')}
Estado:         ${node.status}
Prioridad:      ${node.priority}
Lider:          ${lead ? lead.full_name : 'Sin asignar'}
Progreso:       ${node.progress}%
Descripcion:
  ${node.description || '(Sin descripcion)'}
`
          });
        }

        return res.json({ output: `\x1b[31mError:\x1b[0m No se encontro elemento con clave '${targetCode}'.` });
      }

      case 'task': {
        const sub = (args[0] || 'list').toLowerCase();

        if (sub === 'done' || sub === 'start') {
          const tCode = (args[1] || '').toUpperCase();
          const task = memoryDb.tasks.find(t => t.code.toUpperCase() === tCode || t.id === parseInt(tCode, 10));
          if (!task) {
            return res.json({ output: `\x1b[31mError:\x1b[0m Tarea '${tCode}' no encontrada.` });
          }
          task.status = sub === 'done' ? 'DONE' : 'IN_PROGRESS';
          if (sub === 'done') task.logged_hours = task.estimated_hours;
          task.updated_at = new Date().toISOString();

          return res.json({
            output: `Tarea [${task.code}] actualizada a estado \x1b[32m${task.status}\x1b[0m.`,
            action: 'REFRESH'
          });
        }

        if (sub === 'add') {
          const title = args.slice(1).join(' ').replace(/^["']|["']$/g, '');
          if (!title) {
            return res.json({ output: 'Uso: task add "<titulo de la tarea>"' });
          }
          const taskCount = memoryDb.tasks.filter(t => t.node_id === currentNode.id).length + 1;
          const code = `${currentNode.code}-T${String(taskCount).padStart(2, '0')}`;
          const newTask = {
            id: memoryDb.nextTaskId++,
            code,
            node_id: currentNode.id,
            title,
            description: 'Creada via CLI shell',
            status: 'TODO',
            priority: 'NORMAL',
            assigned_to: req.user.id,
            estimated_hours: 4.0,
            logged_hours: 0,
            tags: ['cli'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          memoryDb.tasks.push(newTask);
          return res.json({
            output: `\x1b[32mTarea [${code}] creada exitosamente en [${currentNode.code}]: "${title}"\x1b[0m`,
            action: 'REFRESH'
          });
        }

        // Default: list tasks
        const currentTasks = memoryDb.tasks.filter(t => t.node_id === currentNode.id);
        if (currentTasks.length === 0) {
          return res.json({ output: `No hay tareas en el nodo [${currentNode.code}]. Use: task add "<titulo>"` });
        }
        let listOut = `Tareas en [${currentNode.code}]:\n`;
        currentTasks.forEach(t => {
          listOut += `  - [${t.code}] (${t.status}) ${t.title}\n`;
        });
        return res.json({ output: listOut });
      }

      case 'mkdir': {
        const code = (args[0] || '').toUpperCase().replace(/\s+/g, '-');
        const name = args.slice(1).join(' ').replace(/^["']|["']$/g, '');

        if (!code || !name) {
          return res.json({ output: 'Uso: mkdir <CODIGO> "<Nombre de la rama o modulo>" (ej: mkdir MOD-CACHE "Modulo Redis Cache")' });
        }

        if (memoryDb.nodes.find(n => n.code === code)) {
          return res.json({ output: `\x1b[31mError:\x1b[0m El codigo '${code}' ya existe en el arbol.` });
        }

        const newNode = {
          id: memoryDb.nextNodeId++,
          code,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          type: currentNode.type === 'ROOT' ? 'DOMAIN' :
                currentNode.type === 'DOMAIN' ? 'PROJECT' : 'MODULE',
          parent_id: currentNode.id,
          description: 'Creado via CLI shell',
          status: 'ACTIVE',
          priority: 'NORMAL',
          lead_id: req.user.id,
          progress: 0,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        memoryDb.nodes.push(newNode);
        return res.json({
          output: `\x1b[32mRama creada con exito:\x1b[0m [${newNode.code}] ${newNode.name} (Tipo: ${newNode.type}) bajo [${currentNode.code}]`,
          action: 'REFRESH'
        });
      }

      case 'status': {
        const crumbs = memoryDb.getBreadcrumbs(currentNode.id);
        const children = memoryDb.nodes.filter(n => n.parent_id === currentNode.id);
        const tasks = memoryDb.tasks.filter(t => t.node_id === currentNode.id);
        const done = tasks.filter(t => t.status === 'DONE').length;

        return res.json({
          output: `
\x1b[36m╔══════════════════════════════════════════════════════════════╗
  ESTADO DEL NODO: [${currentNode.code}] ${currentNode.name}
╚══════════════════════════════════════════════════════════════╝\x1b[0m
Nivel Jerarquico:  ${crumbs.map(c => c.name).join(' / ')}
Tipo:              ${currentNode.type}
Prioridad:         ${currentNode.priority}
Estado Operativo:  ${currentNode.status}
Progreso Reportado:${currentNode.progress}%
Sub-ramas:         ${children.length}
Tareas:            ${tasks.length} (${done} completadas, ${tasks.length - done} pendientes)
`
        });
      }

      case 'admin': {
        if (args[0] === 'stats') {
          const totalNodes = memoryDb.nodes.length;
          const totalTasks = memoryDb.tasks.length;
          const doneTasks = memoryDb.tasks.filter(t => t.status === 'DONE').length;
          const projects = memoryDb.nodes.filter(n => n.type === 'PROJECT');
          return res.json({
            output: `
\x1b[35m=== TELEMETRIA DEL DASHBOARD ADMINISTRATIVO ===\x1b[0m
Total Nodos en Arbol:   ${totalNodes}
Proyectos Activos:      ${projects.length}
Total Tareas:           ${totalTasks} (${doneTasks} resueltas - ${Math.round((doneTasks/Math.max(totalTasks,1))*100)}% exito)
Operadores en Sistema:  ${memoryDb.users.length}
Eventos de Auditoria:   ${memoryDb.auditLogs.length} logs
Base de Datos:          ${isRealPostgres ? 'PostgreSQL Native Socket (Live)' : 'PostgreSQL Emulated Memory Driver'}
`
          });
        }
        return res.json({ output: 'Uso: admin stats | admin users | admin logs' });
      }

      case 'audit': {
        const recent = memoryDb.auditLogs.slice(0, 8);
        let out = `\x1b[33m--- REGISTRO DE AUDITORIA RECIENTE ---\x1b[0m\n`;
        recent.forEach(l => {
          const time = new Date(l.created_at).toLocaleTimeString();
          out += `[${time}] \x1b[36m${l.action.padEnd(16, ' ')}\x1b[0m ${l.command_executed || l.details}\n`;
        });
        return res.json({ output: out });
      }

      default:
        return res.json({
          output: `\x1b[31mComando no reconocido:\x1b[0m '${cmd}'. Escriba \x1b[32mhelp\x1b[0m para ver la lista de comandos disponibles.`
        });
    }
  } catch (err) {
    res.status(500).json({ output: `Error de ejecucion CLI: ${err.message}` });
  }
});

export default router;
