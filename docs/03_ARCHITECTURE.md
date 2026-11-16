# 03. System Architecture — ResolveAI

## 1. High-Level Microservices Diagram

```text
+-------------------+

|  React Frontend   | (Port 3000)
+---------+---------+
          | HTTP / JWT
          v
+-------------------+       +--------------------+

|    API Gateway    | <---> |  Discovery Server  |
|    (Port 8080)    |       |  (Eureka - 8761)   |
+---------+---------+       +--------------------+
          |
    +-----+-------------------+-------------------+

    |                         |                   |
    v                         v                   v
+-------------------+   +-------------------+   +-----------------------+

| auth-team-service |   | ticket-workflow-  |   | notification-sla-     |
|   (Port 8081)     |   | service (8082)    |   | service (8084)        |
+---------+---------+   +----+----+----+----+   +-----------+-----------+

          |                  |    |    |                    ^
          v       OpenFeign  |    |    | RabbitMQ / Feign   |
   +-------------+ <---------+    |    +--------------------+

   | PostgreSQL  |                | OpenFeign
   +-------------+                v
                        +-------------------+       +-------------------+

                        | ai-triage-service | ----> | Google Gemini API |
                        |   (Port 8083)     |       |   (External LLM)  |
                        +-------------------+       +-------------------+
```

## 2. Service Responsibilities

1. **`discovery-server` (8761):** Netflix Eureka service registry for dynamic service discovery.
2. **`api-gateway` (8080):** Single entry point handling routing, CORS policy, and JWT header forwarding.
3. **`auth-team-service` (8081):** User registration, JWT token issuance, role management, and tracking `activeTicketCount` per agent.
4. **`ticket-workflow-service` (8082):** Core domain service managing tickets, Kanban board states, comments, OpenFeign calls to AI & Auth services, and publishing critical ticket events.
5. **`ai-triage-service` (8083):** Stateless AI adapter calling Google Gemini API with structured prompt engineering and JSON parsing.
6. **`notification-sla-service` (8084):** Consumes `ticket.critical.queue` from RabbitMQ (plus REST endpoint fallback) to store critical alerts and flag overdue tickets.

## 3. Authentication & Triage Flow

1. Client authenticates via `POST /api/auth/login` -> receives JWT.
2. Client submits issue via `POST /api/tickets` with `Authorization: Bearer <token>`.
3. `ticket-workflow-service` calls `ai-triage-service` (`POST /api/ai/analyze`) via OpenFeign.
4. `ticket-workflow-service` calls `auth-team-service` (`GET /api/users/agents/least-loaded`) via OpenFeign.
5. Ticket is saved in PostgreSQL; if `priority == CRITICAL`, an event is published to `resolveai.exchange` (RabbitMQ).
