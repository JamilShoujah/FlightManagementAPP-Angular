FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build mode selector:
# - development -> uses src/environments/environment.ts
# - production  -> uses src/environments/environment.production.ts
ARG BUILD_ENV=production
RUN if [ "$BUILD_ENV" = "development" ] || [ "$BUILD_ENV" = "dev" ]; then \
      npm run build -- --configuration development; \
    elif [ "$BUILD_ENV" = "production" ] || [ "$BUILD_ENV" = "prod" ]; then \
      npm run build -- --configuration production; \
    else \
      echo "Invalid BUILD_ENV: $BUILD_ENV (allowed: development|production|dev|prod)" >&2; \
      exit 1; \
    fi

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/flight-management-system/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
