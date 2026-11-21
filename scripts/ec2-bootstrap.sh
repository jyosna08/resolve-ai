#!/usr/bin/env bash
set -euo pipefail

if [[ ! -r /etc/os-release ]]; then
  echo "Cannot identify the operating system; this script requires Ubuntu 24.04 or 26.04." >&2
  exit 1
fi
# shellcheck disable=SC1091
source /etc/os-release
if [[ "${ID:-}" != "ubuntu" ]]; then
  echo "Unsupported operating system: ${PRETTY_NAME:-unknown}. Use Ubuntu 24.04 or 26.04." >&2
  exit 1
fi
if [[ "${VERSION_ID:-}" != "24.04" && "${VERSION_ID:-}" != "26.04" && "${ALLOW_UNTESTED_OS:-0}" != "1" ]]; then
  echo "Unsupported Ubuntu version: ${VERSION_ID:-unknown}. Use Ubuntu 24.04 or 26.04, or set ALLOW_UNTESTED_OS=1 to continue on an untested Ubuntu release." >&2
  exit 1
fi
if [[ "$(id -u)" -eq 0 ]]; then
  echo "Run this script as a sudo-capable non-root user so that user can be added to the docker group." >&2
  exit 1
fi
if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required; run this script as a sudo-capable user." >&2
  exit 1
fi
sudo -v

sudo apt-get update
compose_package=""
if apt-cache show docker-compose-v2 2>/dev/null | grep -q '^Package: docker-compose-v2$'; then
  compose_package="docker-compose-v2"
elif apt-cache show docker-compose-plugin 2>/dev/null | grep -q '^Package: docker-compose-plugin$'; then
  compose_package="docker-compose-plugin"
else
  echo "Neither docker-compose-v2 nor docker-compose-plugin is available from the configured apt repositories." >&2
  exit 1
fi
sudo env DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io git curl jq "$compose_package"
sudo systemctl enable --now docker
sudo usermod -aG docker "$(id -un)"

if ! sudo swapon --show --noheadings | grep -q .; then
  if [[ ! -f /swapfile ]]; then
    if ! sudo fallocate -l 2G /swapfile; then
      sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
    fi
  fi
  sudo chmod 600 /swapfile
  if ! sudo blkid /swapfile >/dev/null 2>&1; then
    sudo mkswap /swapfile
  fi
  sudo swapon /swapfile
fi
if ! sudo grep -qE '^[[:space:]]*/swapfile[[:space:]]' /etc/fstab; then
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swappiness.conf >/dev/null
sudo sysctl -p /etc/sysctl.d/99-swappiness.conf

echo
echo "Docker: $(docker --version)"
echo "Compose: $(docker compose version)"
echo "Git: $(git --version)"
echo "curl: $(curl --version | head -n 1)"
echo "jq: $(jq --version)"
echo
echo "Next steps:"
echo "1. Log out and back in so the docker group membership takes effect."
echo "2. Clone the repository: git clone <repository-url> resolve-ai"
echo "3. In the repository, copy docker/.env.prod.example to docker/.env and edit every placeholder."
echo "4. Run ./scripts/deploy.sh"
