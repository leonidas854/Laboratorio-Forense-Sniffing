#!/usr/bin/env bash
# Captura limitada al enlace cliente -> Nginx. No usar 'any' ni el bridge interno.
set -euo pipefail
umask 077
if (( $# < 2 || $# > 5 )); then
  echo "Uso: $0 INTERFAZ IP_SERVIDOR [PUERTO=8080] [SEGUNDOS=40] [DIRECTORIO=evidence]" >&2
  exit 2
fi
iface=$1 server=$2 port=${3:-8080} duration=${4:-40} out_dir=${5:-evidence}
[[ "$iface" != any && "$iface" =~ ^[a-zA-Z0-9_.:-]+$ ]] || { echo 'Elige una interfaz concreta (no any).' >&2; exit 2; }
python3 -c 'import ipaddress,sys; ipaddress.ip_address(sys.argv[1])' "$server"
[[ "$port" =~ ^[0-9]+$ && "$duration" =~ ^[0-9]+$ ]] || exit 2
(( port >= 1 && port <= 65535 && duration >= 1 && duration <= 3600 )) || exit 2
command -v tshark >/dev/null
mkdir -p "$out_dir"
prefix=$(mktemp -d "$out_dir/capture-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")
filter="host $server and tcp port $port"
{
  echo "capture_started_utc=$(date -u +%FT%TZ)"
  echo "interface=$iface"
  echo "server=$server"
  echo "port=$port"
  echo "filter=$filter"
  echo "duration_seconds=$duration"
  echo "operator=$(id -un)"
  echo "hostname=$(uname -n)"
  echo "point=Completar: interfaz de entrada, cliente o SPAN; nunca backend para comparar TLS"
  tshark --version | sed -n '1p'
} > "$prefix/metadata.txt"
echo "Capturando $filter en $iface durante $duration segundos. Genera el login ahora."
# No ocultar errores de permisos, paquetes descartados o interfaz inexistente.
tshark -n -i "$iface" -f "$filter" -s 0 -F pcapng -w "$prefix/traffic.pcapng" -a "duration:$duration"
echo "capture_finished_utc=$(date -u +%FT%TZ)" >> "$prefix/metadata.txt"
(cd "$prefix" && sha256sum traffic.pcapng metadata.txt > SHA256SUMS)
echo "Evidencia: $prefix/traffic.pcapng"
echo "Verificación: (cd '$prefix' && sha256sum -c SHA256SUMS)"
