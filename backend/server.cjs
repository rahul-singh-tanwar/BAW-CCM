// server.js
const express = require('express');
const app = express();
const port = 3005;

// Middleware to parse JSON requests (if needed)
app.use(express.json());

// Simple GET endpoint for Hello World
app.get('/hello', (req, res) => {
  res.json({
    message: 'Hello World from Node.js REST API for IBM BAW!'
  });
});

// Optional: a POST endpoint to echo request data
app.post('/hello', (req, res) => {
  const name = req.body.name || 'World';
  res.json({
    message: `Hello ${name}, from Node.js REST API for IBM BAW!`
  });
});

app.listen(port, () => {
  console.log(`Hello World API listening at http://localhost:${port}`);
});
