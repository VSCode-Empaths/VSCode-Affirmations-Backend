const dns = require('dns');
const path = require('path');
const dotenv = require('dotenv');

// Avoid IPv6 EHOSTUNREACH to some cloud Postgres hosts (e.g. Supabase) on some networks
dns.setDefaultResultOrder('ipv4first');

const root = path.join(__dirname, '..');
// Never override real deploy env (Fly, etc.); a stray empty key in a local file could wipe secrets.
const safe = { override: false };
dotenv.config({ path: path.join(root, '.env'), ...safe });
dotenv.config({ path: path.join(root, '.env.local'), ...safe });

if (process.env.NODE_ENV === 'production') {
  const miss = ['JWT_SECRET', 'COOKIE_NAME', 'DATABASE_URL'].filter(
    (k) => !process.env[k] || String(process.env[k]).trim() === ''
  );
  if (miss.length) {
    throw new Error(
      `Missing or empty required env in production: ${miss.join(', ')}`
    );
  }
}
