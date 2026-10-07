# Portal del laboratorio

Next.js con Tailwind CSS compilado localmente. `POST /api/login` valida las cuentas ficticias de PostgreSQL; `GET /api/health` comprueba conectividad con la base. No emite sesiones. Variables de conexión: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`.

El despliegue se hace desde la raíz con Podman Compose; ver [`doscs`](../doscs/README.md). Para desarrollo local, Node.js 22, `npm ci`, configurar las variables PG contra una base de pruebas y ejecutar `npm run dev`. `npm run lint` y `npm run build` verifican el código.
