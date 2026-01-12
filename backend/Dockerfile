# Multi-stage build for production-ready Docker image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install git and other required system dependencies
RUN apk add --no-cache git

WORKDIR /app

# Install production dependencies only
COPY package.json ./
RUN npm install --omit=dev

# Copy built files and Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create logs directory for production logging
RUN mkdir -p /app/logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership (including logs directory)
RUN chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3001

CMD ["node", "dist/server.js"]

