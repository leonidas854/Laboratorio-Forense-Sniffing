# Laboratorio Forense: Análisis de Tráfico de Red (Sniffing HTTP)

Este repositorio contiene la infraestructura y código fuente necesarios para desplegar un escenario completo de laboratorio de informática forense. El objetivo principal es ilustrar los peligros de transmitir información confidencial (como credenciales de acceso) sobre protocolos no cifrados (HTTP) y enseñar técnicas de recolección de evidencia mediante análisis de paquetes.

## 🏛️ Arquitectura del Entorno

El laboratorio se levanta de manera orquestada usando:
- **Vagrant**: Proveedor de la máquina virtual con sistema operativo Rocky Linux 9.
- **Podman & Podman Compose**: Gestor de contenedores que ejecuta la base de datos (PostgreSQL) y el backend/frontend.
- **Next.js**: Framework de React utilizado para desarrollar la aplicación vulnerable (Login).
- **Nginx**: Actúa como proxy inverso sin cifrado SSL/TLS (intencionalmente).
- **Playwright**: Simula interacciones humanas benignas (el cliente logueándose continuamente).
- **ZeroTier**: VPN peer-to-peer para que el atacante o el forense puedan integrarse de forma remota (Opcional).

> Para más detalles arquitectónicos, revisar la carpeta `/docs/arquitectura.md`.

## ⚙️ Pre-requisitos

1. **VirtualBox** (o proveedor compatible de Vagrant).
2. **Vagrant** instalado en tu máquina host (Windows/Linux/Mac).
3. **Node.js y npm** (Para ejecutar las pruebas de Playwright localmente en el host).
4. *(Opcional)* Cuenta y Network ID de **ZeroTier**.

## 🚀 Despliegue y Configuración

El laboratorio está altamente automatizado mediante un archivo `Makefile` que agrupa las acciones de todos los roles (Administrador, Cliente, Atacante y Analista Forense).

### 1. Configuración del Entorno
Renombra el archivo `.env.example` a `.env` y configura el ID de tu red ZeroTier (si deseas conectividad remota):
```bash
cp .env.example .env
# Edita .env con tu ZEROTIER_NETWORK_ID si aplica
```

### 2. Iniciar la Infraestructura
En tu terminal (dentro de la carpeta del proyecto), ejecuta:
```bash
make lab-up
```
*Este proceso descargará la imagen de Rocky Linux 9, instalará Nginx, herramientas forenses, levantará Podman y construirá la aplicación vulnerable. Puede tardar unos minutos la primera vez.*

## 🧪 Ejecución de Pruebas (Roles)

Para simular el ecosistema completo, lo ideal es abrir **tres terminales separadas** en el directorio del proyecto:

### Terminal 1: Simulación de Tráfico Benigno (El Cliente)
Un "empleado" iniciará sesión en el portal repetidas veces.
```bash
make simulate-client
```

### Terminal 2: Recolección Forense (El Analista)
El investigador captura de manera integral el tráfico de la red para preservarlo en un archivo `.pcap`.
```bash
make simulate-forensics
```
*Esto generará un archivo `evidence_capture_*.pcap` en la carpeta raíz del proyecto que posteriormente puedes abrir con Wireshark.*

### Terminal 3: Intercepción (El Atacante)
Un atacante dentro de la red roba las credenciales pasivamente leyendo el tráfico HTTP en tiempo real.
```bash
make simulate-attacker
```

## 🛑 Limpieza del Laboratorio

Cuando hayas finalizado tus pruebas, destruye los recursos ejecutando:
```bash
make lab-down
```
