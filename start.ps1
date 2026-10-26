Write-Host "==========================================================" -ForegroundColor Green
Write-Host "         CHRONO — AI AGENT FLIGHT RECORDER                " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

Write-Host "Starting FastAPI Bridge Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn bridge.app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting Next.js Frontend Cockpit on http://127.0.0.1:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm --dir web dev"

Write-Host ""
Write-Host "Services launched successfully!" -ForegroundColor Green
Write-Host "  Home Page: http://localhost:3000/home" -ForegroundColor Cyan
Write-Host "  Login:     http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "  Cockpit:   http://localhost:3000/" -ForegroundColor Cyan
Write-Host "  Account:   admin@chrono.sec / ChronoSecure2026!" -ForegroundColor Gray
Write-Host ""
