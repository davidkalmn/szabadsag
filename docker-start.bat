@echo off
REM Docker startup script for Szabadsag project (Windows)

echo 🚀 Starting Szabadsag Docker containers...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    exit /b 1
)

REM Build and start containers
docker-compose up -d --build

REM Wait a moment for containers to start
timeout /t 5 /nobreak >nul

REM Check if containers are running
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ Failed to start containers. Check logs with: docker-compose logs
    exit /b 1
) else (
    echo ✅ Containers are running!
    echo.
    echo 📱 Application URLs:
    echo    - Backend: http://localhost:8000
    echo    - Frontend Dev Server: http://localhost:5173
    echo.
    echo 📋 Useful commands:
    echo    - View logs: docker-compose logs -f
    echo    - Stop containers: docker-compose down
    echo    - Run artisan: docker-compose exec app php artisan [command]
    echo    - Run composer: docker-compose exec app composer [command]
)

