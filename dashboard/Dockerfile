# Development Dockerfile for Dashboard
FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
# Try npm ci first, fallback to npm install if it fails
RUN npm ci || npm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


