# HTTPS preparado para una segunda etapa

Ahora solo funciona HTTP. No hay certificados ni puerto TLS activos. La plantilla está **comentada** en `nginx/conf.d/lab.conf`, y el puerto/volumen están comentados en `podman-compose.yml`.

## Certificado para un dominio futuro

Obtener un certificado para el nombre elegido mediante el proveedor/ACME de esa web. El nombre usado en el navegador debe estar incluido en los SAN del certificado y resolver a la IP del laboratorio. Una CA pública no suele emitir para nombres privados como `lab.test`; DNS-01 permite validar un dominio público propio sin publicar la web del laboratorio a Internet.

Guardar la cadena (certificado del servidor primero, luego intermediarios) en `nginx/certs/fullchain.pem` y la clave en `nginx/certs/privkey.pem`. No versionar la clave. La renovación/ACME no se automatiza aquí: al renovar, validar y recargar Nginx.

El proceso de Nginx usa UID 101 dentro del contenedor. En Podman rootless, preparar acceso sin hacer pública la clave:

```bash
# Después de copiar los archivos; ejecutar como el usuario dueño de Podman.
chmod 755 nginx/certs
podman unshare chown 101:101 nginx/certs/fullchain.pem nginx/certs/privkey.pem
podman unshare chmod 644 nginx/certs/fullchain.pem
podman unshare chmod 600 nginx/certs/privkey.pem
```

## Alternativa de prueba: CA local confiable

Para ensayar antes de disponer de dominio, crear una CA de laboratorio y un certificado con SAN. Guardar su clave fuera del repositorio. Ejemplo para `lab.test` y `192.168.56.10`; sustituir la IP por la IP real, incluida la de ZeroTier si se usará directamente.

```bash
mkdir -m 700 -p "$HOME/forense-ca"
umask 077
openssl req -x509 -newkey rsa:3072 -nodes -days 30 \
  -keyout "$HOME/forense-ca/ca.key" -out "$HOME/forense-ca/ca.crt" \
  -subj '/CN=CA laboratorio forense' \
  -addext 'basicConstraints=critical,CA:TRUE' \
  -addext 'keyUsage=critical,keyCertSign,cRLSign'
openssl req -new -newkey rsa:2048 -nodes \
  -keyout nginx/certs/privkey.pem -out "$HOME/forense-ca/server.csr" \
  -subj '/CN=lab.test'
cat > "$HOME/forense-ca/server.ext" <<'EXT'
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:lab.test,IP:192.168.56.10,IP:127.0.0.1
EXT
openssl x509 -req -in "$HOME/forense-ca/server.csr" \
  -CA "$HOME/forense-ca/ca.crt" -CAkey "$HOME/forense-ca/ca.key" -CAcreateserial \
  -out nginx/certs/fullchain.pem -days 14 -sha256 -extfile "$HOME/forense-ca/server.ext"
```

Aplicar los permisos rootless indicados antes. Distribuir **solo `ca.crt`**, verificar su huella por un canal acordado y confiarla en el almacén del sistema/navegador de prueba. En Rocky: copiar a `/etc/pki/ca-trust/source/anchors/forense-lab.crt` y ejecutar `sudo update-ca-trust`. Algunos navegadores usan su propio almacén; comprobarlo. Mapear `lab.test` a la IP real en DNS o `/etc/hosts` de cada cliente. Retirar la CA cuando termine la práctica.

## Activar

1. Descomentar solo el bloque `server` HTTPS de `nginx/conf.d/lab.conf`, ajustar `server_name`.
2. Descomentar la publicación `${HTTPS_PORT}:8443` y el volumen de certificados en Compose.
3. Abrir TCP 8443 en la misma zona/subred autorizada que HTTP; si se usa Vagrant, descomentar también su forwarding.
4. Validar y recrear el servicio (dejar webapp y postgres arrancados):

```bash
podman-compose run --rm --no-deps nginx -t
podman-compose up -d --force-recreate nginx
make validate
curl --cacert "$HOME/forense-ca/ca.crt" https://127.0.0.1:8443/api/health
openssl s_client -connect 127.0.0.1:8443 -servername lab.test \
  -verify_hostname lab.test -CAfile "$HOME/forense-ca/ca.crt" -verify_return_error </dev/null
```

Si `LAB_BIND_IP` es la IP LAN/ZeroTier, sustituir `127.0.0.1` por esa IP, que también debe figurar en los SAN. Para una CA pública omitir `--cacert` y usar el dominio correcto. Un certificado inválido debe producir un error en el cliente; **no usar `curl -k` ni `ignoreHTTPSErrors`** para declarar exitosa la prueba.

Mantener 8080 y 8443 activos simultáneamente. La misma web y las mismas credenciales permiten aislar la diferencia de transporte. No añadir redirección automática ni HSTS mientras se comparan ambos casos. Para producción se revisaría esta decisión.

## Si después se usa otra web

Con otro dominio y esta aplicación, basta ajustar DNS, SAN/certificado y `server_name`. Para una aplicación diferente, crear otro upstream/servicio y un bloque de servidor dedicado, cambiando su `proxy_pass`; volver a validar. Si otra web/proxy externo termina TLS y reenvía HTTP a Rocky, la protección TLS acaba **en ese otro proxy**. Capturar su enlace posterior no demuestra que se haya descifrado HTTPS.

TLS termina en Nginx. Su conexión interna a Next.js sigue siendo HTTP; no está publicada al host. La comparación forense se hace antes de esa terminación.

Fuente: [configuración HTTPS de Nginx](https://nginx.org/en/docs/http/configuring_https_servers.html).
