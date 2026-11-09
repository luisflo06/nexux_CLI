# ⚡ NEXUS-CLI // Sistema de Gestión de Proyectos Ramificado

> Sistema de gestión de proyectos interno (On-Premise / Non-SaaS) con estética **CLI / Terminal de Operaciones**, arquitectura en **árbol ramificado**, navegación por **migajas de pan (breadcrumbs)** y **dashboard administrativo**, desarrollado con **Node.js, React, Tailwind CSS y PostgreSQL**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
|---|---|---|
| **Backend** | **Node.js 24 + Express** | Daemon REST API con JWT, hashing bcrypt y parseador interactivo de comandos CLI. |
| **Base de Datos** | **PostgreSQL (ACID)** | Modelado relacional (`schema.sql`) con soporte dual (PostgreSQL nativo + adaptador en memoria PG-compatible para ejecución inmediata sin dependencias externas). |
| **Frontend** | **React 18 + Vite** | SPA reactiva con arquitectura de componentes modulares y Context API. |
| **Estilos & UI** | **Tailwind CSS v3** | Paleta hacker/cyber terminal, tipografía monospace (*JetBrains Mono*), cursor parpadeante, efectos scanline y acentos fosforescentes. |
| **Iconografía** | **Lucide React** | Glifos vectoriales estilizados para la terminal. |

---

## 🚀 Inicio Rápido (Quickstart)

El proyecto ya está completamente configurado y compilado en el directorio.

### 1. Iniciar Servidor Backend y Cliente Frontend simultáneamente:
Desde la raíz del proyecto (`c:\Users\LUISFLO\Desktop\nose_nose`):

```bash
npm run dev
```

Esto levantará concurrentemente:
- **API Backend**: `http://localhost:4000`
- **Interfaz Web CLI**: `http://localhost:5173`

*(O si prefieres ejecutarlos en consolas separadas)*:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

Abre tu navegador en: **`http://localhost:5173`**

---

## 🔑 Credenciales de Acceso Demo

La pantalla de login emula un arranque de terminal con botones de auto-completado para pruebas inmediatas:

| Usuario | Contraseña | Rol | Privilegios |
|---|---|---|---|
| **`admin`** | `admin123` | **`ROOT / ADMIN`** | Control total, Dashboard Administrativo, Purgado y Reinicio maestro. |
| **`operator`** | `operator123` | **`LEAD`** | Gestión de ramas de proyectos, asignación y resolución de tareas. |
| **`sarah`** | `sarah123` | **`ENGINEER`** | Operador técnico, avance de tareas y telemetría. |

---

## 🌳 Características Principales

### 1. Sistema Ramificado (Árbol Jerárquico)
Estructura padre-hijo multi-nivel modelada con llaves foráneas en cascada:
```
[SYS-CORE] Nexus Operations Root
 ├── [DOM-INFRA] Infraestructura & Cloud Mesh
 │    ├── [PRJ-K8S] Cluster Kubernetes v1.30 Upgrade
 │    │    ├── [MOD-INGRESS] Traefik Ingress Controller & mTLS
 │    │    └── [MOD-KEDA] KEDA Event-driven Pod Autoscaler
 │    └── [PRJ-OBS] Telemetry & OpenTelemetry Stack
 ├── [DOM-SEC] Ciberseguridad & Zero-Trust
 │    └── [PRJ-IAM] Kernel-Level Zero-Trust Boundary
 │         └── [MLS-PENTEST] Fase 1: Auditoría Externa
 └── [DOM-APP] Core Application Platforms
      └── [PRJ-LEDGER] High-Throughput Financial Ledger v3
           └── [MOD-RECONCILE] Conciliación Bancaria Automatizada
```

### 2. Migajas de Pan (Breadcrumbs)
- Barra de navegación tipo ruta UNIX (`$ pwd: /sys-core/dom-infra/prj-k8s/mod-ingress`).
- Cada segmento es un botón interactivo que permite saltar directamente a cualquier nivel jerárquico superior.
- Incluye botón de copiado rápido al portapapeles.

### 3. Dashboard Administrativo
- **Métricas Globales**: Total de nodos, proyectos, porcentaje de éxito, horas invertidas vs estimadas.
- **Tabla de Control**: Filtrado por tipo (Dominio, Proyecto, Módulo, Hito) y búsqueda en tiempo real, edición y eliminación.
- **Stream de Auditoría (`audit.log`)**: Registro de accesos, ejecuciones de comandos y mutaciones en vivo.
- **Exportación de Topología**: Descarga del mapa de proyectos completo en formato JSON estructurado.
- **Reinicio Maestro (Reset DEMO)**: Restaura la topología a los datos semilla originales con un clic.

### 4. Terminal Interactiva CLI (Shell Embebido)
Presiona **`~`** o **`F12`** o haz clic en **`CLI (~ / F12)`** en el encabezado superior para abrir la consola de comandos interactiva:

| Comando | Descripción | Ejemplo |
|---|---|---|
| `help` | Muestra la ayuda de comandos disponibles. | `help` |
| `ls` | Lista los sub-nodos y tareas del directorio actual. | `ls` |
| `cd <code/..>` | Navega por las ramas del sistema. | `cd DOM-INFRA` o `cd ..` |
| `pwd` | Imprime la ruta jerárquica actual. | `pwd` |
| `tree` | Renderiza el árbol completo en ASCII. | `tree` |
| `status` | Muestra métricas de salud del nodo activo. | `status` |
| `cat <code>` | Inspecciona especificaciones de una tarea o nodo. | `cat TSK-101` |
| `task add "<tit>"` | Crea una nueva tarea en el nodo activo vía CLI. | `task add "Verificar TLS"` |
| `task done <code>` | Marca una tarea como resuelta. | `task done TSK-102` |
| `mkdir <code> "<nom>"`| Crea una nueva sub-rama bajo el nodo activo. | `mkdir MOD-CACHE "Redis Cache"`|
| `whoami` | Muestra usuario, permisos y driver de base de datos. | `whoami` |
| `admin stats` | Muestra la telemetría del dashboard en ASCII. | `admin stats` |
| `clear` | Limpia la consola. | `clear` |

---

## 🗄️ Configuración de PostgreSQL

El sistema cuenta con un archivo **`server/src/db/schema.sql`** con las tablas (`users`, `nodes`, `tasks`, `audit_logs`), índices y restricciones de integridad relacional.

### Opción A: Ejecución Inmediata (Sin instalar PostgreSQL)
El servidor incluye un **driver inteligente PG-Compatible en memoria**. Si detecta que no hay una instancia de PostgreSQL en el puerto 5432, se activa automáticamente sin interrupciones, permitiendo probar toda la aplicación, CRUD, árbol, tareas y dashboard al instante.

### Opción B: Conectar a PostgreSQL Real con Docker (Opcional)
Si deseas conectar un PostgreSQL real, simplemente ejecuta en la raíz:

```bash
docker compose up -d
```
Esto levantará un contenedor con PostgreSQL 16 Alpine en el puerto `5432` con la base de datos `nexus_cli_pm` y ejecutará automáticamente `schema.sql`. Al reiniciar el backend, este detectará la base de datos PostgreSQL nativa.
