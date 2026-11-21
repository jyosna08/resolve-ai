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
POSTGRES_PASSWORD=replace_with_a_strong_password
JWT_SECRET=replace_with_at_least_32_random_characters
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

- **Target:** AWS EC2 with an Elastic IP, or Azure Container Apps. The verified deployment uses Ubuntu 26.04 on an `m7i-flex.large` EC2 instance.
- **Execution:** Pull tagged images from Docker Hub, configure production `.env`, run `docker compose -f docker/docker-compose.yml up -d`, and verify `/actuator/health` endpoints.

## 5. Docker Compose Runtime Details

- **Location:** `docker/docker-compose.yml`, with variables read from `docker/.env` (copy `docker/.env.example`; the real `.env` is git-ignored).
- **Startup order** (via health checks): `postgres` and `rabbitmq` → `discovery-server` → `auth-team-service`, `ai-triage-service`, `ticket-workflow-service`, `notification-sla-service` → `api-gateway` → `frontend`.
- **Published ports:** `frontend` `3000` and `api-gateway` `8080` (public); `discovery-server` `8761`, `rabbitmq` management `15672` and the four service ports `8081`–`8084` (Swagger UI) are bound to `127.0.0.1` only. PostgreSQL is not published.
- **Databases:** `docker/postgres/01-create-databases.sql` creates `auth_db`, `ticket_db` and `notification_db` on the first start of an empty volume. To re-run it: `docker compose down -v`.
- **Service environment:** `DB_URL` (`jdbc:postgresql://postgres:5432/<db>`), `DB_USERNAME`/`DB_PASSWORD` (from `POSTGRES_USER`/`POSTGRES_PASSWORD`), `EUREKA_URL=http://discovery-server:8761/eureka/`, `EUREKA_INSTANCE_PREFER_IP_ADDRESS=true`, `JWT_SECRET` (identical for auth, ai-triage, ticket and notification; at least 32 bytes), `GEMINI_API_KEY` (ai-triage), `RABBITMQ_ENABLED`, `RABBITMQ_HOST=rabbitmq`, `RABBITMQ_USERNAME`/`RABBITMQ_PASSWORD` (from `RABBITMQ_USER`/`RABBITMQ_PASS`), `CORS_ALLOWED_ORIGINS` (gateway; must equal the URL the browser uses for the frontend).
- **First admin:** `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` (read by `auth-team-service` only, set in `docker/.env`, never committed). The admin is created on startup only if no `ADMIN` exists. After logging in as that admin, create agents with `POST /api/users` or the Team page.
- **Frontend:** `VITE_API_BASE_URL` is a **build-time** argument. Changing it requires `docker compose build frontend`. It must be the URL the browser uses to reach the gateway (for EC2: `http://<elastic-ip>:8080`, or the HTTPS URL when a reverse proxy is used).
- **JVM:** `JAVA_OPTS` defaults to `-Xmx384m -XX:+ExitOnOutOfMemoryError` and can be overridden in `docker/.env` (use `-Xmx256m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError` on 8 GB laptops). Plan for about 4 GB of RAM for the whole stack; on AWS use an 8 GB instance such as `m7i-flex.large` (eligible for the AWS Free plan).
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

## 7. Production Deployment: AWS EC2 + Vercel

### Architecture

```text
Browser -> Vercel frontend -> HTTPS API domain -> Caddy -> api-gateway -> backend services
                                                        PostgreSQL and RabbitMQ stay internal
```

The frontend is a static Vite build on Vercel. The EC2 server runs PostgreSQL, RabbitMQ, Eureka, the four business services, API Gateway, and Caddy. Only Caddy publishes ports 80 and 443. Caddy obtains and renews the HTTPS certificate for the API domain. PostgreSQL and RabbitMQ have no public host ports.

### Prerequisites

- AWS account and an AWS Budget alert for credit and resource usage.
- A DuckDNS subdomain and an Elastic IP for the EC2 host.
- Vercel account and the final frontend production URL.
- Docker Hub images published by the CI job on a push to `main`. CI pushes `latest` and the commit SHA tags using `${DOCKER_USERNAME}/resolveai-<service>`; pull requests and `develop` do not publish images.
- Google Gemini API key for live triage (optional; without one the service uses its fallback).

### EC2 setup

