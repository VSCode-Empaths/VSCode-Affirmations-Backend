const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
// Supabase and most cloud Postgres require TLS. Local dev can omit.
const needsSsl = Boolean(
  process.env.PGSSLMODE ||
    (connectionString &&
      /supabase\.co|sslmode=require/i.test(connectionString))
);

const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => console.info('🐘 Postgres connected'));

module.exports = pool;
