# Cuatro compañeros por ZeroTier

## Organización

El servidor sigue siendo un Rocky Linux del grupo. Los cuatro equipos se unen a una **red privada** de ZeroTier administrada por uno de ustedes; autorizar únicamente sus nodos y registrar su rol/IP.

| Nodo | Ejemplo de IP virtual | Rol |
|---|---|---|
| Rocky | 10.147.17.10 | Nginx + aplicación + base |
| Compañero 2 | 10.147.17.11 | Cliente |
| Compañero 3 | 10.147.17.12 | Forense |
| Compañero 4 | 10.147.17.13 | Atacante de práctica |

Estas IP son ejemplos: usar las asignadas realmente, sin solaparlas con la LAN. Instalar ZeroTier One según su [guía oficial](https://docs.zerotier.com/quickstart/); no se instala ni se une automáticamente desde Vagrant/Compose. Una vez instalado:

```bash
sudo systemctl enable --now zerotier-one
sudo zerotier-cli join ID_DE_RED_DE_16_HEXADECIMALES
sudo zerotier-cli listnetworks
ip -br address
```

Autorizar los cuatro miembros en el controlador, comprobar que reciben dirección y anotar el nombre de interfaz `zt...`. En Rocky cambiar `.env` a `LAB_BIND_IP=10.147.17.10`, permitir TCP 8080 solo desde la subred del grupo en la zona correcta de firewalld y recrear Nginx:

```bash
podman-compose up -d --force-recreate nginx
```

Desde el cliente: `curl --fail http://10.147.17.10:8080/api/health` y abrir esa URL. Si luego se usa HTTPS por IP, incluirla en SAN; por nombre, resolverlo a esta IP en cada equipo.

## Punto de captura y cifrado

ZeroTier transporta una red Ethernet virtual sobre un transporte cifrado entre nodos. **En la interfaz física se observa el túnel, aunque la web use HTTP.** Para comparar la web, capturar en la interfaz virtual del servidor o del cliente, una vez retirado el túnel. Allí HTTP sigue siendo HTTP y HTTPS conserva TLS. [Descripción del protocolo ZeroTier](https://docs.zerotier.com/protocol/).

Pertenecer a esa red no entrega automáticamente el unicast de los demás. En esta práctica la modalidad acordada es:

1. El administrador/forense inicia la captura en `zt...` de Rocky, limitada a su IP y puerto.
2. El cliente inicia sesión desde su equipo.
3. El administrador entrega copias del PCAP y hashes al forense y al atacante mediante el canal del grupo (por ejemplo SCP con cuentas autorizadas).
4. Cada uno verifica SHA-256 y analiza offline; el forense registra quién entregó cada copia.

```bash
bash scripts/forensic_capture.sh ztINTERFAZ_REAL 10.147.17.10 8080 40 evidence/zerotier-http
# HTTPS, únicamente después de activarlo:
# bash scripts/forensic_capture.sh ztINTERFAZ_REAL 10.147.17.10 8443 40 evidence/zerotier-https
```

Esto permite trabajar remotamente sin afirmar que un compañero puede espiar por el solo hecho de estar conectado. Un diseño con espejo virtual o gateway de tránsito requeriría configurar específicamente la observación; queda fuera de la versión sencilla.

No repartir claves TLS ni claves privadas de ZeroTier. Al terminar, revocar nodos que ya no participen y cerrar reglas que se hayan abierto exclusivamente para la práctica.
