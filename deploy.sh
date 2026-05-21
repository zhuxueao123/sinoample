#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT_DIR/deploy/cms/.env"
COMPOSE_FILE="$ROOT_DIR/deploy/cms/docker-compose.yml"

cd "$ROOT_DIR"

if [ -d .git ]; then
  git pull --ff-only
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  echo "Copy deploy/cms/.env.example to deploy/cms/.env and fill production values first."
  exit 1
fi

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
