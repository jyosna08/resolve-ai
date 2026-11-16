# 02. Requirements Engineering — ResolveAI

## 1. User Roles

1. **CUSTOMER / REPORTER:** Submits issues, views personal ticket status, and adds follow-up comments.
2. **AGENT / DEVELOPER:** Views Kanban board, inspects AI Co-Pilot triage insights, edits/sends draft replies, and updates ticket workflow statuses.
3. **ADMIN / TEAM LEAD:** Monitors KPI metrics, SLA breach warnings, and agent workload distribution.

## 2. Functional Requirements

- **FR-01 (Authentication & RBAC):** Users register and log in using email/password to receive a signed JWT containing user ID, role, and department.
- **FR-02 (Issue Submission):** Customers submit tickets with `title` and `description`.
- **FR-03 (Automated AI Triage):** Upon ticket creation, `ticket-workflow-service` calls `ai-triage-service` via OpenFeign to obtain `category` (`TECHNICAL`, `BILLING`, `FRONTEND`, `DEVOPS`, `GENERAL`), `priority` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), `sentiment` (`FRUSTRATED`, `NEUTRAL`, `POSITIVE`), `aiSummary`, and `draftReply`.
- **FR-04 (Workload-Based Auto-Assignment):** `ticket-workflow-service` queries `auth-team-service` via OpenFeign to assign the ticket to the available agent in the matching department with the lowest active ticket count.
- **FR-05 (Kanban Workflow Management):** Agents move tickets across `TO_DO`, `IN_PROGRESS`, and `RESOLVED` states. Moving to `RESOLVED` decrements the assigned agent's active workload count.
- **FR-06 (Human-in-the-Loop AI Reply):** Agents open the AI Co-Pilot drawer, review/edit the AI-generated draft reply, and click "Verify & Send Reply" to post the response and mark the ticket resolved.
- **FR-07 (Critical Alerts & SLA Monitoring):** Tickets classified as `CRITICAL` publish an event to RabbitMQ (with REST fallback) consumed by `notification-sla-service` to generate instant alerts and track 24-hour SLA deadlines.

## 3. Non-Functional Requirements

- **NFR-01 (Resilience):** If Gemini API or RabbitMQ is unreachable, fallback logic assigns default `MEDIUM` priority and synchronous REST notification so ticket creation never fails.
- **NFR-02 (Security):** All `/api/**` endpoints (except `/api/auth/**` and Swagger docs) require valid Bearer JWT tokens.
- **NFR-03 (Performance):** Ticket submission including AI triage completes within 3 seconds under normal load.

## 4. User Stories & Acceptance Criteria

- **US-01:** As a Customer, I want to describe my problem in plain text so that it gets categorized and routed automatically.
  - _Acceptance Criteria:_ Submitting valid title & description returns HTTP 201 with AI-assigned priority and category.
- **US-02:** As an Agent, I want to view tickets on a 3-column Kanban board and use AI draft replies so I can resolve critical issues faster.
  - _Acceptance Criteria:_ Board groups tickets by status; clicking a card opens the AI Co-Pilot drawer; clicking "Verify & Send Reply" saves the comment and updates status to `RESOLVED`.

## 5. Out of Scope

- Real-time WebSocket chat, file/video attachments, and multi-organization billing subscriptions.
