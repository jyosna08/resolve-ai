#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

COMPOSE_FILE="docker/docker-compose.prod.yml"
ENV_FILE="docker/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy docker/.env.prod.example to docker/.env and configure it first." >&2
  exit 1
fi
if grep -q 'replace_with_' "${ENV_FILE}"; then
  echo "${ENV_FILE} still contains replace_with_ placeholders. Replace them before deploying." >&2
  exit 1
fi

SKIP_PULL=false
for argument in "$@"; do
  case "${argument}" in
    --no-pull) SKIP_PULL=true ;;
    *) echo "Unknown option: ${argument}. Supported option: --no-pull" >&2; exit 2 ;;
  esac
done

compose() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

if [[ "${SKIP_PULL}" != "true" ]]; then
  compose pull
fi

wait_healthy() {
  local service="$1"
  local container_id=""
  local status="missing"
  local deadline=$((SECONDS + 300))

  while (( SECONDS < deadline )); do
    container_id="$(compose ps -q "${service}")"
    if [[ -n "${container_id}" ]]; then
      status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "${container_id}" 2>/dev/null || true)"
      if [[ "${status}" == "healthy" ]]; then
        echo "${service} is healthy."
        return 0
      fi
    fi
    sleep 5
  done

  echo "Timed out waiting for ${service} to become healthy (last status: ${status}). Recent logs:" >&2
  compose logs --tail=50 "${service}" >&2 || true
  return 1
}

start_and_wait() {
  if [[ "${SKIP_PULL}" == "true" ]]; then
    compose up -d --pull never "$@"
  else
    compose up -d "$@"
  fi
  local service
  for service in "$@"; do
    wait_healthy "${service}"
  done
}

start_and_wait postgres rabbitmq discovery-server
start_and_wait auth-team-service ai-triage-service ticket-workflow-service notification-sla-service
start_and_wait api-gateway
start_and_wait caddy

compose ps
echo
echo "Checking API Gateway health from inside the Compose network..."
compose exec -T api-gateway wget -qO- http://localhost:8080/actuator/health

API_DOMAIN="$(sed -n 's/^API_DOMAIN=//p' "${ENV_FILE}" | tail -n 1 | tr -d '\r')"
if [[ -z "${API_DOMAIN}" ]]; then
  echo "API_DOMAIN is missing from ${ENV_FILE}." >&2
  exit 1
fi
echo
echo "Public health URL: https://${API_DOMAIN}/actuator/health"
echo "Follow logs with: docker compose --env-file ${ENV_FILE} -f ${COMPOSE_FILE} logs -f [service]"
