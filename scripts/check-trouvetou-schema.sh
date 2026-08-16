#!/usr/bin/env bash
# Vérification du schéma Trouvetou sur Supabase (4 tables).
# Lecture des identifiants depuis .env.local, aucune valeur affichée.
set -euo pipefail

cd "$(dirname "$0")/.."

set -a
# shellcheck disable=SC1091
. ./trouvetou/.env.local
set +a

URL="${TROUVETOU_SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL:?NEXT_PUBLIC_SUPABASE_URL manquante dans .env.local}}"
PUBKEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:?NEXT_PUBLIC_SUPABASE_ANON_KEY manquante}"
SVCKEY="${TROUVETOU_SUPABASE_SERVICE_ROLE_KEY:?TROUVETOU_SUPABASE_SERVICE_ROLE_KEY manquante}"

check() {
  local table="$1" key="$2" label="$3"
  local body
  body="$(timeout 20 curl -s -H "apikey: ${key}" \
    -H "Authorization: Bearer ${key}" \
    "${URL}/rest/v1/${table}?select=*&limit=1")"
  printf '%-12s %s\n' "$table" "$label: $( [ "${body:0:1}" = "[" ] && echo "OK ($(echo "$body" | wc -c) octets)" || echo "KO -> $body" )"
}

check "categories" "$PUBKEY" "publique"
check "listings"   "$PUBKEY" "publique"
check "providers"  "$SVCKEY" "service_role"
check "sync_logs"  "$SVCKEY" "service_role"
