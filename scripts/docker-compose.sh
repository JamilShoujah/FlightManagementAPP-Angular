#!/usr/bin/env sh
set -eu

ENV_MODE="dev"
ACTION="up"
DETACH=true
BUILD=true
API_BASE_URL=""

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
    --api-base-url=*)
      API_BASE_URL="${arg#--api-base-url=}"
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: npm run docker:up -- --env=dev|prod [--foreground] [--no-build] [--down] [--api-base-url=http://host:port]" >&2
      exit 1
      ;;
  esac
done

if [ "$ACTION" = "down" ]; then
  echo "Stopping compose profile: $ENV_MODE"
  docker compose --profile "$ENV_MODE" down --remove-orphans
  exit 0
fi

if [ -n "$API_BASE_URL" ]; then
  export API_BASE_URL
  echo "Using API_BASE_URL: $API_BASE_URL"
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
