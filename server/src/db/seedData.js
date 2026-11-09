import bcrypt from 'bcryptjs';

export const initialUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@terminal.internal',
    password_hash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    full_name: 'SysAdmin Root (Administrator)',
    avatar_color: '#10b981',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 2,
    username: 'operator',
    email: 'operator@terminal.internal',
    password_hash: bcrypt.hashSync('operator123', 10),
    role: 'lead',
    full_name: 'Alex Vance (Lead Operator)',
    avatar_color: '#06b6d4',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 3,
    username: 'sarah',
    email: 'sarah@terminal.internal',
    password_hash: bcrypt.hashSync('sarah123', 10),
    role: 'engineer',
    full_name: 'Sarah Connor (Senior Core Eng)',
    avatar_color: '#f59e0b',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 4,
    username: 'neo',
    email: 'neo@terminal.internal',
    password_hash: bcrypt.hashSync('neo123', 10),
    role: 'engineer',
    full_name: 'Thomas Anderson (SecOps)',
    avatar_color: '#8b5cf6',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  }
];

export const initialNodes = [
  // Root Level
  {
    id: 1,
    code: 'SYS-CORE',
    name: 'Nexus Operations Root',
    slug: 'nexus-root',
    type: 'ROOT',
    parent_id: null,
    description: 'Directorio raiz maestro del sistema de proyectos empresariales.',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    lead_id: 1,
    progress: 72,
    metadata: { env: 'production', cluster: 'us-east-1' },
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },

  // 1st Level: Domains (Ramas Principales)
  {
    id: 2,
    code: 'DOM-INFRA',
    name: 'Infraestructura & Cloud Mesh',
    slug: 'infra-cloud',
    type: 'DOMAIN',
    parent_id: 1,
    description: 'Provisionamiento de clusters, orquestacion k8s, redes y telemetria.',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    lead_id: 2,
    progress: 80,
    metadata: { tier: 'tier-1', region: 'global' },
    created_at: new Date(Date.now() - 50 * 86400000).toISOString()
  },
  {
    id: 3,
    code: 'DOM-SEC',
    name: 'Ciberseguridad & Zero-Trust',
    slug: 'cybersec-zerotrust',
    type: 'DOMAIN',
    parent_id: 1,
    description: 'Protocolos de defensa perimetral, auditoria de secretos y politicas IAM.',
    status: 'ACTIVE',
    priority: 'HIGH',
    lead_id: 1,
    progress: 65,
    metadata: { compliance: 'SOC2-Type2' },
    created_at: new Date(Date.now() - 48 * 86400000).toISOString()
  },
  {
    id: 4,
    code: 'DOM-APP',
    name: 'Core Application Platforms',
    slug: 'core-apps',
    type: 'DOMAIN',
    parent_id: 1,
    description: 'Microservicios principales, pasarela de transacciones y data pipeline.',
    status: 'ACTIVE',
    priority: 'HIGH',
    lead_id: 3,
    progress: 60,
    metadata: { stack: 'node-pg-react' },
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },

  // 2nd Level: Projects under INFRA
  {
    id: 5,
    code: 'PRJ-K8S',
    name: 'Cluster Kubernetes v1.30 Upgrade',
    slug: 'k8s-mesh-upgrade',
    type: 'PROJECT',
    parent_id: 2,
    description: 'Actualizacion del control plane y migracion de nodos a cgroups v2.',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    lead_id: 2,
    progress: 85,
    metadata: { deadline: '2026-12-01', nodes_count: 64 },
    created_at: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    id: 6,
    code: 'PRJ-OBS',
    name: 'Telemetry & OpenTelemetry Stack',
    slug: 'telemetry-stack',
    type: 'PROJECT',
    parent_id: 2,
    description: 'Centralizacion de logs distribuidos, tracing y métricas Prometheus.',
    status: 'ACTIVE',
    priority: 'NORMAL',
    lead_id: 3,
    progress: 70,
    metadata: { retention_days: 90 },
    created_at: new Date(Date.now() - 35 * 86400000).toISOString()
  },

  // 3rd Level: Modules under PRJ-K8S
  {
    id: 7,
    code: 'MOD-INGRESS',
    name: 'Traefik Ingress Controller & mTLS',
    slug: 'traefik-ingress',
    type: 'MODULE',
    parent_id: 5,
    description: 'Enrutamiento L7 y terminacion SSL con certificados rotativos.',
    status: 'ACTIVE',
    priority: 'HIGH',
    lead_id: 2,
    progress: 90,
    metadata: { cert_provider: 'LetEncrypt-Enterprise' },
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 8,
    code: 'MOD-KEDA',
    name: 'KEDA Event-driven Pod Autoscaler',
    slug: 'keda-autoscaler',
    type: 'MODULE',
    parent_id: 5,
    description: 'Escalamiento horizontal reactivo segun colas de mensajes y latencia.',
    status: 'ACTIVE',
    priority: 'NORMAL',
    lead_id: 4,
    progress: 60,
    metadata: { max_replicas: 200 },
    created_at: new Date(Date.now() - 28 * 86400000).toISOString()
  },

  // 2nd Level: Projects under CYBERSEC
  {
    id: 9,
    code: 'PRJ-IAM',
    name: 'Kernel-Level Zero-Trust Boundary',
    slug: 'zero-trust-boundary',
    type: 'PROJECT',
    parent_id: 3,
    description: 'Aislamiento mTLS servicio a servicio y expiracion forzada de tokens.',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    lead_id: 1,
    progress: 75,
    metadata: { level: 'Ring-0-Simulated' },
    created_at: new Date(Date.now() - 35 * 86400000).toISOString()
  },
  {
    id: 10,
    code: 'MLS-PENTEST',
    name: 'Fase 1: Auditoria Externa de Vulnerabilidades',
    slug: 'pentest-phase1',
    type: 'MILESTONE',
    parent_id: 9,
    description: 'Verificacion contra OWASP Top 10 y hardening de puertos expuestos.',
    status: 'PLANNING',
    priority: 'HIGH',
    lead_id: 4,
    progress: 30,
    metadata: { target_date: '2026-11-30' },
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },

  // 2nd Level: Projects under CORE_APP
  {
    id: 11,
    code: 'PRJ-LEDGER',
    name: 'High-Throughput Financial Ledger v3',
    slug: 'financial-ledger-v3',
    type: 'PROJECT',
    parent_id: 4,
    description: 'Motor de doble partida contable con persistencia PostgreSQL ACID.',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    lead_id: 3,
    progress: 82,
    metadata: { tps_capacity: 15000 },
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 12,
    code: 'MOD-RECONCILE',
    name: 'Conciliacion Bancaria Automatizada',
    slug: 'bank-reconciliation',
    type: 'MODULE',
    parent_id: 11,
    description: 'Algoritmo de matching en tiempo real entre pasarelas de pago y cuentas.',
    status: 'ACTIVE',
    priority: 'HIGH',
    lead_id: 3,
    progress: 88,
    metadata: { accuracy_rate: '99.999%' },
    created_at: new Date(Date.now() - 22 * 86400000).toISOString()
  }
];

