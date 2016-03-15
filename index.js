const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create application
const app = express();

// Configure application
app.use(cors());
app.use(bodyParser.json());

// API
app.use('/api', require('./api'));

// Start server
app.listen(3000);
console.log('Server started');
