# 07. Task Breakdown & 4-Day Execution Plan — ResolveAI

## Day 1: Design & Documentation (Phases 1–8)

- **TASK-101 | Priority: HIGH | Est: 1 hr | Deps: None**
  - **Description:** Initialize repository folder structure (`docs/`, `backend/`, `frontend/`, `docker/`, `postman/`, `.github/workflows/`).
  - **Deliverables:** Clean Git repo with `main` and `develop` branches.
  - **Definition of Done:** Folder tree matches ADF v1.0 standard and pushed to GitHub.
- **TASK-102 | Priority: HIGH | Est: 3 hrs | Deps: TASK-101**
  - **Description:** Author all 11 specification documents (`01_PROJECT_CONTEXT.md` through `11_PROMPTS.md`) and root `README.md`.
  - **Deliverables:** Complete `docs/` directory.
  - **Definition of Done:** All schemas, API contracts, and UI flows reviewed and committed before coding begins.

## Day 2: Core Backend Microservices — Part 1 (Phase 9)

- **TASK-201 | Priority: HIGH | Est: 1.5 hrs | Deps: TASK-102**
  - **Description:** Build `discovery-server` (Eureka, port `8761`) and `api-gateway` (Spring Cloud Gateway, port `8080` with CORS).
  - **Deliverables:** Running service registry and gateway routes.
  - **Definition of Done:** Gateway routes `/api/**` requests and Eureka dashboard displays registered instances.
- **TASK-202 | Priority: HIGH | Est: 2.5 hrs | Deps: TASK-201**
  - **Description:** Build `auth-team-service` (`8081`) with PostgreSQL, JWT authentication, RBAC (`CUSTOMER`, `AGENT`, `ADMIN`), and agent workload counter endpoints.
  - **Deliverables:** Layered service (Entity, DTO, Repo, Service, Controller, GlobalExceptionHandler, Swagger, JUnit tests).
  - **Definition of Done:** Register/login returns valid JWT; `mvn test` passes with 0 errors.
- **TASK-203 | Priority: HIGH | Est: 3 hrs | Deps: TASK-202**
  - **Description:** Build `ticket-workflow-service` (`8082`) with PostgreSQL, Kanban CRUD (`TO_DO`, `IN_PROGRESS`, `RESOLVED`), OpenFeign clients for AI & Auth services, and RabbitMQ publisher (with REST fallback).
  - **Deliverables:** Full ticket lifecycle & workload-based auto-assignment + JUnit tests.
  - **Definition of Done:** Creating a ticket invokes AI triage, assigns least-loaded agent, and passes `mvn test`.

## Day 3: AI Service, SLA Service & React Frontend (Phases 9 & 10)

- **TASK-301 | Priority: HIGH | Est: 2 hrs | Deps: TASK-201**
  - **Description:** Build `ai-triage-service` (`8083`) integrating Google Gemini API (`GEMINI_API_KEY`) via Spring `RestClient` with JSON parsing and fallback handling.
  - **Deliverables:** `POST /api/ai/analyze` endpoint, Swagger docs, and unit tests.
  - **Definition of Done:** Returns structured category, priority, sentiment, summary, and draft reply.
- **TASK-302 | Priority: MEDIUM | Est: 1.5 hrs | Deps: TASK-203**
  - **Description:** Build `notification-sla-service` (`8084`) consuming RabbitMQ `ticket.critical.queue` (plus REST fallback) and exposing active SLA/critical alerts.
  - **Deliverables:** Alert persistence, Swagger docs, and unit tests.
  - **Definition of Done:** Critical tickets automatically generate alert records.
- **TASK-303 | Priority: HIGH | Est: 3.5 hrs | Deps: TASK-301, TASK-302**
  - **Description:** Build React + Tailwind frontend (`frontend/`) with Login/Register, KPI Summary Bar, 3-Column Kanban Board, Customer Issue Form, and AI Co-Pilot Drawer.
  - **Deliverables:** Responsive UI with Loading, Error, Empty states, and form validation.
  - **Definition of Done:** End-to-end flow works from issue creation to "Verify & Send Reply".

## Day 4: Testing, Containerization & CI/CD (Phases 11–13)

- **TASK-401 | Priority: HIGH | Est: 1.5 hrs | Deps: TASK-303**
  - **Description:** Execute unit, integration, API (Postman), and UI tests; finalize `postman/ResolveAI.postman_collection.json` and `docs/09_TESTING.md`.
  - **Definition of Done:** All tests pass and test report is documented.
- **TASK-402 | Priority: HIGH | Est: 2 hrs | Deps: TASK-401**
  - **Description:** Create multi-stage `Dockerfile` for all 6 backend services and `frontend/`, plus `docker/docker-compose.yml` (including PostgreSQL & RabbitMQ) and `.env.example`.
  - **Definition of Done:** Full stack boots cleanly via `docker compose up --build`.
- **TASK-403 | Priority: HIGH | Est: 1.5 hrs | Deps: TASK-402**
  - **Description:** Configure `.github/workflows/ci-cd.yml` for automated Maven tests, React build, and Docker Hub image push.
  - **Definition of Done:** GitHub Actions pipeline passes green on push to `develop` / `main`.
