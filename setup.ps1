# ============================================================
# CLARE — One-Click Local Setup Script
# Run this from inside the clare\ folder:
#   Right-click setup.ps1 → "Run with PowerShell"
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  CLARE Marketplace — Setup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "     Node.js $nodeVersion found." -ForegroundColor Green
} catch {
    Write-Host "     ERROR: Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
    Start-Process "https://nodejs.org"
    exit 1
}

# 2. npm install
Write-Host "[2/5] Installing dependencies (npm install)..." -ForegroundColor Yellow
npm install
Write-Host "     Dependencies installed." -ForegroundColor Green

# 3. Create .env.local if it doesn't exist
Write-Host "[3/5] Setting up .env.local..." -ForegroundColor Yellow
if (-Not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "     Created .env.local — fill in your keys before running the app." -ForegroundColor Green
} else {
    Write-Host "     .env.local already exists." -ForegroundColor Green
}

# 4. Git init + first commit
Write-Host "[4/5] Initialising git repository..." -ForegroundColor Yellow
if (-Not (Test-Path ".git")) {
    git init
    git add .
    git commit -m "Initial commit — CLARE Marketplace"
    Write-Host "     Git repo initialised with initial commit." -ForegroundColor Green
} else {
    Write-Host "     Git repo already exists." -ForegroundColor Green
}

# 5. Open key URLs for the user
Write-Host "[5/5] Opening setup pages in your browser..." -ForegroundColor Yellow
Start-Process "https://github.com/new"
Start-Sleep -Milliseconds 800
Start-Process "https://supabase.com/dashboard"
Start-Sleep -Milliseconds 800
Start-Process "https://dashboard.stripe.com/apikeys"
Start-Sleep -Milliseconds 800
Start-Process "https://vercel.com/new"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS (browser tabs just opened)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  GITHUB  → Create a new repo called 'clare'" -ForegroundColor White
Write-Host "           Then run in this folder:" -ForegroundColor Gray
Write-Host "           git remote add origin https://github.com/YOUR_USERNAME/clare.git" -ForegroundColor DarkGray
Write-Host "           git push -u origin main" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  SUPABASE → Open SQL Editor → run migration files:" -ForegroundColor White
Write-Host "           supabase\migrations\001_initial_schema.sql" -ForegroundColor DarkGray
Write-Host "           supabase\migrations\002_rpc_functions.sql" -ForegroundColor DarkGray
Write-Host "           Copy Project URL + Anon Key + Service Role Key into .env.local" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  STRIPE  → Copy Publishable Key + Secret Key into .env.local" -ForegroundColor White
Write-Host "           Set webhook endpoint to: https://YOUR_DOMAIN/api/stripe/webhooks" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  VERCEL  → Import your GitHub 'clare' repo → add all env vars → Deploy" -ForegroundColor White
Write-Host ""
Write-Host "  ADMIN   → After signup, run this in Supabase SQL Editor:" -ForegroundColor White
Write-Host "           UPDATE public.profiles SET role = 'admin'" -ForegroundColor DarkGray
Write-Host "           WHERE email = 'YOUR_EMAIL@example.com';" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  LOCAL   → Once .env.local is filled: npm run dev" -ForegroundColor White
Write-Host "           Visit: http://localhost:3000" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Setup complete! Fill .env.local and you're ready." -ForegroundColor Green
Write-Host ""
pause
