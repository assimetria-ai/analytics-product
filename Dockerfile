# ─────────────────────────────────────────────────────────────────────────────
#  Assimetria Product — Dockerfile (nginx + Express dual-server)
#  Vite frontend build + Node.js backend + nginx reverse proxy
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: client build ──────────────────────────────────────────────────
FROM node:20-alpine AS client-build
WORKDIR /app
COPY client/package*.json ./
RUN npm install 2>/dev/null || npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# ── Stage 2: server deps ──────────────────────────────────────────────────
FROM node:20-alpine AS server-deps
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev 2>/dev/null || cd server && npm install --omit=dev

# ── Stage 3: runner (nginx + node) ────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache tini nginx postgresql-client

# Server
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server/src/ ./server/src/
COPY server/package*.json ./server/

# @custom at project root (if exists)
COPY @custom/ ./@custom/ 2>/dev/null || true

# Built frontend → nginx serves from here
COPY --from=client-build /app/dist /usr/share/nginx/html

# Landing page
COPY landing.html /usr/share/nginx/html/landing.html

# nginx config
RUN rm -f /etc/nginx/http.d/default.conf 2>/dev/null || true
COPY nginx.production.conf /etc/nginx/http.d/default.conf

# Start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/start.sh"]
