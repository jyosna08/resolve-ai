# ResolveAI Docker Compose

## Prerequisites

- Docker Desktop with Docker Compose v2.
- At least 4 GB of memory assigned to the Docker VM; 6 GB is recommended.
- A Gemini API key for live AI triage. The application falls back when the key is empty or unavailable.

## First-time setup

From `C:\resolve-ai` in PowerShell:

```powershell
Copy-Item docker\.env.example docker\.env
notepad docker\.env
```

Set a private `JWT_SECRET` of at least 32 characters, database and RabbitMQ passwords, and `GEMINI_API_KEY`. Keep `VITE_API_BASE_URL` and `CORS_ALLOWED_ORIGINS` consistent with the address used in your browser.

## Commands

Run these from the repository root:

```powershell
docker compose -f docker/docker-compose.yml up --build -d
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f <service>
docker compose -f docker/docker-compose.yml down
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml build <service>
```

`down -v` deletes the database and RabbitMQ data. The SQL initialization script runs only when PostgreSQL starts with an empty data volume.

## URLs

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| API gateway | http://localhost:8080 |
| Eureka dashboard | http://localhost:8761 |
| RabbitMQ management | http://localhost:15672 |
| Auth Swagger UI | http://localhost:8081/swagger-ui.html |
| AI triage Swagger UI | http://localhost:8083/swagger-ui.html |
| Ticket workflow Swagger UI | http://localhost:8082/swagger-ui.html |
| Notification/SLA Swagger UI | http://localhost:8084/swagger-ui.html |

The RabbitMQ UI login is set by `RABBITMQ_USER` and `RABBITMQ_PASS` in `docker/.env`.

## Troubleshooting

- If a service is unhealthy, inspect it with `docker compose -f docker/docker-compose.yml logs -f <service>`.
- `VITE_API_BASE_URL` is embedded during the frontend image build. Rebuild with `docker compose -f docker/docker-compose.yml build frontend` after changing it.
- The PostgreSQL database creation script runs only on an empty volume. To recreate databases, use `docker compose -f docker/docker-compose.yml down -v` before starting again.
- `CORS_ALLOWED_ORIGINS` must exactly match the browser URL for the frontend, including scheme, host, and port.

## Low memory (8 GB laptops)

Set the WSL memory allocation in `%USERPROFILE%\.wslconfig`:

```ini
[wsl2]
memory=4GB
```

Then restart WSL from PowerShell:

```powershell
wsl --shutdown
```

Uncomment and set the following in `docker/.env`:

```dotenv
JAVA_OPTS=-Xmx256m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError
```

Maven builds use significant memory. Limit parallel builds in PowerShell:

```powershell
$env:COMPOSE_PARALLEL_LIMIT = 2
docker compose -f docker/docker-compose.yml build
```

Start the services in stages, checking `ps` until each stage is healthy before proceeding:

```powershell
docker compose -f docker/docker-compose.yml up -d postgres rabbitmq discovery-server
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml up -d auth-team-service ai-triage-service ticket-workflow-service notification-sla-service
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml up -d api-gateway frontend
docker compose -f docker/docker-compose.yml ps
```
