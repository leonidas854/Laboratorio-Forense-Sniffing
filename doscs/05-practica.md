# Práctica comparativa reproducible

## Preparación común

Registrar participantes, autorización del grupo, IP del servidor/cliente, URL, interfaz, puerto, hora UTC y versiones. Sincronizar relojes (`timedatectl status`), cerrar tráfico innecesario y usar `admin` / `admin123` exclusivamente. Abrir un navegador nuevo evita reutilizar conexiones fuera de la ventana de captura.

```bash
ip -br address
ip route get IP_DEL_CLIENTE

tshark -D
```

Elegir la interfaz que recibe al cliente: p. ej. `enp0s8`, `zt...` o `lo` **solo si el cliente realmente es local**. No usar `any` ni el bridge Podman. Los scripts piden interfaz/IP/puerto para no capturar redes enteras por defecto.

Si no se tienen permisos de captura, ejecutar solo la captura con `sudo bash ...`, o configurar permisos de dumpcap según la distribución. El análisis offline no necesita root. No ocultar los mensajes de tshark; registrar paquetes descartados. Si sudo crea la evidencia como root, el administrador puede entregar una copia al forense mediante `sudo cp` y `sudo chown`; conservar el original restringido.

## Caso A: HTTP activo

En el servidor, antes del login (ejemplo LAN):

```bash
bash scripts/forensic_capture.sh enp0s8 192.168.56.10 8080 40 evidence/http
```

Mientras se capturan los 40 segundos, el cliente abre `http://192.168.56.10:8080`, completa la cuenta ficticia y pulsa **Iniciar sesión**. Registra el mensaje «Login exitoso», URL y hora. Alternativa automatizada:

```bash
make simulate-client BASE_URL=http://192.168.56.10:8080
```

La captura se guarda en un directorio único `evidence/http/capture-FECHA-XXXXXX/` con `traffic.pcapng`, `metadata.txt` y `SHA256SUMS`. Sustituir esa ruta real en los siguientes comandos:

```bash
cd evidence/http/capture-FECHA-XXXXXX
sha256sum -c SHA256SUMS
# Volver a la raíz del proyecto para ejecutar el analizador.
```

El atacante simulado recibe **una copia autorizada de ese archivo**, sin entrar a PostgreSQL ni revisar contraseñas del código:

```bash
bash scripts/attacker_sniff.sh evidence/http/capture-FECHA-XXXXXX/traffic.pcapng 8080
```

Resultado esperado: al menos un JSON con `username=admin`, `password=admin123`, número de frame y flujo TCP. La contraseña ya es conocida por ser una cuenta de prueba; la evidencia válida es recuperarla **del cuerpo de la petición**, no leerla en el formulario estático ni encontrar una cadena en el bundle JS.

En Wireshark: Decode As → HTTP si es necesario; filtrar `http.request.method == "POST" && http.request.uri == "/api/login"`; seleccionar la petición y **Follow → TCP Stream**. Ver cabeceras, JSON y respuesta. `http.file_data` en tshark es hexadecimal: el script lo decodifica y usa reensamblado TCP/HTTP en dos pasadas, no un grep sobre segmentos sueltos.

## Caso B: HTTPS, después de habilitarlo

Seguir primero [activación y confianza del certificado](03-https.md). Confirmar que el navegador valida el certificado, sin excepciones. No exportar claves TLS ni usar un proxy de inspección.

```bash
bash scripts/forensic_capture.sh enp0s8 192.168.56.10 8443 40 evidence/https
```

Mientras captura: acceder a `https://lab.test:8443` (o IP incluida en SAN) e iniciar sesión. Repetir el intento del atacante sobre el PCAP de ese puerto:

```bash
bash scripts/attacker_sniff.sh evidence/https/capture-FECHA-XXXXXX/traffic.pcapng 8443
```

Resultado esperado: paquetes TCP/TLS presentes, cero credenciales recuperadas. El analizador desactiva en sus invocaciones el archivo de claves y las claves RSA de TLS configuradas en tshark. En Wireshark usar `tcp.port == 8443 && tls`, inspeccionar ClientHello/ServerHello y registros Application Data. Follow TCP Stream muestra bytes cifrados, no el POST.

Para certificar la prueba, hacen falta simultáneamente: captura con tráfico TLS, punto de captura correcto, certificado validado y login exitoso confirmado por el cliente. **Cero resultados en una captura vacía no prueba nada.** Los mensajes HTTP 200/401 no se ven en el enlace TLS, aunque se registren en Nginx. Guardar ese log como evidencia separada y declarar su procedencia.

## Matriz de resultados

| Observación del enlace externo | HTTP | HTTPS correctamente validado |
|---|---|---|
| TCP, IP, puertos y tiempos | Sí | Sí |
| Método, URI `/api/login`, cabeceras | Legibles | Dentro de TLS |
| Usuario y contraseña del POST | Recuperables con captura suficiente | No recuperables por esta observación pasiva sin claves |
| Respuesta JSON / código HTTP | Legible | Cifrado en el enlace |
| Intento del atacante | Extraer JSON de la captura | Mismo intento, registrar que no obtiene el cuerpo |
| Resultado inválido | Captura vacía / punto incorrecto | Captura vacía, confianza omitida o backend capturado |

## Si el resultado no coincide

- **No hay paquetes:** comprobar interfaz/IP, puerto publicado, firewall y hora del login; revisar `ip route get`, no cambiar a `any` sin justificar el punto.
- **HTTP sin cuerpo:** iniciar captura antes de conectar, capturar longitud completa (`-s 0`), revisar pérdida, Decode As y Follow TCP Stream. El script solo analiza JSON en `/api/login`; otros formularios requieren adaptar el filtro.
- **Se lee HTTP en la prueba HTTPS:** verificar URL real, redirecciones, puerto y si la captura procede de Nginx → aplicación. Ese enlace es HTTP por diseño.
- **TLS sin login exitoso:** revisar SAN, CA, vigencia y confianza; no atribuirlo a una defensa contra el observador.
- **La base falla:** revisar healthchecks y credenciales persistidas; un error 503 no es una prueba de cifrado.

Referencia: [manual TShark: captura, filtros y reensamblado](https://www.wireshark.org/docs/man-pages/tshark.html).
