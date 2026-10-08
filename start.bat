@echo off
title PrepNest Launcher
echo ========================================================
echo               Starting PrepNest Platform
echo ========================================================
echo.
echo [1/2] Launching Backend on http://127.0.0.1:8000 ...
start "PrepNest Backend" cmd /k "cd /d %~dp0backend && ..\.venv\Scripts\python.exe main.py"

echo [2/2] Launching Frontend on http://localhost:5173 ...
start "PrepNest Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Both servers have been launched in separate windows!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo ========================================================
pause
