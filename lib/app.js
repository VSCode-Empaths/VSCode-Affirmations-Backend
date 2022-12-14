const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');

// Built in middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5500', 'https://error-affirmations.netlify.app'],
    credentials: true,
  })
);

// App routes
app.use('/api/v1/affirmations', require('./controllers/affirmations'));
app.use('/api/v1/categories', require('./controllers/categories'));
app.use('/api/v1/users', require('./controllers/users'));

// Error handling & 404 middleware for when
// a request doesn't match any app routes
app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
