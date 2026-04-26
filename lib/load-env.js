const dns = require('dns');
const path = require('path');
const dotenv = require('dotenv');

// Avoid IPv6 EHOSTUNREACH to some cloud Postgres hosts (e.g. Supabase) on some networks
dns.setDefaultResultOrder('ipv4first');

const root = path.join(__dirname, '..');
dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local') });
