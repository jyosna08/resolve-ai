# 04. Database Design (PostgreSQL) — ResolveAI

## 1. Entity-Relationship Overview

- `auth_db.users` (1) ---> (Many) `ticket_db.tickets` (via `reporter_id` and `assigned_agent_id`)
- `ticket_db.tickets` (1) ---> (Many) `ticket_db.ticket_comments`
- `ticket_db.tickets` (1) ---> (Many) `notification_db.sla_alerts`

## 2. PostgreSQL Schemas

### Database 1: `auth_db` (`auth-team-service`)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'AGENT', 'ADMIN')),
    department VARCHAR(50) DEFAULT 'GENERAL',
    active_ticket_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_role_dept ON users(role, department, active_ticket_count);
```

### Database 2: `ticket_db` (`ticket-workflow-service`)

```sql
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'TO_DO' CHECK (status IN ('TO_DO', 'IN_PROGRESS', 'RESOLVED')),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    sentiment VARCHAR(30) DEFAULT 'NEUTRAL',
    ai_summary TEXT,
    ai_draft_reply TEXT,
    reporter_id BIGINT NOT NULL,
    assigned_agent_id BIGINT,
    assigned_agent_name VARCHAR(100),
    sla_deadline TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);

CREATE TABLE ticket_comments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_ai_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database 3: `notification_db` (`notification-sla-service`)

```sql
CREATE TABLE sla_alerts (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    ticket_title VARCHAR(200) NOT NULL,
    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('CRITICAL_ESCALATION', 'SLA_BREACH')),
    message TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