export const initialTasks = [
  // Tasks under MOD-INGRESS (id: 7)
  {
    id: 1,
    code: 'TSK-101',
    node_id: 7,
    title: 'Configurar rotacion automatica de certificados mTLS con Cert-Manager',
    description: 'Validar que las claves privadas ECDSA se renueven cada 30 dias sin reinicio.',
    status: 'DONE',
    priority: 'HIGH',
    assigned_to: 2,
    estimated_hours: 12,
    logged_hours: 11.5,
    tags: ['tls', 'k8s', 'security'],
    created_at: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 2,
    code: 'TSK-102',
    node_id: 7,
    title: 'Implementar middleware de Rate Limiting con Redis en Traefik',
    description: 'Limitar peticiones a 100 req/sec por IP en endpoints de autenticacion.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    assigned_to: 4,
    estimated_hours: 16,
    logged_hours: 10,
    tags: ['traefik', 'rate-limit', 'redis'],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },

  // Tasks under MOD-KEDA (id: 8)
  {
    id: 3,
    code: 'TSK-103',
    node_id: 8,
    title: 'Crear ScaledObject para colas Kafka de alta volumetria',
    description: 'Calibrar trigger threshold a 500 mensajes pendientes por particion.',
    status: 'TODO',
    priority: 'NORMAL',
    assigned_to: 2,
    estimated_hours: 8,
    logged_hours: 0,
    tags: ['keda', 'kafka', 'autoscaling'],
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 4,
    code: 'TSK-104',
    node_id: 8,
    title: 'Benchmark de tiempo de warmup de pods Node.js bajo carga maxima',
    description: 'Reducir el tiempo de arranque de pods de 14s a menos de 3.5s.',
    status: 'TODO',
    priority: 'HIGH',
    assigned_to: 3,
    estimated_hours: 20,
    logged_hours: 2,
    tags: ['performance', 'nodejs', 'benchmark'],
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },

  // Tasks under PRJ-OBS (id: 6)
  {
    id: 5,
    code: 'TSK-105',
    node_id: 6,
    title: 'Construir Dashboard Grafana CLI-like para SLIs/SLOs de latencia',
    description: 'Visualizar percentiles p50, p95 y p99 con alertas directas a Slack/Webhook.',
    status: 'DONE',
    priority: 'NORMAL',
    assigned_to: 3,
    estimated_hours: 14,
    logged_hours: 14,
    tags: ['grafana', 'slo', 'monitoring'],
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },

  // Tasks under MLS-PENTEST (id: 10)
  {
    id: 6,
    code: 'TSK-201',
    node_id: 10,
    title: 'Auditoria estatica de dependencias NPM y contenedores Docker',
    description: 'Ejecutar Trivy y Snyk en el pipeline de integracion continua CI/CD.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    assigned_to: 4,
    estimated_hours: 10,
    logged_hours: 6,
    tags: ['audit', 'snyk', 'trivy'],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 7,
    code: 'TSK-202',
    node_id: 10,
    title: 'Implementar lista negra y revocacion forzada de tokens JWT',
    description: 'Almacenar hashes de revocacion en cache rapida con TTL automatica.',
    status: 'TODO',
    priority: 'HIGH',
    assigned_to: 1,
    estimated_hours: 12,
    logged_hours: 0,
    tags: ['jwt', 'auth', 'security'],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },

  // Tasks under MOD-RECONCILE (id: 12)
  {
    id: 8,
    code: 'TSK-301',
    node_id: 12,
    title: 'Garantizar idempotencia en la recepcion de webhooks de pago',
    description: 'Implementar lock distribuido con clave idempotency-key en PostgreSQL.',
    status: 'DONE',
    priority: 'CRITICAL',
    assigned_to: 3,
    estimated_hours: 18,
    logged_hours: 18,
    tags: ['postgresql', 'acid', 'payments'],
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 9,
    code: 'TSK-302',
    node_id: 12,
    title: 'Manejo automatizado de reembolsos parciales y comisiones',
    description: 'Generar asientos contables enlazados en transaccion unitaria.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigned_to: 3,
    estimated_hours: 16,
    logged_hours: 9,
    tags: ['ledger', 'accounting', 'sql'],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 10,
    code: 'TSK-303',
    node_id: 12,
    title: 'Prueba de carga con 10,000 transacciones simultaneas',
    description: 'Verificar aislamiento SERIALIZABLE y ausencia de race conditions.',
    status: 'REVIEW',
    priority: 'HIGH',
    assigned_to: 1,
    estimated_hours: 8,
    logged_hours: 7.5,
    tags: ['load-test', 'concurrency'],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const initialAuditLogs = [
  {
    id: 1,
    user_id: 1,
    action: 'SYS_BOOT',
    target_type: 'SYSTEM',
    target_id: 1,
    command_executed: 'init --mode=cluster --env=prod',
    details: 'Nexus CLI Project Management Core inicializado con exito.',
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 2,
    user_id: 2,
    action: 'NODE_STATUS_CHANGE',
    target_type: 'NODE',
    target_id: 5,
    command_executed: 'node --update PRJ-K8S --progress 85',
    details: 'Progreso del proyecto PRJ-K8S actualizado a 85%.',
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 3,
    user_id: 3,
    action: 'TASK_COMPLETE',
    target_type: 'TASK',
    target_id: 8,
    command_executed: 'task --resolve TSK-301 --status DONE',
    details: 'Tarea TSK-301 (Idempotencia en webhooks) marcada como DONE.',
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 4,
    user_id: 1,
    action: 'AUTH_LOGIN',
    target_type: 'USER',
    target_id: 1,
    command_executed: 'auth --login -u admin',
    details: 'Sesion autenticada con privilegios root/admin.',
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
];
