FROM node:20-alpine AS frontend-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM node:20-alpine AS backend-builder

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Install tini
RUN apk add --no-cache tini
ENTRYPOINT [ "/sbin/tini", "--" ]

# Copy backend
COPY --from=backend-builder /app/server/package*.json ./
RUN npm ci --only=production
COPY --from=backend-builder /app/server/dist ./dist

# Copy frontend to public folder
COPY --from=frontend-builder /app/client/dist ./public

EXPOSE 7531

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
