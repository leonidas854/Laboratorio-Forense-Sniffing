#!/usr/bin/env bash
# Observador pasivo del laboratorio: analiza una captura autorizada, sin MITM.
set -euo pipefail
if (( $# < 1 || $# > 2 )); then
  echo "Uso: $0 ARCHIVO.pcapng [PUERTO=8080]" >&2
  echo 'Primero captura con forensic_capture.sh en el punto autorizado.' >&2
  exit 2
fi
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
exec python3 "$script_dir/analyze_capture.py" "$@"