Create an EC2 instance with Ubuntu 24.04 or 26.04 LTS (26.04 was used in the verified deployment), `m7i-flex.large` (2 vCPU and 8 GiB RAM), and a 30 GB `gp3` EBS volume. For AWS accounts created on or after July 15, 2025, AWS lists `m7i-flex.large` as Free plan eligible; account age and region can affect eligibility. Confirm that the AMI and instance type show **Free tier eligible** in the launch wizard. If the type is unavailable or not marked eligible in the selected region, choose another region and check again. See the [m7i-flex instance specifications](https://docs.aws.amazon.com/ec2/latest/instancetypes/gp.html) and [AWS EC2 Free Tier eligibility](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html).

Use this security group:

- SSH (22): your IP address only.
- HTTP (80) and HTTPS (443): anywhere (`0.0.0.0/0` and `::/0` if IPv6 is enabled).
- No other inbound ports.

Allocate and associate an Elastic IP, then create/update the DuckDNS A record to point to that IP. DNS must resolve before Caddy can issue the HTTPS certificate.

The Free plan provides $100 in sign-up credits and up to $100 more through eligible activities. As a rough planning estimate for this configuration, $100 may cover about 5 to 6 weeks if the instance runs continuously; exact duration varies by region, current pricing, storage, IPv4, and other usage. Stop the instance when it is not needed for a demo. The EBS volume and public IPv4 address can continue to incur charges while the instance is stopped. The Free plan account ends when credits run out or the six-month free period ends. Check the current account terms and usage in [AWS Free Tier](https://aws.amazon.com/free/) and [EC2 Free Tier usage](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html).

### Server setup and deploy

From the EC2 instance, clone the repository and run the bootstrap once as a sudo-capable Ubuntu user:

```bash
git clone <repository-url> resolve-ai
cd resolve-ai
chmod +x scripts/ec2-bootstrap.sh scripts/deploy.sh
./scripts/ec2-bootstrap.sh
```

Log out and back in for Docker group membership, then configure the production environment and deploy:

```bash
cp docker/.env.prod.example docker/.env
nano docker/.env
./scripts/deploy.sh
```

Replace every `replace_with_` placeholder. Set `DOCKER_USERNAME`, `IMAGE_TAG` (normally `latest`), `API_DOMAIN` (the DuckDNS hostname), and `CORS_ALLOWED_ORIGINS` (the exact Vercel production origin, no trailing slash). Use strong values for `POSTGRES_PASSWORD`, `JWT_SECRET` (at least 32 characters; generate with `openssl rand -base64 48`), `RABBITMQ_PASS`, and `BOOTSTRAP_ADMIN_PASSWORD`. Set `GEMINI_API_KEY` to a provider key or clear its placeholder to use fallback triage. The bootstrap admin is created only when no ADMIN user exists yet.

The deployment script pulls the configured image tag, starts healthy services in stages, checks API Gateway health inside the Compose network, and prints the public health URL. For a rollback to a CI-published commit SHA:

```bash
IMAGE_TAG=<commit-sha> ./scripts/deploy.sh
```

To restart with already-pulled images, use `./scripts/deploy.sh --no-pull`.

### Verification checklist

- Open `https://<API_DOMAIN>/actuator/health` and confirm the response reports `UP`.
- Check that all five expected apps (API Gateway and the four business services) registered with Eureka from within the Compose network. The host has `jq` from the bootstrap packages:

  ```bash
  docker compose --env-file docker/.env -f docker/docker-compose.prod.yml exec -T discovery-server wget -qO- --header='Accept: application/json' http://localhost:8761/eureka/apps | jq -r '[(.applications.application | if type == "array" then .[] else . end | .name)] | unique | length'
  ```

  The expected count is `5`.
- Log in through the frontend with the bootstrap admin account.
- Run Newman only for the `06 Health` and `01 Auth` folders against the production URL. Never run the full collection against production: it creates users, tickets, and alerts. Set the admin credentials as environment variables in the shell before running; do not put their values in command history:

  ```bash
  newman run postman/ResolveAI.postman_collection.json -e postman/ResolveAI.local.postman_environment.json --folder "06 Health" --folder "01 Auth" --env-var "baseUrl=https://${API_DOMAIN}" --env-var "adminEmail=${BOOTSTRAP_ADMIN_EMAIL}" --env-var "adminPassword=${BOOTSTRAP_ADMIN_PASSWORD}"
  ```

### Vercel frontend

Create a Vercel project from the repository with these settings:

- Root directory: `frontend`.
- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Production environment variable: `VITE_API_BASE_URL=https://<API_DOMAIN>`.

Deploy the frontend and note its final production origin, for example `https://<project>.vercel.app`. Update `CORS_ALLOWED_ORIGINS` in `docker/.env` with that exact origin (multiple comma-separated origins are supported; do not add a trailing slash), then rerun `./scripts/deploy.sh` to apply the API Gateway configuration.

### Operations, backups, and teardown

- Update the stack after a CI push to `main` with `./scripts/deploy.sh`. Pin a CI image SHA with `IMAGE_TAG=<commit-sha> ./scripts/deploy.sh` when selecting a specific release; return to `latest` after editing `IMAGE_TAG` in `docker/.env`.
- View service logs with `docker compose --env-file docker/.env -f docker/docker-compose.prod.yml logs -f [service]`.
- Create SQL dumps for the three databases (these commands write backups on the EC2 host):

  ```bash
  mkdir -p backups
  docker compose --env-file docker/.env -f docker/docker-compose.prod.yml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" auth_db' > backups/auth_db.sql
  docker compose --env-file docker/.env -f docker/docker-compose.prod.yml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" ticket_db' > backups/ticket_db.sql
  docker compose --env-file docker/.env -f docker/docker-compose.prod.yml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" notification_db' > backups/notification_db.sql
  ```

- Stop the EC2 instance when not demoing. EBS storage and the public IPv4 address may still cost money while stopped; an associated Elastic IP can incur charges when it is not attached to a running instance.
- To tear down containers while retaining data volumes, run `docker compose --env-file docker/.env -f docker/docker-compose.prod.yml down`. To permanently remove the stack data as well, add `-v` only after saving any required database backups. Release the Elastic IP and delete the EBS volume when decommissioning the deployment.

### Troubleshooting

| Symptom | Checks |
| --- | --- |
| Certificate not issued | Confirm the DuckDNS record resolves to the Elastic IP and inbound ports 80 and 443 are open. |
| CORS error in the browser | `CORS_ALLOWED_ORIGINS` must exactly match the Vercel production origin, without a trailing slash; rerun `./scripts/deploy.sh`. |
| 502 from Caddy | Check that API Gateway is healthy and services registered with Eureka: `docker compose --env-file docker/.env -f docker/docker-compose.prod.yml ps` and `logs -f api-gateway`. |
| Service keeps restarting | Inspect its logs and `docker stats`; confirm memory and swap availability. |
| Image not found | Confirm `DOCKER_USERNAME` and `IMAGE_TAG` match CI-published images. For a private Docker Hub repository, authenticate with `docker login` on the EC2 host before deploy. |

### Verified deployment (2026-11-20)

- Frontend: <https://resolve-ai-ecru.vercel.app>, deployed on Vercel with the project root set to `frontend` and `VITE_API_BASE_URL` set to the API domain.
- API: <https://resolveai-jyosna.duckdns.org>, served through Caddy over HTTPS to the API Gateway. `GET /actuator/health` returned `{"status":"UP"}` and Caddy issued its certificate automatically.
- Backend host: AWS EC2 in `ap-southeast-2` (Sydney), `m7i-flex.large` with 8 GB RAM, Ubuntu 26.04 LTS, 30 GB `gp3`, and an Elastic IP. The security group allowed SSH only from the operator's IP and HTTP/HTTPS from anywhere.
- Images: seven public `resolveai-*` images in Docker Hub namespace `jyosnavuttla`; CI publishes images on pushes to `main`.
- End-to-end flow: bootstrap administrator login, create a Billing agent on the Team page, submit a customer ticket and receive AI triage, send an agent reply, and confirm the customer can see the reply. The Vercel origin passed the CORS check.

The bootstrap script initially rejected Ubuntu 26.04, so the host was provisioned manually. The production Caddy health check uses `127.0.0.1`: `localhost` resolved to IPv6 in the Alpine container and caused connection refusals.

### Operations runbook

- **Start:** Start the EC2 instance in the AWS console and allow about five minutes for containers to restart and services to become ready. If services remain unhealthy, SSH to the host and run `bash scripts/deploy.sh --no-pull` from the repository.
- **Stop:** Stop the instance when the demo is not needed; do not terminate it. Persistent disk data remains on the EBS volume.
- **Costs:** EBS storage and the public IPv4 address can continue to incur charges while stopped. Free plan credits are consumed while the instance runs.
- **SSH keepalive:** Add `ServerAliveInterval 30` to the relevant host entry in `~/.ssh/config` to keep SSH sessions active.
- **SSH access:** Update the security group's SSH source rule when the laptop's public IP changes.
- **Lessons:** Check Free plan instance eligibility in the launch wizard; scripts must account for supported OS versions; wait for service discovery before smoke requests; avoid entering secrets more than once; use `127.0.0.1` instead of `localhost` in Alpine container health checks.
