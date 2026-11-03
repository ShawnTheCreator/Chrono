@echo off
echo ==========================================================
echo          CHRONO - AI AGENT FLIGHT RECORDER                
echo ==========================================================
echo Starting FastAPI Bridge Backend on port 8000...
start "Chrono Bridge Backend (:8000)" cmd /k "python -m uvicorn bridge.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Home Page Frontend (home/) on port 3000...
start "Chrono Home Frontend (:3000)" cmd /k "pnpm --dir home dev -p 3000"

echo Starting Cockpit Frontend (web/ - Login + Dashboard) on port 3001...
start "Chrono Cockpit (:3001)" cmd /k "pnpm --dir web dev -p 3001"

echo.
echo All services launching:
echo   - Home Page:          http://localhost:3000
echo   - Cockpit Login:      http://localhost:3001/login
echo   - Cockpit Dashboard:  http://localhost:3001/dashboard
echo   - Access:             One-click instant operator login available on login screen
echo.
