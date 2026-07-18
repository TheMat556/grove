#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Prüfe Supabase CLI..."
if ! command -v supabase &>/dev/null; then
	echo "FEHLER: supabase CLI nicht gefunden. Installiere mit: brew install supabase/tap/supabase"
	exit 1
fi

echo "==> Prüfe Bun-Abhängigkeiten..."
if [ ! -d "node_modules" ]; then
	echo "    Installiere Abhängigkeiten..."
	bun install
fi

echo "==> Starte Supabase (Migrations + Seed inkl. Dev-User)..."
supabase start

echo ""
echo "=================================================="
echo "  Dev-Umgebung bereit!"
echo "=================================================="
echo ""
echo "  App:        http://localhost:3000"
echo "  Login:      http://localhost:3000/auth/login"
echo "  Supabase:   http://localhost:54323"
echo ""
echo "  Dev-Zugang:"
echo "    Email:    dev@grove.de"
echo "    Passwort: dev123"
echo "    Rolle:    admin"
echo ""
echo "=================================================="
echo ""

echo "==> Starte Next.js Dev-Server..."
bun run dev
