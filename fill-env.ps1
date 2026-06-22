# ============================================================
# CLARE — Interactive .env.local filler
# Run AFTER collecting keys from Supabase + Stripe
# ============================================================
Write-Host ""
Write-Host "=== CLARE — Environment Variable Setup ===" -ForegroundColor Cyan
Write-Host "Paste each value when prompted. Press Enter to skip if unsure." -ForegroundColor Gray
Write-Host ""

function Prompt-Value($label, $key, $placeholder) {
    Write-Host "  $label" -ForegroundColor Yellow
    Write-Host "  ($placeholder)" -ForegroundColor DarkGray
    $val = Read-Host "  > "
    if ($val) { return "$key=$val" }
    return "$key=REPLACE_ME"
}

$lines = @(
    "# Supabase",
    (Prompt-Value "Supabase Project URL" "NEXT_PUBLIC_SUPABASE_URL" "https://xxxx.supabase.co"),
    (Prompt-Value "Supabase Anon Key" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJ..."),
    (Prompt-Value "Supabase Service Role Key" "SUPABASE_SERVICE_ROLE_KEY" "eyJ..."),
    "",
    "# Stripe",
    (Prompt-Value "Stripe Publishable Key" "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "pk_live_..."),
    (Prompt-Value "Stripe Secret Key" "STRIPE_SECRET_KEY" "sk_live_..."),
    (Prompt-Value "Stripe Webhook Secret (from Stripe Webhooks page)" "STRIPE_WEBHOOK_SECRET" "whsec_..."),
    "",
    "# App",
    (Prompt-Value "Your App URL (e.g. https://clare.vercel.app)" "NEXT_PUBLIC_APP_URL" "https://your-app.vercel.app"),
    (Prompt-Value "Admin email address" "ADMIN_EMAIL" "admin@yourcompany.com")
)

$content = $lines -join "`n"
Set-Content -Path ".env.local" -Value $content

Write-Host ""
Write-Host "  .env.local written successfully!" -ForegroundColor Green
Write-Host "  Review it with: notepad .env.local" -ForegroundColor Gray
Write-Host ""
pause
