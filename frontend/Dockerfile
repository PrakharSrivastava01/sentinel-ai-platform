FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
RUN addgroup -S sentinel && adduser -S sentinel -G sentinel \
    && chown -R sentinel:sentinel /usr/share/nginx/html \
    && chown -R sentinel:sentinel /var/cache/nginx \
    && chown -R sentinel:sentinel /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown sentinel:sentinel /var/run/nginx.pid
COPY --from=builder --chown=sentinel:sentinel /app/dist /usr/share/nginx/html
COPY --chown=sentinel:sentinel nginx.conf /etc/nginx/conf.d/default.conf
USER sentinel
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
