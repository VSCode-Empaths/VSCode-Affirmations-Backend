const express = require('express');

const app = express();

// Built in middleware
app.use(express.json());

// App routes
console.log('before the route');

app.use('/affirmations', require('./controllers/affirmations'));
console.log('after the route');
// Error handling & 404 middleware for when
// a request doesn't match any app routes
app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
