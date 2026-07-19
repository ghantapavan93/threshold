# One-command verification (Windows). Runs the test suite + both smoke checks.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$py = ".\.venv\Scripts\python.exe"

function Step($name, $cmd) {
    Write-Host "== $name ==" -ForegroundColor Cyan
    & $py $cmd
    if ($LASTEXITCODE -ne 0) { Write-Host "FAILED: $name" -ForegroundColor Red; exit 1 }
}

Step "pytest"     "-m", "pytest", "-q"
& $py smoke.py;      if ($LASTEXITCODE -ne 0) { exit 1 }
& $py api_smoke.py;  if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "`nALL VERIFY PASSED" -ForegroundColor Green
