# Helpdesk Automated Setup Script (Windows PowerShell)
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " 🚀 Helpdesk App - Complete Setup Script " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Check Bun Installation
Write-Host "`n[1/4] Checking Bun installation..." -ForegroundColor Yellow
$bunCmd = Get-Command bun -ErrorAction SilentlyContinue
if (-not $bunCmd) {
    Write-Host "❌ Bun is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Installing Bun via official PowerShell installer..." -ForegroundColor Green
    powershell -c "irm bun.sh/install.ps1 | iex"
    $env:PATH = "$env:USERPROFILE\.bun\bin;$env:PATH"
} else {
    Write-Host "✅ Bun found: $(bun --version)" -ForegroundColor Green
}

# 2. Check Environment Variables
Write-Host "`n[2/4] Verifying environment configurations..." -ForegroundColor Yellow
if (-not (Test-Path "server\.env")) {
    Write-Host "Creating server/.env from template..." -ForegroundColor Gray
    Copy-Item "server\.env.example" "server\.env"
}
if (-not (Test-Path "client\.env")) {
    Write-Host "Creating client/.env from template..." -ForegroundColor Gray
    Copy-Item "client\.env.example" "client\.env"
}
Write-Host "✅ Environment files verified (.env)" -ForegroundColor Green

# 3. Install Monorepo Dependencies
Write-Host "`n[3/4] Installing monorepo dependencies..." -ForegroundColor Yellow
bun install

# 4. Prisma Setup
Write-Host "`n[4/4] Setting up Prisma database..." -ForegroundColor Yellow
Write-Host "To complete the database setup, ensure PostgreSQL is running (e.g. via 'docker compose up -d' or local service), then run:" -ForegroundColor Cyan
Write-Host "  cd server" -ForegroundColor White
Write-Host "  bunx prisma migrate dev" -ForegroundColor White
Write-Host "  bunx prisma db seed" -ForegroundColor White

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host " 🎉 Setup preparation complete!" -ForegroundColor Green
Write-Host " Start Server: cd server; bun run dev" -ForegroundColor White
Write-Host " Start Client: cd client; bun run dev" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Green
