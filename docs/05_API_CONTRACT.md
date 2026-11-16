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

---
