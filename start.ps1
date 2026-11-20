# Helpdesk 1-Click Launch Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Mosh Hamedani's Helpdesk Application" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$bunPath = "$env:USERPROFILE\.bun\bin"
$env:PATH = "$bunPath;$env:PATH"
Set-Location $PSScriptRoot

Write-Host "`n[1/3] Starting Embedded PostgreSQL Database (Port 5432)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH='$bunPath;' + `$env:PATH; bun run db"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Express 5 Backend API (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH='$bunPath;' + `$env:PATH; bun run dev:server"

Start-Sleep -Seconds 2

Write-Host "[3/3] Starting React 19 Frontend Client (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH='$bunPath;' + `$env:PATH; bun run dev:client"

Start-Sleep -Seconds 3

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  Application Started Successfully!" -ForegroundColor Green
Write-Host "  Frontend URL:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend URL:   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  Login Credentials:" -ForegroundColor Cyan
Write-Host "    Email:    admin@example.com" -ForegroundColor White
Write-Host "    Password: AdminPassword123!" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green

Start-Process "http://localhost:5173"
