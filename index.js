const express = require('express');
const bodyParser = require('body-parser');
const onoff = require('onoff');

// Create application
const app = express();

// Configure application
app.use(bodyParser.json());

// Serve web app
app.use(express.static('web'));

// API
app.use('/api', require('./api'));

// Start server
app.listen(3000);
console.log('Server started');
