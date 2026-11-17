# 05. API Contract — ResolveAI

All endpoints are routed through `api-gateway` (`http://localhost:8080`). Protected endpoints require header: `Authorization: Bearer <JWT>`.

## 1. Auth & Team Service (`/api/auth`, `/api/users`)

### POST `/api/auth/register`

- **Auth:** Public
- **Request Body:**

```json
{
  "fullName": "Priya Sharma",
  "email": "priya@resolveai.com",
  "password": "Password@123",
  "role": "AGENT",
  "department": "TECHNICAL"
}
```

- **Validation:** `fullName` (NotBlank, max 100), `email` (NotBlank, valid email, max 150, stored lowercase, unique), `password` (NotBlank, 8–100 chars), `role` (NotNull: `CUSTOMER` | `AGENT` | `ADMIN`), `department` (optional: `TECHNICAL` | `BILLING` | `FRONTEND` | `DEVOPS` | `GENERAL`, defaults to `GENERAL`).
- **Success Response (`201 Created`):**

```json
{
  "id": 1,
  "fullName": "Priya Sharma",
  "email": "priya@resolveai.com",
  "role": "AGENT",
  "department": "TECHNICAL"
}
```

- **Error Responses:** `400 Bad Request` (validation failure), `409 Conflict` (email already exists).
- **Note (MVP):** `role` is accepted from the client as-is. Restrict self-registration of `ADMIN`/`AGENT` before production deployment.

### POST `/api/auth/login`

