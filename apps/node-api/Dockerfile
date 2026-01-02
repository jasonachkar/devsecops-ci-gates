# DevSecOps Node.js API - Multi-stage Dockerfile
# This Dockerfile demonstrates security best practices while being
# realistic enough to trigger container security scans.

# ============================================================================
# Stage 1: Build
# ============================================================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci --only=production=false

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# ============================================================================
# Stage 2: Production
# ============================================================================
FROM node:20-alpine AS production

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Environment
ENV NODE_ENV=production \
    PORT=3000

# Start application
CMD ["node", "dist/server.js"]

# ============================================================================
# INTENTIONAL ISSUES (For Testing Container Scanners)
# ============================================================================

# 1. Base image may have vulnerabilities (realistic scenario)
#    - Using official node:20-alpine which may have CVEs
#    - Scanners should detect OS and dependency vulnerabilities

# 2. No explicit version pinning for npm packages
#    - package.json uses semver ranges which may pull vulnerable versions
#    - Demonstrates importance of dependency scanning

# Note: While this Dockerfile follows many best practices (multi-stage build,
# non-root user, health check), it's realistic enough that container scanners
# will find security issues, particularly in base image and dependencies.
