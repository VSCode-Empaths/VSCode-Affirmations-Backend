const express = require('express');
const cors = require('cors');
const app = express();

// Built in middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:5500',
      'https://error-affirmations.netlify.app/',
      'http://127.0.0.1:7890',
    ],
    credentials: true,
  })
);

// App routes
app.use('/api/v1/affirmations', require('./controllers/affirmations'));
app.use('/api/v1/categories', require('./controllers/categories'));

// Error handling & 404 middleware for when
// a request doesn't match any app routes
app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
