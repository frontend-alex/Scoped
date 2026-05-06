#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"
backend_dir="$root_dir/app/backend"
client_dir="$root_dir/app/client"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf '%s\n' "$1 is required. Install it and try again." >&2
    exit 1
  fi
}

require_command uv
require_command pnpm

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/ibcs_db}"
export JWT_SECRET_KEY="${JWT_SECRET_KEY:-local-dev-secret}"
export JWT_ALGORITHM="${JWT_ALGORITHM:-HS256}"
export JWT_EXPIRATION_MINUTES="${JWT_EXPIRATION_MINUTES:-60}"

backend_pid=""

cleanup() {
  if [[ -n "$backend_pid" ]] && kill -0 "$backend_pid" >/dev/null 2>&1; then
    printf '%s\n' "Stopping backend..."
    kill "$backend_pid"
    wait "$backend_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

printf '%s\n' "Starting backend..."
(cd "$backend_dir" && uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000) &
backend_pid="$!"

printf '%s\n' "Starting client..."
cd "$client_dir"
pnpm install
pnpm dev
