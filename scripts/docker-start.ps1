# PowerShell script for Windows
# ShowMeLive Docker Starter

$Mode = $args[0]
if (-not $Mode) { $Mode = "full" }

Write-Host "🚀 ShowMeLive Docker Starter" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Check if Docker is running
try {
    $null = docker info 2>&1
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file. Please edit it with your configuration." -ForegroundColor Green
}

switch ($Mode) {
    "dev" {
        Write-Host "🔧 Starting development mode (DB + Redis only)..." -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml up -d
        
        Write-Host ""
        Write-Host "✅ Services started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Database:  postgres://postgres:postgres@localhost:5432/cutflow"
        Write-Host "Redis:     redis://localhost:6379"
        Write-Host "PgAdmin:   http://localhost:5050"
        Write-Host ""
        Write-Host "Run API locally:"
        Write-Host "  npm run start:dev"
    }
    
    "full" {
        Write-Host "🐳 Starting full stack with API container..." -ForegroundColor Cyan
        docker-compose up -d
        
        Write-Host ""
        Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host ""
                Write-Host "✅ All services are running!" -ForegroundColor Green
                Write-Host ""
                Write-Host "API:       http://localhost:3000"
                Write-Host "Docs:      http://localhost:3000/api/docs"
                Write-Host "PgAdmin:   http://localhost:5050"
                Write-Host "Redis:     redis://localhost:6379"
            }
        } catch {
            Write-Host "⚠️  API might still be starting... Check logs:" -ForegroundColor Yellow
            Write-Host "  docker-compose logs -f api"
        }
    }
    
    "stop" {
        Write-Host "🛑 Stopping all services..." -ForegroundColor Cyan
        docker-compose down
        docker-compose -f docker-compose.dev.yml down 2>$null
        Write-Host "✅ All services stopped." -ForegroundColor Green
    }
    
    "clean" {
        Write-Host "🧹 Cleaning up (removes all data)..." -ForegroundColor Red
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v 2>$null
        Write-Host "✅ All services and volumes removed." -ForegroundColor Green
    }
    
    default {
        Write-Host "Usage: .\scripts\docker-start.ps1 [dev|full|stop|clean]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  dev   - Start only DB and Redis (for local development)"
        Write-Host "  full  - Start entire stack including API container"
        Write-Host "  stop  - Stop all running services"
        Write-Host "  clean - Stop and remove all data (WARNING: deletes database)"
    }
}
