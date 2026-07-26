# ---- build ----
FROM node:22-alpine AS build
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime ----
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app \
    && mkdir -p /tmp/nginx \
    && chown -R app:app /usr/share/nginx/html /tmp/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY --from=build --chown=app:app /build/dist/control-panel-fe/browser .

RUN chmod +x /docker-entrypoint.sh

USER app
EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
