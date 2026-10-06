import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://forensics_user:supersecretpassword123@localhost:5432/forensics_db',
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
