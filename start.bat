@echo off
title Helpdesk Starter
echo ========================================================
echo   Starting Mosh Hamedani's Helpdesk Application
echo ========================================================
echo.

set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
cd /d "%~dp0"

echo [1/3] Launching Embedded PostgreSQL Database (Port 5432)...
start "Helpdesk PostgreSQL (Port 5432)" cmd /k "set PATH=%USERPROFILE%\.bun\bin;%%PATH%% && bun run db"

ping 127.0.0.1 -n 4 >nul

echo [2/3] Launching Express 5 Backend API (Port 3000)...
start "Helpdesk Server API (Port 3000)" cmd /k "set PATH=%USERPROFILE%\.bun\bin;%%PATH%% && bun run dev:server"

ping 127.0.0.1 -n 3 >nul

echo [3/3] Launching React 19 Frontend Client (Port 5173)...
start "Helpdesk Client (Port 5173)" cmd /k "set PATH=%USERPROFILE%\.bun\bin;%%PATH%% && bun run dev:client"

ping 127.0.0.1 -n 4 >nul

echo.
echo ========================================================
echo   Application Started Successfully!
echo   Frontend URL:  http://localhost:5173
echo   Backend URL:   http://localhost:3000
echo.
echo   Login Credentials:
echo     Email:    admin@example.com
echo     Password: AdminPassword123!
echo ========================================================
echo.

start http://localhost:5173
