# Despliegue en Rocky Linux 9

## Preparar el servidor

Los comandos se ejecutan en Rocky, salvo indicación contraria. Se recomienda 2 CPU, 4 GB RAM para construir Next.js, espacio para imágenes y acceso a Internet durante instalación/build. Después el portal no necesita CDN ni fuentes externas.

```bash
sudo dnf install -y epel-release
sudo dnf install -y podman podman-compose git make curl openssl python3 wireshark-cli tcpdump
podman --version
podman-compose --version
getenforce
```

Trabajar como usuario normal, con Podman rootless. `podman compose` es un wrapper que necesita un proveedor externo; aquí se utiliza explícitamente `podman-compose`. No hace falta Docker ni arrancar un daemon Podman. Si EPEL no ofrece `podman-compose`, revisar repositorios habilitados (`dnf repolist`); no instalar paquetes Python globalmente con sudo.

Clonar este repositorio o copiarlo a un directorio del usuario en un filesystem local. No instalar otro Nginx en el host: se ejecuta dentro de Compose.

```bash
cp .env.example .env
chmod 600 .env
ip -br address
```

Editar `.env`:

```dotenv
LAB_BIND_IP=192.168.56.10
HTTP_PORT=8080
HTTPS_PORT=8443
DB_USER=forensics_user
DB_PASSWORD=contraseña_exclusiva_del_laboratorio
DB_NAME=forensics_db
```

La IP debe existir en el servidor: usar la de la LAN de laboratorio o la de ZeroTier, no la de un compañero. `127.0.0.1` solo admite clientes locales; `0.0.0.0` publica en todas las interfaces IPv4 y exige revisar el firewall. Los puertos altos permiten rootless sin modificar `net.ipv4.ip_unprivileged_port_start`. Los puertos convencionales son 80/443, pero 8080/8443 transportan exactamente HTTP/HTTPS.

## Firewalld y SELinux

Mantener SELinux en enforcing. Los bind mounts usan `:Z` para etiquetar archivos privados del contenedor. No montar el proyecto completo ni el home. Si hay denegaciones, revisar `sudo ausearch -m AVC -ts recent`; no usar `setenforce 0` como arreglo.

Consultar la zona real de la interfaz del laboratorio:

```bash
sudo firewall-cmd --get-active-zones
sudo firewall-cmd --get-zone-of-interface=enp0s8
```

Ejemplo si la zona es `public` y la red autorizada es `192.168.56.0/24` (sustituir ambos valores; para ZeroTier usar su subred):

```bash
sudo firewall-cmd --permanent --zone=public --add-rich-rule='rule family="ipv4" source address="192.168.56.0/24" port port="8080" protocol="tcp" accept'
sudo firewall-cmd --reload
sudo firewall-cmd --zone=public --list-all
```

Si firewalld está inactivo, decidir su configuración con el administrador antes de habilitarlo, especialmente en conexiones SSH. No abrir PostgreSQL/3000, ni 8443 hasta activar HTTPS.

## Arrancar y comprobar

```bash
make lab-up BASE_URL=http://192.168.56.10:8080
make lab-status
make validate
curl --fail http://192.168.56.10:8080/api/health
podman-compose port nginx 8080
```

Si el puerto ya está ocupado, cambiar `HTTP_PORT` en `.env` y usar ese mismo puerto en `BASE_URL`, firewall y capturas. Después de reconstruir/recrear solo `webapp`, recrear también Nginx (`podman-compose up -d --no-deps --force-recreate nginx`) para que resuelva nuevamente la IP del backend.

Abrir esa URL desde el cliente. Cuenta ficticia: `admin` / `admin123`. Nginx responde de forma predeterminada sin redirigir HTTP a HTTPS. Los healthchecks verifican PostgreSQL, luego API y luego proxy; no se depende de una pausa fija de diez segundos.

```bash
make lab-logs
make lab-down
```

El volumen `pgdata` persiste. `init.sql` solo se ejecuta con un volumen vacío: cambiar `DB_PASSWORD` en `.env` no cambia la contraseña dentro de una base ya inicializada. Si se conserva una base anterior, ajustar `.env` a esa contraseña o rotarla explícitamente dentro de PostgreSQL. No ejecutar `down -v` salvo que se quiera borrar deliberadamente toda la base del laboratorio.

La política `unless-stopped` reinicia procesos que fallan mientras funciona Podman. No se garantiza arranque rootless después de reiniciar Rocky: para este laboratorio ejecutar `make lab-up` tras entrar; si se requiere servicio permanente, preparar una unidad systemd/Quadlet y linger como trabajo adicional.

## Cliente automático

En el equipo cliente, instalar Node.js 22 y luego:

```bash
cd playwright-client
npm ci
npx playwright install chromium
BASE_URL=http://192.168.56.10:8080 npm test
```

Linux puede necesitar `npx playwright install --with-deps chromium`. Las pruebas generan tres accesos correctos, uno incorrecto y solicitudes de validación de API; la práctica manual permite capturar un único login más fácil de explicar.

## Vagrant opcional

`make vm-up` crea Rocky con VirtualBox y copia el proyecto a `/home/vagrant/laboratorio`; no modifica SELinux ni instala ZeroTier automáticamente. Después:

```bash
vagrant ssh
cd /home/vagrant/laboratorio
cp .env.example .env
# Editar LAB_BIND_IP=0.0.0.0 para LAN y forwarding de la VM; configurar firewall.
make lab-up
```

Desde el host: `http://127.0.0.1:8080`; desde la red privada VirtualBox: `http://192.168.56.10:8080`. El puerto del host debe estar libre. `make vm-halt` apaga la VM sin destruirla. La ruta directa en Rocky es la principal y no requiere Vagrant.

Fuentes: [Podman Compose](https://docs.podman.io/en/latest/markdown/podman-compose.1.html), [volúmenes y etiquetas SELinux de Podman](https://docs.podman.io/en/latest/markdown/podman-run.1.html).
