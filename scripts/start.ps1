$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir "..")
$BackendDir = Join-Path $RootDir "app\backend"
$ClientDir = Join-Path $RootDir "app\client"

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    throw "uv is required to start the backend. Install uv and try again."
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    throw "pnpm is required to start the client. Install pnpm and try again."
}

if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/ibcs_db"
}

if (-not $env:JWT_SECRET_KEY) {
    $env:JWT_SECRET_KEY = "local-dev-secret"
}

if (-not $env:JWT_ALGORITHM) {
    $env:JWT_ALGORITHM = "HS256"
}

if (-not $env:JWT_EXPIRATION_MINUTES) {
    $env:JWT_EXPIRATION_MINUTES = "60"
}

Write-Host "Starting backend..."
$backend = Start-Process `
    -FilePath "uv" `
    -ArgumentList @("run", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000") `
    -WorkingDirectory $BackendDir `
    -NoNewWindow `
    -PassThru

try {
    Write-Host "Starting client..."
    Push-Location $ClientDir
    pnpm install
    pnpm dev
}
finally {
    Pop-Location
    if ($backend -and -not $backend.HasExited) {
        Write-Host "Stopping backend..."
        Stop-Process -Id $backend.Id -Force
    }
}
