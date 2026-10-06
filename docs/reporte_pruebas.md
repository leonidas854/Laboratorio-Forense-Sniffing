# Reporte de Pruebas del Laboratorio Forense

## 1. Verificación de Entorno de Construcción
Se ha realizado la validación de los artefactos del código fuente de la aplicación Next.js.
- **Compilación Next.js**: Exitosa. El frontend y backend (`/api/login`) no presentan errores de sintaxis o empaquetado.
- **Configuración Docker (Podman)**: El archivo `Dockerfile` ha sido validado para la salida `standalone`, asegurando que la imagen generada sea lo más pequeña posible y apta para contenedores.

## 2. Pruebas de Tráfico Benigno (Playwright)
Los scripts del cliente (`playwright-client/tests/traffic.spec.ts`) están programados para realizar 5 intentos de autenticación contra `http://127.0.0.1:8080` (puerto expuesto por defecto de Nginx en el Host).
- Se enviará el JSON plano `{ "username": "admin", "password": "admin123" }`.
- El reporte HTML de Playwright está configurado para exportarse localmente tras ejecutar `make simulate-client`.

## 3. Pruebas de Scripts de Extracción Forense
Ambos scripts de `tshark` han sido estandarizados con sintaxis compatible:
- **Atacante** (`attacker_sniff.sh`): Filtra por método `POST`, URI `/api/login` y usa `grep`/`jq` para extraer de inmediato la credencial robada, emulando al atacante en vivo.
- **Analista** (`forensic_capture.sh`): Captura full-packet de los puertos `80` y `3000` directamente a un `.pcap` temporal sin interrumpir el flujo.

## 4. Limitaciones del Entorno Aislado
*Aviso técnico*: El aprovisionamiento completo mediante Vagrant (`make lab-up`) fue validado sintácticamente. Sin embargo, su despliegue end-to-end requiere de `VirtualBox`, un hypervisor de Capa 2 que debe correr físicamente en tu máquina (Windows/Linux/Mac), no pudiéndose ejecutar dentro de este entorno contenedorizado.

**Recomendación**: 
1. Haz `git pull` en tu PC anfitrión si es necesario.
2. Ejecuta `make lab-up` para desplegar Rocky Linux 9 y Podman con la prueba real.
