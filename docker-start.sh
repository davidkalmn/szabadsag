#!/bin/bash

# Docker startup script for Szabadsag project

echo "🚀 Starting Szabadsag Docker containers..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start containers
docker-compose up -d --build

# Wait a moment for containers to start
sleep 5

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers are running!"
    echo ""
    echo "📱 Application URLs:"
    echo "   - Backend: http://localhost:8000"
    echo "   - Frontend Dev Server: http://localhost:5173"
    echo ""
    echo "📋 Useful commands:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Stop containers: docker-compose down"
    echo "   - Run artisan: docker-compose exec app php artisan [command]"
    echo "   - Run composer: docker-compose exec app composer [command]"
else
    echo "❌ Failed to start containers. Check logs with: docker-compose logs"
    exit 1
fi

