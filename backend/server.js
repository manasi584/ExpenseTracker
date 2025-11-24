const express = require('express');
const app = express();

// add request logging middleware
const requestLogger = require('./middleware/requestLogger');
app.use(requestLogger);

// ...existing code that sets up routes and starts the server...