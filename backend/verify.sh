#!/usr/bin/env bash
# One-command verification. Runs the test suite + both smoke checks.
set -euo pipefail
cd "$(dirname "$0")"
PY="./.venv/Scripts/python.exe"
[ -x "$PY" ] || PY="./.venv/bin/python"

echo "== pytest =="
"$PY" -m pytest -q
echo "== engine smoke =="
"$PY" smoke.py
echo "== api smoke =="
"$PY" api_smoke.py
echo ""
echo "ALL VERIFY PASSED"
