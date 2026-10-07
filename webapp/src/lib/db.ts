import { Pool } from 'pg';

// pg consume PGHOST, PGPORT, PGUSER, PGPASSWORD y PGDATABASE de Compose.
const pool = new Pool({ max: 5, connectionTimeoutMillis: 3000, idleTimeoutMillis: 10000 });
pool.on('error', () => console.error('Conexión PostgreSQL inactiva interrumpida'));

export const query = (text: string, params?: unknown[]) => pool.query(text, params);
