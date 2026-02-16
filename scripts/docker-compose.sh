#!/usr/bin/env sh
set -eu

ENV_MODE="dev"
ACTION="up"
DETACH=true
BUILD=true

for arg in "$@"; do
  case "$arg" in
    --env=dev|--env=development)
      ENV_MODE="dev"
      ;;
    --env=prod|--env=production)
      ENV_MODE="prod"
      ;;
    --down)
      ACTION="down"
      ;;
    --no-build)
      BUILD=false
      ;;
    --foreground)
      DETACH=false
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: npm run docker:up -- --env=dev|prod [--foreground] [--no-build] [--down]" >&2
      exit 1
      ;;
  esac
done

if [ "$ACTION" = "down" ]; then
  echo "Stopping compose profile: $ENV_MODE"
  docker compose --profile "$ENV_MODE" down --remove-orphans
  exit 0
fi

CMD="docker compose --profile $ENV_MODE up"

if [ "$BUILD" = true ]; then
  CMD="$CMD --build"
fi

if [ "$DETACH" = true ]; then
  CMD="$CMD -d"
fi

echo "Running: $CMD"
sh -c "$CMD"
