@echo off
title SmartSales AI - Launcher
echo ===================================================
echo      Starting SmartSales AI All Services...
echo ===================================================
echo.

echo [1/3] Starting Node.js Backend Server (Port 5000)...
start "SmartSalesAI - Backend Server" cmd /k "cd /d %~dp0server && npm start"

echo [2/3] Starting React Frontend Client (Port 5173)...
start "SmartSalesAI - Frontend Client" cmd /k "cd /d %~dp0client && npm run dev"

echo [3/3] Starting Python ML Microservice (Port 8000)...
start "SmartSalesAI - Python ML Service" cmd /k "cd /d %~dp0ml-service && python main.py"

echo.
echo ===================================================
echo All services launched in separate windows!
echo.
echo  - Frontend App: http://localhost:5173
echo  - Node Backend: http://localhost:5000
echo  - ML Service:   http://localhost:8000
echo ===================================================
echo.
pause
