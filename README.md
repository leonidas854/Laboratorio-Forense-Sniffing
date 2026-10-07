# Laboratorio forense · HTTP / HTTPS

Servidor para Rocky Linux con **Nginx + Next.js/Tailwind + PostgreSQL**, ejecutado con Podman Compose. HTTP funciona desde el inicio; HTTPS queda configurado y comentado para activarlo después con el certificado/dominio elegido.

```bash
cp .env.example .env
# Editar DB_PASSWORD y, para clientes remotos, LAB_BIND_IP.
make lab-up
make validate
```

Abrir **http://127.0.0.1:8080**. Cuenta ficticia: **admin / admin123**. Para una IP remota, usar `make lab-up BASE_URL=http://IP_SERVIDOR:8080`. La demo valida credenciales; no crea sesiones persistentes.

- `make lab-status` / `make lab-logs`: estado y diagnóstico.
- `make lab-down`: detener conservando PostgreSQL.
- `make simulate-client BASE_URL=http://IP:8080`: pruebas del cliente (instalar primero sus dependencias).
- `make help`: comandos de captura y Vagrant opcional.

**Documentación completa en [`doscs/README.md`](doscs/README.md)**: instalación Rocky, HTTPS futuro, protocolos, roles, ZeroTier, captura y plantilla de informe forense.

La comparación se hace sobre el enlace cliente → Nginx con datos ficticios. En HTTP se recupera el login transmitido; en HTTPS un observador pasivo sin claves no recupera ese cuerpo. Estar en el mismo switch o en ZeroTier no basta para ver el tráfico ajeno: la guía define el punto de captura y cómo compartir evidencia entre cuatro participantes.
