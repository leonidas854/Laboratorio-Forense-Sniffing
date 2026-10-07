# Laboratorio 01: HTTP y HTTPS

Servidor Rocky Linux + Nginx + Next.js/Tailwind + PostgreSQL, con cuatro participantes. **HTTP está activo. HTTPS está preparado y comentado**, sin publicar su puerto ni requerir certificados al arrancar.

Usar únicamente las cuentas ficticias de este repositorio y tráfico del grupo. El objetivo es demostrar qué puede recuperar un observador del enlace y conservar evidencia reproducible.

## Guía de lectura

1. [Arquitectura, roles y alcance](01-arquitectura.md).
2. [Despliegue directo en Rocky Linux y Podman](02-rocky-linux.md).
3. [Activar HTTPS posteriormente y usar otro dominio/web](03-https.md).
4. [Protocolos y recorrido de los datos](04-protocolos.md).
5. [Práctica HTTP/HTTPS: cliente, atacante y forense](05-practica.md).
6. [Trabajo remoto con cuatro compañeros y ZeroTier](06-zerotier.md).
7. [Plantilla de informe y cadena de custodia](07-informe-forense.md).
8. [Decisiones de implementación y verificación](08-implementacion-y-pruebas.md).

## Inicio local

```bash
cp .env.example .env
# Editar DB_PASSWORD: contraseña de PostgreSQL exclusiva de esta práctica.
make lab-up
make validate
```

Abrir `http://127.0.0.1:8080` e introducir `admin` / `admin123`. `make lab-down` detiene los contenedores y **conserva el volumen de datos**. En un servidor remoto, ajustar `LAB_BIND_IP` y `BASE_URL` según la guía de Rocky.

La demo verifica credenciales; no crea sesiones, cookies de autenticación ni un panel privado. No confundir una respuesta «Login exitoso» con una aplicación completa de gestión de usuarios.
