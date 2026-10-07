#!/usr/bin/env bash
set -euo pipefail
url=${1:-http://127.0.0.1:8080}
for ((i=0; i<60; i++)); do
  if curl --fail --silent --max-time 2 "$url/api/health" >/dev/null; then
    echo "Laboratorio listo: $url"
    exit 0
  fi
  sleep 2
done
echo "El laboratorio no respondió en $url/api/health. Revisa podman-compose logs." >&2
exit 1
