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

### POST `/api/auth/login`

- **Auth:** Public
- **Request Body:** `{"email": "priya@resolveai.com", "password": "Password@123"}`
- **Success Response (`200 OK`):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "fullName": "Priya Sharma",
  "role": "AGENT"
}
```

- **Error Response:** `401 Unauthorized` (invalid credentials).

### GET `/api/users/agents/least-loaded?department=TECHNICAL`

- **Auth:** Internal / Authenticated
- **Success Response (`200 OK`):** `{"id": 1, "fullName": "Priya Sharma", "activeTicketCount": 2}`

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

---

## 4. Notification & SLA Service (`/api/notifications`)

### GET `/api/notifications/alerts`

- **Auth:** Authenticated (`AGENT`, `ADMIN`)
- **Success Response (`200 OK`):** List of active critical & SLA breach alert DTOs.
