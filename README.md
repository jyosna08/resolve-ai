# ResolveAI — AI-Powered Issue & Kanban Workflow Tracker (Mini-Jira)

ResolveAI is a microservices-based issue tracking and Kanban workflow platform enhanced with an automated **AI Triage Engine**. It classifies incoming customer issues, detects customer sentiment, escalates critical bugs, auto-assigns agents based on active workload, and prepares editable draft replies for human-in-the-loop verification.

## Architecture & Tech Stack

- **Backend:** Java 17, Spring Boot 3, Spring Cloud (Eureka, API Gateway, OpenFeign), Spring Security (JWT)
- **Messaging & AI:** RabbitMQ (with OpenFeign fallback) + Google Gemini REST API
- **Database:** PostgreSQL 16
- **Frontend:** React 18, Vite, Tailwind CSS
- **DevOps:** Docker, Docker Compose, GitHub Actions CI/CD

## Project Structure

- `docs/` — Complete system design, database schemas, API contracts, UI flows, and test reports (`01` to `11`)
- `backend/` — `discovery-server`, `api-gateway`, `auth-team-service`, `ticket-workflow-service`, `ai-triage-service`, `notification-sla-service`
- `frontend/` — React Kanban Board & AI Co-Pilot Drawer UI
- `docker/` — Multi-container `docker-compose.yml`
- `postman/` — Complete API test collection

## Quick Start (Local Docker)

1. Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
2. Run:
   ```bash
   docker compose -f docker/docker-compose.yml up -d --build
   ```
3. Access Frontend at `http://localhost:3000`, API Gateway at `http://localhost:8080`, and Eureka Dashboard at `http://localhost:8761`.
