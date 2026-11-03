Write-Host "==========================================================" -ForegroundColor Green
Write-Host "         CHRONO — AI AGENT FLIGHT RECORDER                " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

Write-Host "Starting FastAPI Bridge Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn bridge.app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting Home Page Frontend (home/ - Vite) on http://127.0.0.1:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm --dir home dev"

Write-Host "Starting Cockpit Frontend (web/ - Next.js Login + Dashboard) on http://127.0.0.1:3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm --dir web dev -p 3001"

Write-Host ""
Write-Host "Services launched successfully!" -ForegroundColor Green
Write-Host "  Home Page:          http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Cockpit Login:      http://localhost:3001/login" -ForegroundColor Cyan
Write-Host "  Cockpit Dashboard:  http://localhost:3001/dashboard" -ForegroundColor Cyan
Write-Host "  Access:             One-click instant operator login available on login screen" -ForegroundColor Gray
Write-Host ""
