FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit
COPY . .
ARG SITE_URL=https://analytics.example.com
ARG SITE_BASE_URL=/docs/
ENV SITE_URL=$SITE_URL
ENV SITE_BASE_URL=$SITE_BASE_URL
RUN npm run validate

FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
USER root
ARG SITE_BASE_URL=/docs/
COPY deploy/nginx-container.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /tmp/site
RUN rm -rf /usr/share/nginx/html/* \
    && mkdir -p "/usr/share/nginx/html${SITE_BASE_URL}" \
    && cp -R /tmp/site/. "/usr/share/nginx/html${SITE_BASE_URL}" \
    && cp /tmp/site/404.html /usr/share/nginx/html/404.html \
    && rm -rf /tmp/site
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1
