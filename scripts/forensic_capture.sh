#!/bin/bash
# Simulación de un Analista Forense recolectando evidencia de la red

OUTPUT_FILE="/vagrant/evidence_capture_$(date +%Y%m%d_%H%M%S).pcap"

echo "[*] INICIANDO RECOLECCIÓN FORENSE DE RED [*]"
echo "Iniciando volcado completo de red (Full Packet Capture)..."
echo "Guardando evidencia en: $OUTPUT_FILE"
echo "Ejecuta 'make simulate-client' en otra terminal ahora."
echo "La captura se detendrá automáticamente en 35 segundos..."

# Capturar TODO el tráfico en el puerto 80 y 3000 (HTTP plano) para análisis
tshark -i any -f "tcp port 80 or tcp port 3000" -w "$OUTPUT_FILE" -a duration:35

echo "[*] CAPTURA FINALIZADA [*]"
echo "Archivo PCAP generado con éxito."
echo "El forense ahora puede abrir '$OUTPUT_FILE' en Wireshark (Host) para ver la filtración de credenciales."
