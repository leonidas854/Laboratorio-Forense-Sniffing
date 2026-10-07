# Plantilla de informe forense

Duplicar esta plantilla por práctica. No rellenar resultados esperados como si fueran observaciones reales.

## Identificación

- Caso / versión del repositorio:
- Fecha y hora UTC; zona horaria local (si se usa):
- Participantes y roles / autorización / alcance:
- Host servidor, cliente, versiones de SO, Podman, Nginx, tshark y navegador:
- Topología: LAN / VM / ZeroTier; IPs y puertos:
- Punto de captura exacto e interfaz; por qué recibe el tráfico:
- Hora y estado de sincronización de relojes:

## Adquisición

- Comando completo y filtro de captura:
- Hora UTC de inicio y fin:
- Paquetes capturados/descartados, interrupciones y limitaciones:
- Archivo original, tamaño, SHA-256:
- `metadata.txt` original y SHA-256:
- Copia de trabajo y coincidencia de hash:
- Custodio y ubicación del original:

Los scripts generan `SHA256SUMS` para el PCAP y metadatos al terminar. Verificar con `sha256sum -c SHA256SUMS` desde su directorio. El hash detecta diferencias respecto del valor registrado; por sí solo no prueba autoría, tiempo ni integridad de toda la cadena de custodia. Registrar el hash también en el acta/canal acordado. No modificar los originales al completar campos: hacerlo en un informe separado.

| UTC | Persona entrega | Persona recibe | Archivo / hash | Medio y motivo |
|---|---|---|---|---|
| Pendiente | | | | |

## Hallazgos HTTP

- URL y resultado del login confirmado por el cliente:
- Número de frame / `tcp.stream` / hora:
- Cabeceras, URI y cuerpo recuperados del POST:
- Respuesta observada y correlación temporal:
- Captura de pantalla (solo datos ficticios):
- Comando/salida del atacante y del analista:

## Hallazgos HTTPS

- URL, nombre SAN, emisor, vigencia y validación del certificado:
- Puerto y versión TLS negociada observada:
- Frame / flujo de handshake y registros de aplicación:
- Confirmación independiente de login exitoso:
- Resultado del mismo intento de recuperación sin claves TLS:
- Qué metadatos continúan visibles:

## Conclusión y limitaciones

Completar con evidencia: «En [punto], el archivo [hash] contiene [n] solicitudes HTTP cuyo cuerpo expone [...]. En [punto HTTPS], se observó una conexión TLS [versión] y el login fue confirmado por [...]; el intento de reconstrucción pasiva no recuperó el cuerpo. Este resultado se limita a [...]».

Indicar si se capturó tráfico detrás de Nginx, si hubo túnel ZeroTier, pérdidas, conexiones iniciadas antes de capturar, claves TLS disponibles, errores del certificado o diferencias de punto entre escenarios. No concluir «HTTPS es imposible de atacar» ni «se obtuvo toda la información del servidor».

## Evidencia complementaria

- Logs de Nginx (incluyen UTC/offset, request ID, método, ruta, estado y esquema; no cuerpos ni contraseñas).
- Resultado de `/api/health`, configuración efectiva y versiones/digests de imágenes.
- Resultado del cliente manual o Playwright, indicando que sus trazas pueden incluir datos ficticios de la prueba.
- Diagrama final, capturas y bibliografía de `doscs/04-protocolos.md`.
