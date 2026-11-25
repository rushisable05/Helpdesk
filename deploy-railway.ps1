# 1-Click Railway Deployment Script for Helpdesk
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Helpdesk -> Railway 1-Click Deployment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Check Railway authentication
Write-Host "`n[1/5] Checking Railway login..." -ForegroundColor Yellow
$ErrorActionPreference = "Continue"
$whoami = bunx @railway/cli whoami 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Opening browser for Railway login..." -ForegroundColor Cyan
  bunx @railway/cli login
  if ($LASTEXITCODE -ne 0) { throw "Railway login failed." }
} else {
  Write-Host "Logged in as: $whoami" -ForegroundColor Green
}
$ErrorActionPreference = "Stop"

# 2. Load env vars from server/.env and client/.env
function Read-EnvFile($path) {
  $map = @{}
  if (Test-Path $path) {
    Get-Content $path | ForEach-Object {
      if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?(.*?)"?\s*$') {
        $map[$matches[1]] = $matches[2]
      }
    }
  }
  return $map
}

$serverEnv = Read-EnvFile "$PSScriptRoot\server\.env"
$clientEnv = Read-EnvFile "$PSScriptRoot\client\.env"

# 3. Initialize Railway project & Postgres + App service
Write-Host "`n[2/5] Initializing Railway project & PostgreSQL..." -ForegroundColor Yellow
$ErrorActionPreference = "Continue"
bunx @railway/cli init --name helpdesk 2>$null
bunx @railway/cli add --database postgres 2>$null
bunx @railway/cli add --service helpdesk 2>$null
$ErrorActionPreference = "Stop"
bunx @railway/cli service link helpdesk

# 4. Configure environment variables
Write-Host "`n[3/5] Setting production environment variables..." -ForegroundColor Yellow
$vars = @(
  'DATABASE_URL=${{Postgres.DATABASE_URL}}',
  "NODE_ENV=production",
  "ENABLE_JOB_QUEUE=true",
  "VITE_SENTRY_ENVIRONMENT=production"
)

foreach ($key in @("BETTER_AUTH_SECRET", "WEBHOOK_SECRET", "SENDGRID_API_KEY", "SENDGRID_FROM_EMAIL", "SEED_ADMIN_EMAIL", "SEED_ADMIN_PASSWORD", "SENTRY_DSN", "OPENAI_API_KEY")) {
  if ($serverEnv[$key]) {
    $vars += "$key=$($serverEnv[$key])"
  }
}
if ($clientEnv["VITE_SENTRY_DSN"]) {
  $vars += "VITE_SENTRY_DSN=$($clientEnv["VITE_SENTRY_DSN"])"
}

foreach ($v in $vars) {
  bunx @railway/cli variable set "$v" --service helpdesk --skip-deploys | Out-Null
}
Write-Host "Environment variables configured!" -ForegroundColor Green

# 5. Deploy & generate public domain
Write-Host "`n[4/5] Deploying Helpdesk to Railway..." -ForegroundColor Yellow
bunx @railway/cli up --service helpdesk

Write-Host "`n[5/5] Generating public HTTPS domain..." -ForegroundColor Yellow
bunx @railway/cli domain --service helpdesk

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

