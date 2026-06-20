const express = require('express');
const path = require('path');
const app = express();

const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'example-nodejs-app'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Serve HTML file on homepage
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Metrics endpoint
app.get('/metrics', async function (req, res) {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
});

const server = app.listen(8000, function () {
    console.log("Application running on port: %s", server.address().port);
});
