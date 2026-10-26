@echo off
echo ==========================================================
echo          CHRONO - AI AGENT FLIGHT RECORDER                
echo ==========================================================
echo Starting FastAPI Bridge Backend on port 8000...
start "Chrono Bridge Backend (:8000)" cmd /k "python -m uvicorn bridge.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Next.js Web Cockpit on port 3000...
start "Chrono Web Cockpit (:3000)" cmd /k "pnpm --dir web dev"

echo.
echo All services launching:
echo   - Home Page: http://localhost:3000/home
echo   - Login:     http://localhost:3000/login
echo   - Dashboard: http://localhost:3000/
echo   - Account:   admin@chrono.sec / ChronoSecure2026!
echo.