- **Auth:** Public
- **Request Body:** `{"email": "priya@resolveai.com", "password": "Password@123"}`
- **Validation:** `email` (NotBlank, valid email), `password` (NotBlank).
- **Success Response (`200 OK`):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "fullName": "Priya Sharma",
  "role": "AGENT"
}
```

- **Error Response:** `401 Unauthorized` (invalid credentials; the same generic message "Invalid email or password" is returned for unknown email and wrong password).

### GET `/api/users/agents/least-loaded?department=TECHNICAL`

- **Auth:** Internal / Authenticated
- **Description:** Returns the `AGENT` in the given department with the lowest `activeTicketCount` (tie-break: lowest id).
- **Success Response (`200 OK`):** `{"id": 1, "fullName": "Priya Sharma", "activeTicketCount": 2}`
- **Error Responses:** `400 Bad Request` (invalid department value), `401 Unauthorized`, `404 Not Found` (no agent in that department).

### PATCH `/api/users/{id}/workload/increment`

- **Auth:** Internal / Authenticated
- **Description:** Atomically increases an agent's `activeTicketCount` by 1 (called by `ticket-workflow-service` after auto-assignment).
- **Success Response (`200 OK`):** `{"id": 1, "fullName": "Priya Sharma", "activeTicketCount": 3}`
- **Error Responses:** `401 Unauthorized`, `404 Not Found` (user does not exist).

### PATCH `/api/users/{id}/workload/decrement`

- **Auth:** Internal / Authenticated
- **Description:** Atomically decreases `activeTicketCount` by 1, never below 0 (called when a ticket moves to `RESOLVED`).
- **Success Response (`200 OK`):** `{"id": 1, "fullName": "Priya Sharma", "activeTicketCount": 2}`
- **Error Responses:** `401 Unauthorized`, `404 Not Found`.

### Standard Error Payload (all services)

```json
{
  "timestamp": "2026-11-16T10:15:30",
  "status": 404,
  "error": "Not Found",
  "message": "No agent available in department TECHNICAL",
  "path": "/api/users/agents/least-loaded"
}
```

### Timestamps (all services)

All date-time fields (`createdAt`, `slaDeadline`, `timestamp`, alert and comment times) are **UTC** and are serialized **without a zone suffix** (for example `2026-11-17T12:54:00`). Clients must interpret them as UTC and convert to the viewer's local time for display.

---

## 2. Ticket Workflow Service (`/api/tickets`)

### POST `/api/tickets`

- **Auth:** Authenticated (`CUSTOMER`, `AGENT`, `ADMIN`)
- **Request Body:**

```json
{
  "title": "Payment Gateway Failure",
  "description": "Users reporting 500 errors on the payment page for the last 20 minutes."
}
```

- **Validation:** `title` (5–200 chars, NotBlank), `description` (10–2000 chars, NotBlank).
- **Success Response (`201 Created`):**

```json
{
  "id": 101,
  "title": "Payment Gateway Failure",
  "description": "Users reporting 500 errors on the payment page for the last 20 minutes.",
  "status": "TO_DO",
  "priority": "CRITICAL",
  "category": "BILLING",
  "sentiment": "FRUSTRATED",
  "aiSummary": "Payment gateway returning HTTP 500 errors blocking checkouts.",
  "aiDraftReply": "Thank you for reporting this urgent payment issue. Our engineering team is investigating the 500 gateway error and will update you shortly.",
  "assignedAgentName": "Priya Sharma",
  "slaDeadline": "2026-11-17T09:30:00"
}
```

### GET `/api/tickets?status=TO_DO&priority=CRITICAL&search=payment`

- **Auth:** Authenticated
- **Success Response (`200 OK`):** Array of Ticket DTOs.

### GET `/api/tickets/dashboard-stats`

- **Auth:** Authenticated
- **Success Response (`200 OK`):**

```json
{
  "totalOpen": 24,
  "criticalAlerts": 3,
  "resolvedToday": 18,
  "slaWarnings": 1
}
```

### PATCH `/api/tickets/{id}/status`

- **Auth:** Authenticated (`AGENT`, `ADMIN`)
- **Request Body:** `{"status": "IN_PROGRESS"}`
- **Success Response (`200 OK`):** Updated Ticket DTO.

### POST `/api/tickets/{id}/verify-reply`

- **Auth:** Authenticated (`AGENT`, `ADMIN`)
- **Request Body:** `{"replyMessage": "We have resolved the payment gateway timeout issue. Please retry your checkout."}`
- **Success Response (`200 OK`):** Ticket moved to `RESOLVED` and comment saved.

### GET `/api/tickets/{id}`

- **Auth:** Authenticated. `CUSTOMER` can only open tickets they reported; any other ticket returns `404`. `AGENT`/`ADMIN` can open any ticket.
- **Success Response (`200 OK`):** Ticket DTO. **Error Responses:** `401`, `404`.

### GET `/api/tickets/{id}/comments`

- **Auth:** Authenticated (same visibility rule as above).
- **Success Response (`200 OK`):** Array of `{ "id", "authorName", "message", "aiVerified", "createdAt" }`, oldest first.

### Ticket DTO (full shape)

`id, title, description, status, priority, category, sentiment, aiSummary, aiDraftReply, reporterId, assignedAgentId, assignedAgentName, slaDeadline, createdAt`.

### Business Rules (Ticket Service)

- **Create:** reporter = the JWT user. SLA deadline = now + 24 hours (configurable). If AI triage is unavailable, the ticket is still created with `GENERAL` / `MEDIUM` / `NEUTRAL` and a generic draft reply. The agent is auto-assigned via the least-loaded agent of the ticket's category (department). If no agent is available the ticket stays unassigned (`assignedAgentId = null`).
- **Visibility:** `CUSTOMER` sees only their own tickets in the list and in dashboard stats. `AGENT` and `ADMIN` see all.
- **Customer response privacy:** for a `CUSTOMER` caller, every Ticket DTO (create, list, get, status/verify responses) returns `aiSummary`, `aiDraftReply`, `sentiment`, `slaDeadline`, `assignedAgentId` and `assignedAgentName` as `null`. `AGENT` and `ADMIN` receive the full DTO. Internally the AI data is still stored and used by agents.
- **Status transitions:** `TO_DO -> IN_PROGRESS`, `IN_PROGRESS -> TO_DO`, `TO_DO|IN_PROGRESS -> RESOLVED`. `RESOLVED` is final; any change from `RESOLVED` or to the same status returns `409 Conflict`. Moving to `RESOLVED` decrements the assigned agent's `activeTicketCount`.
- **verify-reply:** `replyMessage` (NotBlank, 5–2000 chars). Saves a comment (`aiVerified = true`), moves the ticket to `RESOLVED`, decrements the agent workload, and returns the Ticket DTO. `409` if already resolved.
- **Search:** case-insensitive match on title or description. Filters `status`, `priority`, `search` are optional and combinable. An invalid status/priority value returns `400`.
- **Dashboard stats:** `totalOpen` = status not `RESOLVED`; `criticalAlerts` = open tickets with `CRITICAL` priority; `resolvedToday` = `RESOLVED` tickets updated today; `slaWarnings` = open tickets whose SLA deadline is within the next 2 hours or already passed.
- **Roles:** `PATCH /status` and `POST /verify-reply` require `AGENT` or `ADMIN` (`403` for `CUSTOMER`).
- **Critical tickets:** after the ticket is saved, a `CRITICAL` ticket triggers a `CriticalTicketEvent` (`ticketId`, `title`, `priority`, `assignedAgentName`, `slaDeadline`). If `RABBITMQ_ENABLED=true` the event is published to exchange `resolveai.exchange` with routing key `ticket.critical`; if that publish fails, the service falls back to `POST /api/notifications/events/critical` through OpenFeign. If `RABBITMQ_ENABLED=false` the REST call is used directly. A delivery failure is logged and **never** fails ticket creation. The notification service ignores duplicates per `ticketId`, so a retry through both paths is safe.

---

## 3. AI Triage Service (`/api/ai`)

### POST `/api/ai/analyze`

- **Auth:** Internal / Authenticated
- **Request Body:** `{"title": "Payment Gateway Failure", "description": "Users reporting 500 errors..."}`
- **Success Response (`200 OK`):**

```json
{
  "category": "BILLING",
  "priority": "CRITICAL",
  "sentiment": "FRUSTRATED",
  "summary": "Users experiencing HTTP 500 errors during payment checkout.",
  "draftReply": "We apologize for the disruption on the payment page..."
}
```

- **Validation:** `title` (NotBlank, 5–200 chars), `description` (NotBlank, 10–2000 chars). Error responses: `400 Bad Request` (validation), `401 Unauthorized` (missing/invalid JWT).
- **Fallback behaviour:** If Gemini times out, errors, or returns unparsable output, the service still returns `200 OK` with `category=GENERAL`, `priority=MEDIUM`, `sentiment=NEUTRAL`, a summary derived from the title, and a generic polite draft reply. Allowed enum values: category `TECHNICAL|BILLING|FRONTEND|DEVOPS|GENERAL`, priority `CRITICAL|HIGH|MEDIUM|LOW`, sentiment `FRUSTRATED|NEUTRAL|POSITIVE`.

---

## 4. Notification & SLA Service (`/api/notifications`)

### GET `/api/notifications/alerts`

- **Auth:** Authenticated (`AGENT`, `ADMIN`; `CUSTOMER` gets `403`)
- **Description:** Returns active (not acknowledged) alerts, newest first.
- **Success Response (`200 OK`):**

```json
[
  {
    "id": 1,
    "ticketId": 101,
    "ticketTitle": "Payment Gateway Failure",
    "alertType": "CRITICAL_ESCALATION",
    "message": "CRITICAL ticket #101 'Payment Gateway Failure' assigned to Priya Sharma. SLA deadline: 2026-11-17T09:30:00.",
    "acknowledged": false,
    "slaDeadline": "2026-11-17T09:30:00",
    "createdAt": "2026-11-16T09:30:00"
  }
]
```

### PATCH `/api/notifications/alerts/{id}/acknowledge`

- **Auth:** Authenticated (`AGENT`, `ADMIN`)
- **Success Response (`200 OK`):** Updated alert DTO. **Error Responses:** `401`, `403`, `404`.

### POST `/api/notifications/events/critical` (REST fallback)

- **Auth:** Authenticated (any valid JWT; the ticket service forwards the caller's token). Used by `ticket-workflow-service` when `RABBITMQ_ENABLED=false` or RabbitMQ publishing fails.
- **Request Body:**

```json
{
  "ticketId": 101,
  "title": "Payment Gateway Failure",
  "priority": "CRITICAL",
  "assignedAgentName": "Priya Sharma",
  "slaDeadline": "2026-11-17T09:30:00"
}
```

- **Validation:** `ticketId` (NotNull), `title` (NotBlank, max 200), `slaDeadline` (NotNull). `priority` and `assignedAgentName` are optional.
- **Success Response:** `201 Created` with the alert DTO; `200 OK` with the existing alert if a `CRITICAL_ESCALATION` alert for the same `ticketId` already exists (idempotent). **Error Responses:** `400`, `401`.
- **Note (MVP):** any authenticated user can call this endpoint. Replace with an internal service key before production.

### RabbitMQ Contract

- Exchange `resolveai.exchange` (direct, durable), routing key `ticket.critical`, queue `ticket.critical.queue` (durable).
- Message: the same JSON as the REST fallback request body. The consumer is enabled only when `RABBITMQ_ENABLED=true`. Duplicate messages are ignored (idempotent per `ticketId`).

### SLA Breach Detection

- A scheduler runs every 60 seconds. For every `CRITICAL_ESCALATION` alert that is **not acknowledged** and whose `slaDeadline` has passed, it creates one `SLA_BREACH` alert (at most one per ticket).
- Acknowledging an alert means an agent has handled it and stops breach alerts for that ticket.
