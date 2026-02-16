#!/usr/bin/env sh
set -eu

BUILD_ENV="production"
IMAGE_TAG=""

for arg in "$@"; do
  case "$arg" in
    --env=dev|--env=development)
      BUILD_ENV="development"
      ;;
    --env=prod|--env=production)
      BUILD_ENV="production"
      ;;
    --tag=*)
      IMAGE_TAG="${arg#--tag=}"
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: npm run docker:build -- --env=dev|prod [--tag=your-image:tag]" >&2
      exit 1
      ;;
  esac
done

if [ -z "$IMAGE_TAG" ]; then
  if [ "$BUILD_ENV" = "development" ]; then
    IMAGE_TAG="flight-management-system:dev"
  else
    IMAGE_TAG="flight-management-system:prod"
  fi
fi

echo "Building image: $IMAGE_TAG (BUILD_ENV=$BUILD_ENV)"
docker build --build-arg BUILD_ENV="$BUILD_ENV" -t "$IMAGE_TAG" .
