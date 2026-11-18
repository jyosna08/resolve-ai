# 10. Containerization, CI/CD & Cloud Deployment — ResolveAI

## 1. Containerization Architecture (Phase 12)

- Each Spring Boot microservice uses a multi-stage `Dockerfile`:
  - **Stage 1 (`maven:3.9-eclipse-temurin-17`):** Builds the executable JAR (`mvn clean package -DskipTests`).
  - **Stage 2 (`eclipse-temurin:17-jre-alpine`):** Lightweight runtime image with JVM memory limits (`-Xmx384m`) for cloud efficiency.
- `frontend/Dockerfile` builds the Vite React bundle and serves static assets via `nginx:alpine`.
- `docker/docker-compose.yml` orchestrates PostgreSQL 16, RabbitMQ 3 (management), Discovery Server, API Gateway, all 4 microservices, and React Frontend on a shared bridge network.

## 2. Required Environment Variables (`.env`)

```env
POSTGRES_USER=resolveai
POSTGRES_PASSWORD=resolveai_secret
JWT_SECRET=ResolveAISuperSecretSigningKeyForJWT2026MustBeLong
GEMINI_API_KEY=your_google_gemini_api_key
RABBITMQ_ENABLED=true
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
VITE_API_BASE_URL=http://localhost:8080
```

## 3. CI/CD Pipeline (Phase 13 — `.github/workflows/ci-cd.yml`)

- **Triggers:** Push or Pull Request to `main` and `develop`.
- **Pipeline Stages:**
  1. Checkout code & set up JDK 17 + Node.js 20.
  2. Run `mvn test` across all backend services.
  3. Run `npm ci && npm run build` for `frontend/`.
  4. Build multi-service Docker images and push to Docker Hub using `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets (on `main` branch).

## 4. Cloud Deployment Target (Phase 14)

- **Target:** AWS EC2 (Ubuntu 24.04 `t3.medium` with Elastic IP) or Azure Container Apps.
- **Execution:** Pull tagged images from Docker Hub, configure production `.env`, run `docker compose -f docker/docker-compose.yml up -d`, and verify `/actuator/health` endpoints.

## 5. Docker Compose Runtime Details

- **Location:** `docker/docker-compose.yml`, with variables read from `docker/.env` (copy `docker/.env.example`; the real `.env` is git-ignored).
- **Startup order** (via health checks): `postgres` and `rabbitmq` → `discovery-server` → `auth-team-service`, `ai-triage-service`, `ticket-workflow-service`, `notification-sla-service` → `api-gateway` → `frontend`.
- **Published ports:** `frontend` `3000` and `api-gateway` `8080` (public); `discovery-server` `8761`, `rabbitmq` management `15672` and the four service ports `8081`–`8084` (Swagger UI) are bound to `127.0.0.1` only. PostgreSQL is not published.
- **Databases:** `docker/postgres/01-create-databases.sql` creates `auth_db`, `ticket_db` and `notification_db` on the first start of an empty volume. To re-run it: `docker compose down -v`.
- **Service environment:** `DB_URL` (`jdbc:postgresql://postgres:5432/<db>`), `DB_USERNAME`/`DB_PASSWORD` (from `POSTGRES_USER`/`POSTGRES_PASSWORD`), `EUREKA_URL=http://discovery-server:8761/eureka/`, `EUREKA_INSTANCE_PREFER_IP_ADDRESS=true`, `JWT_SECRET` (identical for auth, ai-triage, ticket and notification; at least 32 bytes), `GEMINI_API_KEY` (ai-triage), `RABBITMQ_ENABLED`, `RABBITMQ_HOST=rabbitmq`, `RABBITMQ_USERNAME`/`RABBITMQ_PASSWORD` (from `RABBITMQ_USER`/`RABBITMQ_PASS`), `CORS_ALLOWED_ORIGINS` (gateway; must equal the URL the browser uses for the frontend).
- **Frontend:** `VITE_API_BASE_URL` is a **build-time** argument. Changing it requires `docker compose build frontend`. It must be the URL the browser uses to reach the gateway (for EC2: `http://<elastic-ip>:8080`, or the HTTPS URL when a reverse proxy is used).
- **JVM:** `JAVA_OPTS` defaults to `-Xmx384m -XX:+ExitOnOutOfMemoryError` and can be overridden in `docker/.env` (use `-Xmx256m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError` on 8 GB laptops). Plan for about 4 GB of RAM for the whole stack; on AWS use an 8 GB instance such as `t3.large`.
- **Low-memory laptops:** set `memory=4GB` in `%USERPROFILE%\.wslconfig`, set `COMPOSE_PARALLEL_LIMIT=2` before building, and start the stack in stages (infrastructure first, then services, then the frontend).
- **Production notes:** the MVP uses `ddl-auto=update`; open only the required ports in the cloud firewall; replace the sample `JWT_SECRET` and database password.

## 6. CI/CD Workflow Details (`.github/workflows/ci-cd.yml`)

- **Triggers:** push and pull request to `main` and `develop`, plus manual `workflow_dispatch`. A newer run on the same branch cancels the older one.
- **Jobs:**
  1. `backend-tests`: matrix of the 6 services on JDK 17 (Temurin) with the Maven cache, running `mvn -B test` in `backend/<service>`.
  2. `frontend`: Node 20, `npm ci`, `npm test`, `npm run build` in `frontend/`.
  3. `docker-build`: after both test jobs pass, builds the 7 images (6 services + frontend) with Buildx and the GitHub Actions cache. Images are pushed to Docker Hub as `<DOCKER_USERNAME>/resolveai-<name>` with tags `latest` and the commit SHA **only on a push to `main`**. Pull requests and `develop` build without pushing.
  4. `compose-smoke` (push to `main` or manual run only): creates a temporary `docker/.env` with generated secrets, starts the full stack with Docker Compose, waits for the gateway to be healthy, checks that 5 services are registered in Eureka and that register + login + ticket creation work through the gateway, then tears everything down.
- **Required repository secrets:** `DOCKER_USERNAME`, `DOCKER_PASSWORD` (a Docker Hub access token with Read & Write). Optional repository variable: `VITE_API_BASE_URL` (baked into the frontend image; defaults to `http://localhost:8080`).
- **Deployment** is manual in this release: on the server run `docker compose pull && docker compose up -d` and check `/actuator/health`.
