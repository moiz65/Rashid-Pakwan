#!/usr/bin/env bash
# Start Backend API, Admin Frontend, and Ordering Website with one command.
# Usage: ./start.sh

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PIDS=()

cleanup() {
  trap - INT TERM EXIT
  echo ""
  echo "Stopping all services..."
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" 2>/dev/null; then
      # Kill process group so npm child processes stop too
      kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
  echo "All services stopped."
  exit 0
}

trap cleanup INT TERM EXIT

need_dir() {
  if [[ ! -d "$1" ]]; then
    echo "Missing folder: $1"
    exit 1
  fi
}

need_dir "Backend"
need_dir "Frontend"
need_dir "Resturant_ordering_management/Frontend"

ensure_deps() {
  if [[ ! -d "$1/node_modules" ]]; then
    echo "Installing dependencies in $1 ..."
    (cd "$1" && npm install)
  fi
}

ensure_deps "Backend"
ensure_deps "Frontend"
ensure_deps "Resturant_ordering_management/Frontend"

echo "========================================"
echo "  Restaurant project — starting all"
echo "========================================"
echo "  Backend API        → http://localhost:5000"
echo "  Admin Frontend     → http://localhost:5173"
echo "  Ordering Website   → http://localhost:8080"
echo "========================================"
echo "Press Ctrl+C to stop everything."
echo ""

# Start each app in its own process group (setsid) so cleanup can stop children.
setsid bash -c "cd \"$ROOT/Backend\" && npm run dev" \
  > >(sed -u 's/^/[backend] /') 2>&1 &
PIDS+=($!)

setsid bash -c "cd \"$ROOT/Frontend\" && npm run dev -- --host 0.0.0.0 --port 5173" \
  > >(sed -u 's/^/[admin] /') 2>&1 &
PIDS+=($!)

setsid bash -c "cd \"$ROOT/Resturant_ordering_management/Frontend\" && npm run dev -- --host 0.0.0.0 --port 8080" \
  > >(sed -u 's/^/[ordering] /') 2>&1 &
PIDS+=($!)

# Keep script alive while children run
wait
