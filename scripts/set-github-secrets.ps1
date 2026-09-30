# Isi GitHub Actions secrets dari .env lokal
#
# Dijalankan SETELAH `gh auth login` dan `firebase login:ci` selesai di
# terminal kamu. Nilai secret tidak pernah dicetak ke output.
#
#   pwsh -File scripts/set-github-secrets.ps1
param(
  [string]$Repo = 'Radikdwiyoga/PromanAI',
  [string]$FirebaseToken = ''
)

$ErrorActionPreference = 'Stop'
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
if (-not (Test-Path $gh)) { throw "gh.exe tidak ditemukan di $gh" }

# --- Kumpulkan nilai dari .env -------------------------------------------
# Join-Path di Windows PowerShell 5 hanya menerima 2 argumen (tidak seperti
# PS 7 yang menerima -AdditionalChildPath), jadi path dirangkai manual.
$envPath = Join-Path (Join-Path $PSScriptRoot '..') '.env'
if (-not (Test-Path $envPath)) { throw ".env tidak ditemukan di $envPath" }

$values = @{}
foreach ($line in Get-Content $envPath) {
  if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
  $k = $line.Split('=')[0].Trim()
  $v = $line.Split('=', 2)[1].Trim()
  if ($v) { $values[$k] = $v }
}

$expected = @(
  'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID', 'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_GROQ_API_KEY', 'VITE_OPENROUTER_API_KEY',
  'VITE_TELEGRAM_BOT_TOKEN', 'VITE_TELEGRAM_CHAT_ID'
)

$missing = $expected | Where-Object { -not $values.ContainsKey($_) }
if ($missing) {
  Write-Warning "Key ini kosong di .env, dilewati: $($missing -join ', ')"
}

Write-Host "Mengisi secrets untuk $Repo`n"

foreach ($name in $expected) {
  if (-not $values.ContainsKey($name)) { continue }
  # Nilai dikirim lewat stdin supaya tidak muncul di process listing / log.
  $values[$name] | & $gh secret set $name --repo $Repo --body - 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "gagal set $name" }
  Write-Host "  OK  $name"
}

if ($FirebaseToken) {
  $FirebaseToken | & $gh secret set FIREBASE_TOKEN --repo $Repo --body - 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "gagal set FIREBASE_TOKEN" }
  Write-Host "  OK  FIREBASE_TOKEN"
} else {
  Write-Warning "FIREBASE_TOKEN dilewati. Set manual atau jalankan ulang dengan -FirebaseToken <token>."
}

Write-Host "`nSelesai. Verifikasi dengan: gh secret list --repo $Repo"
