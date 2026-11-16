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
