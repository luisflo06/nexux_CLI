-- ====================================================================
-- NEXUS-CLI PROJECT MANAGEMENT SYSTEM: POSTGRESQL SCHEMA
-- Designed for hierarchical / branched tree project structures
-- ====================================================================

-- 1. USERS & OPERATORS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'engineer' CHECK (role IN ('root', 'admin', 'lead', 'engineer')),
    full_name VARCHAR(100) NOT NULL,
    avatar_color VARCHAR(20) DEFAULT '#10b981',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. HIERARCHICAL NODES (RAMIFIED PROJECT TREE)
-- Levels:
--   - ROOT (Apex of system)
--   - DOMAIN (Division / Department / Workstream)
--   - PROJECT (Core project)
--   - MODULE (Feature track / Sub-system)
--   - MILESTONE (Target sprint / release gate)
CREATE TABLE IF NOT EXISTS nodes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(40) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('ROOT', 'DOMAIN', 'PROJECT', 'MODULE', 'MILESTONE')),
    parent_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    lead_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_nodes_code ON nodes(code);
CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);

-- 3. TASKS / UNITS OF WORK
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED')),
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    estimated_hours NUMERIC(6,2) DEFAULT 0.00,
    logged_hours NUMERIC(6,2) DEFAULT 0.00,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_node_id ON tasks(node_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- 4. CLI AUDIT LOGS / SYSTEM STREAM
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(60) NOT NULL,
    target_type VARCHAR(40),
    target_id INTEGER,
    command_executed TEXT,
    details TEXT,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
