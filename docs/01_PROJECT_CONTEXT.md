# 01. Project Context — ResolveAI

## 1. Project Overview
- **Project Name:** ResolveAI — AI-Powered Issue & Kanban Workflow Tracker (Mini-Jira)
- **Version:** 1.0.0
- **Methodology:** Standardized AI-Assisted Development Framework (ADF v1.0)

## 2. Problem Statement & Business Objective
- **Problem:** Organizations and engineering teams receive high volumes of support issues and bug reports daily. Manual triage—reading tickets, identifying urgency, assigning agents, and drafting initial responses—causes delays and SLA breaches.
- **Business Objective:** Combine a Jira-lite Kanban workflow (`TO_DO`, `IN_PROGRESS`, `RESOLVED`) with an automated AI Triage Engine that classifies incoming issues, detects customer sentiment, escalates critical tickets, auto-assigns agents based on active workload, and prepares editable draft replies.

## 3. Technology Stack
- **Backend Language & Framework:** Java 17, Spring Boot 3.2.x, Spring Cloud (Eureka Discovery, Spring Cloud Gateway, OpenFeign)
- **Security:** Spring Security + Stateless JWT Authentication (BCrypt password hashing)
- **Inter-Service Communication:**
  - Synchronous: Spring Cloud OpenFeign
  - Asynchronous: RabbitMQ (event-driven critical alerts with OpenFeign REST fallback)
- **AI Integration:** Google Gemini REST API (`gemini-2.5-flash`) via Spring `RestClient`
- **Database:** PostgreSQL 16 (database-per-service logical isolation)
- **Frontend:** React 18 (Vite), Tailwind CSS, Axios, Lucide Icons
- **API Documentation:** Springdoc OpenAPI 3 (Swagger UI) & Postman Collection
- **Testing:** JUnit 5, Mockito, Spring Boot Test
- **DevOps & Cloud:** Docker, Docker Compose, GitHub Actions CI/CD, AWS EC2 / Azure Container Apps

## 4. Branching & Deployment Strategy
- **Git Branches:** `main` (production-ready), `develop` (integration), `feature/<module-name>`
- **Commit Convention:** Conventional Commits (`docs:`, `feat:`, `fix:`, `test:`, `chore:`)
- **Deployment:** Multi-stage Docker builds orchestrated via `docker/docker-compose.yml` and automated via `.github/workflows/ci-cd.yml`.
