# Isi GitHub Actions secrets dari .env lokal
#
# Dijalankan SETELAH `gh auth login` selesai di terminal kamu.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/set-github-secrets.ps1
#
# Semua nilai dikirim lewat file dotenv temporer yang langsung dihapus,
# bukan lewat argv, sehingga nilainya tidak muncul di process listing
# maupun di log runner. Token Firebase diambil langsung dari cache
# firebase-tools (yang sudah dipakai `firebase login` lokal), jadi tidak
# perlu menjalankan `firebase login:ci` secara interaktif.
#
# ---------------------------------------------------------------------------
# KAPAN HARUS DIJALANKAN ULANG
#
# Build di GitHub Actions membaca konfigurasi dari GitHub Secrets, BUKAN
# dari file .env di laptop. Jadi mengubah .env secara lokal tidak
# berpengaruh apa-apa ke situs sampai script ini dijalankan ulang.
#
# Kalau kamu mengganti nilai di .env (API key, token Telegram, dll):
#
#   1. powershell -NoProfile -ExecutionPolicy Bypass `
#        -File scripts/set-github-secrets.ps1
#   2. git add -A; git commit -m "..."; git push
#
# Langkah 2 hanya memicu deploy. Kalau dilewati, situsnya tetap memakai
# nilai lama walaupun .env lokal sudah diperbarui.
#
# Perhatikan juga: `git push` hanya memicu deploy kalau branch-nya `main`.
# Push ke branch lain tidak mengubah situs sampai di-merge ke main.
# ---------------------------------------------------------------------------
param(
  [string]$Repo = 'Radikdwiyoga/PromanAI'
)

$ErrorActionPreference = 'Stop'
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
if (-not (Test-Path $gh)) { throw "gh.exe tidak ditemukan di $gh" }

# --- Kumpulkan nilai dari .env -------------------------------------------
# Join-Path di Windows PowerShell 5 hanya menerima 2 argumen (tidak seperti
# PS 7 yang menerima -AdditionalChildPath), jadi path dirangkai manual.
$envPath = Join-Path (Join-Path $PSScriptRoot '..') '.env'
if (-not (Test-Path $envPath)) { throw ".env tidak ditemukan di $envPath" }

$values = [ordered]@{}
foreach ($line in Get-Content $envPath) {
  if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
  $k = $line.Split('=')[0].Trim()
  $v = $line.Split('=', 2)[1].Trim()
  if ($k -and $v) { $values[$k] = $v }
}

# --- Token Firebase dari cache firebase-tools -----------------------------
# `firebase login:ci` hanya bisa dijalankan di terminal interaktif, tapi token
# yang dipakai CLI secara lokal sudah tersimpan di configstore dan bertipe
# refresh token dengan scope cloud-platform — kelas yang sama dengan keluaran
# login:ci. Membacanya dari sini menghindari langkah manual tersebut.
$configPath = Join-Path (Join-Path $env:USERPROFILE '.config\configstore') 'firebase-tools.json'
if (Test-Path $configPath) {
  $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
  if ($cfg.tokens.refresh_token) { $values['FIREBASE_TOKEN'] = $cfg.tokens.refresh_token }
}

# --- Tulis dotenv temporer ------------------------------------------------
$tmp = Join-Path $env:TEMP ("proman-secrets-{0}.env" -f ([guid]::NewGuid().ToString('N')))
try {
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  $lines = foreach ($k in $values.Keys) { "$k=$($values[$k])" }
  [System.IO.File]::WriteAllLines($tmp, $lines, $utf8)

  # Upsert sekaligus. gh membaca dotenv dan men-set tiap variabel sebagai
  # repository secret.
  & $gh secret set --env-file $tmp --repo $Repo
  if ($LASTEXITCODE -ne 0) { throw "gh secret set gagal" }

  Write-Host "`nSelesai. $($values.Count) secret dikirim ke $Repo`n"
  foreach ($k in $values.Keys) { Write-Host "  OK  $k ($($values[$k].Length) karakter)" }
}
finally {
  # File ini berisi seluruh nilairahasia dalam bentuk plaintext.
  if (Test-Path $tmp) { Remove-Item $tmp -Force }
}

Write-Host "`nVerifikasi: gh secret list --repo $Repo"
