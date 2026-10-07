# Implementación y verificación

## Cambios realizados

- Se conservó Next.js y PostgreSQL del proyecto existente. La página usa Tailwind CSS 4 compilado localmente, fuentes del sistema, diseño adaptable y etiquetas accesibles.
- El formulario usa una URL relativa: HTTP/HTTPS dependen de la URL real, no de un interruptor visual. El indicador muestra el protocolo del navegador.
- Nginx forma parte de Compose. Solo publica HTTP 8080; HTTPS 8443, volumen de certificados y bloque TLS quedan comentados. Next.js 3000 y PostgreSQL 5432 no se publican al host.
- Build por etapas con Node 22, lockfile y salida standalone. `.dockerignore` excluye dependencias locales, builds y archivos de entorno.
- Healthchecks con orden de dependencias; límites de memoria/PID; logs acotados; Nginx/app sin privilegios y con filesystem de solo lectura; volúmenes etiquetados para SELinux y persistencia de PostgreSQL.
- Se eliminaron credenciales de PostgreSQL embebidas en Compose/backend. La cuenta ficticia `admin/admin123` de la base sigue disponible. La demo no implementa sesiones persistentes ni hashes de contraseña.
- La API valida formato/tipos, consulta con parámetros, no devuelve contraseñas y no registra cuerpos de login. Las respuestas del login no se cachean.
- Captura con interfaz, IP, puerto y tiempo explícitos, PCAPNG completo, metadatos UTC, permisos restringidos y SHA-256. Análisis offline del POST reensamblado; perfil limpio de tshark sin claves TLS del usuario.
- Makefile orientado al servidor directo; Vagrant opcional conserva SELinux y ya no instala Nginx del host ni une ZeroTier automáticamente. `lab-down` conserva datos.
- Playwright prueba UI/API a través de Nginx. Lockfile del cliente agregado; CI actualizado a Node 22, lint, build de contenedores, espera de health y pruebas de navegador.

## Verificación ejecutada el 7 de octubre de 2026

Entorno disponible: Linux x86_64, Podman rootless 6.1.2, podman-compose 1.6.0, Nginx 1.30.5 y TShark 4.7.3. No era una VM Rocky. Se usaron puertos **18080/18443** y un proyecto de Compose aislado porque había otro laboratorio ocupando 8080/8443. No se modificaron sus contenedores.

| Verificación | Resultado observado |
|---|---|
| ESLint | Sin errores. |
| Imagen Podman: npm ci + Next.js build + TypeScript | Construcción correcta de la imagen standalone. |
| Arranque PostgreSQL → aplicación → Nginx | Los tres servicios `healthy`. |
| Puertos de la configuración HTTP | Solo Nginx publicado; backend y base sin publicación. |
| `nginx -t` HTTP | Correcto. |
| Playwright por HTTP | 5 pruebas aprobadas: 3 logins, móvil/login erróneo y validación de API. |
| Capturas de pantalla | Inspección de escritorio 1440 px y móvil 375 px; sin desbordamiento horizontal. |
| Captura HTTP real, loopback 18080 | 10 paquetes TCP, 1 login recuperado (`admin/admin123`, frame 4). |
| SHA-256 de evidencia HTTP y metadatos | Verificación correcta. |
| Plantilla HTTPS descomentada en copia temporal | `nginx -t` correcto; fuente del repositorio permanece comentada. |
| TLS 1.2 y TLS 1.3 | Handshake correcto, CA de prueba confiable y nombre `lab.test` verificado. |
| HTTPS sin confiar en la CA de prueba | curl rechazó el certificado, código 60. |
| POST HTTPS con CA validada | Login exitoso, usuario ficticio devuelto. |
| Captura HTTPS real, loopback 18443 | 31 paquetes TCP, 12 clasificados como TLS, 0 logins recuperados. |
| SHA-256 de evidencia HTTPS y metadatos | Verificación correcta. |
| Sintaxis Bash / compilación Python / sintaxis Ruby | Correctas. |
| `git diff --check` | Sin errores de espacios. |

Evidencia local de esta ejecución (excluida de Git): `evidence/validacion/`. Incluye PCAPNG, metadatos, hashes y capturas del portal. La primera adquisición HTTP detectó que el host no dispone del comando `hostname`: ese campo quedó vacío; se corrigió el script a `uname -n`, probado en la adquisición HTTPS. Los originales y sus hashes no se modificaron para ocultar esa limitación.

Hashes de los PCAPNG originales:

```text
HTTP  0d3ae370d4760aaa1f62a1b6c97b51998c8689b1372fcfc137cbe85c3fb46e3d
HTTPS d143aebbcb889ad4c0891ac99200c58cdd6800214c903f79e51d41e86579d81b
```

## Límites y pendientes para el grupo

- Validar instalación, firewalld y etiquetado SELinux en el Rocky real; Vagrant no se ejecutó aquí. La política de puertos/SELinux está documentada, pero no se afirma haberla comprobado en otra distribución.
- La comparación TLS se validó con curl/OpenSSL y captura real; las cinco pruebas de navegador se ejecutaron por HTTP. Repetir Playwright por HTTPS cuando el navegador del grupo confíe en su CA/dominio, sin omitir errores de certificado.
- No se conectó ninguna red ZeroTier ni se configuró SPAN físico. Esas comprobaciones dependen de los equipos del grupo.
- El workflow CI fue actualizado; su ejecución remota en GitHub queda pendiente. La construcción y las pruebas equivalentes sí se ejecutaron localmente.
- `npm audit` reportó 5 entradas de severidad alta en la cadena de dependencias **de desarrollo** `eslint-config-next → fast-glob/micromatch/braces` (denegación de servicio al procesar patrones profundamente anidados). No se aplicó el downgrade mayor propuesto automáticamente. No corresponde a una prueba de explotación de la aplicación. Revisar una actualización compatible antes de usar estas herramientas con entradas no confiables. [Aviso de braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
- Las etiquetas de imagen siguen una rama de versión y pueden cambiar. Para reproducir una entrega formal, registrar y fijar sus digests (`podman image inspect`) tras validar en Rocky.

Los resultados anteriores corresponden al entorno local indicado, no al informe final de los cuatro participantes. Utilizar [la plantilla forense](07-informe-forense.md) para sus propias adquisiciones.
