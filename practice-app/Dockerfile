# ShopLab container — used in CI and for shared test environments (Module 18).
#   docker build -t shoplab ./practice-app
#   docker run --rm -p 3000:3000 shoplab
#   docker run --rm -p 3000:3000 -e BUG_MODE=1 shoplab        # bug mode
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public
# Test hooks (/api/test/*) stay enabled on purpose: the course needs reset/bug mode.
# For a production-like image set NODE_ENV=production (hooks are then not mounted, REQ-SEC-05).
ENV PORT=3000 SHOPLAB_DATA_DIR=/app/data
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "--no-warnings=ExperimentalWarning", "src/server.js"]
