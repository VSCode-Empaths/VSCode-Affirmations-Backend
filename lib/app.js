const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');

// Netlify uses extra hostnames (branch / deploy preview) with a different Origin than the bare *.netlify.app site.
// Branch subdomain: no leading/trailing hyphen in the deploy-preview label
const NETLIFY_V2 =
  /^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?--error-affirmations-v2\.netlify\.app$/i;
const NETLIFY_V2_PROD = /^https:\/\/error-affirmations-v2\.netlify\.app$/i;
const LOCALHOST = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function isAllowedCorsOrigin(origin) {
  if (origin == null || origin === '') return true; // same-origin, curl, health checks
  if (NETLIFY_V2_PROD.test(origin) || NETLIFY_V2.test(origin)) return true;
  if (LOCALHOST.test(origin)) return true;
  const extras = new Set([
    'https://error-affirmations.netlify.app',
    'https://error-affirmations-api.fly.dev',
  ]);
  return extras.has(origin);
}

// Built in middleware
app.use(express.json());
app.use(cookieParser());

// No DB — for load balancers and Fly health checks
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});
app.use(
  cors({
    origin: (reqOrigin, cb) => {
      if (isAllowedCorsOrigin(reqOrigin)) {
        return cb(null, true);
      }
      cb(null, false);
    },
    credentials: true,
  })
);

// App routes
app.use('/api/v1/affirmations', require('./controllers/affirmations'));
app.use('/api/v1/categories', require('./controllers/categories'));
app.use('/api/v1/users', require('./controllers/users'));
app.use('/api/v1/github', require('./controllers/github'));

// Error handling & 404 middleware for when
// a request doesn't match any app routes
app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
