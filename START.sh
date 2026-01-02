#!/bin/bash
# Quick start script for DevSecOps Security Dashboard

echo "🚀 Starting DevSecOps Security Dashboard..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker found"
echo ""

# Start services
echo "📦 Starting services with Docker Compose..."
echo ""

# Use docker compose (newer) or docker-compose (older)
if docker compose version &> /dev/null; then
    docker compose up
else
    docker-compose up
fi
