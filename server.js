// to run the server open the terminal and type node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif'
  // Add more MIME types as needed
};

// Create a server instance
const server = http.createServer((req, res) => {
  // Redirect /admin to /admin/index.html
  if (req.url === '/admin') {
    res.writeHead(302, { 'Location': '/admin' });
    res.end();
    return;
  }

  const filePath = path.join(__dirname, req.url);

  // Redirect root URL to index.html
  if (req.url === '/') {
    res.writeHead(302, { 'Location': '/index.html' });
    res.end();
    return;
  }

  fs.exists(filePath, exists => {
    if (exists) {
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          // Redirect to 404.html if file not found
          fs.readFile(path.join(__dirname, '404.html'), (err404, data404) => {
            if (err404) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Internal Server Error');
            } else {
              res.writeHead(404, { 'Content-Type': 'text/html' });
              res.end(data404);
            }
          });
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    } else {
      // Redirect to 404.html if file not found
      fs.readFile(path.join(__dirname, '404.html'), (err404, data404) => {
        if (err404) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(data404);
        }
      });
    }
  });
});

// Listen on port 3000 and localhost
server.listen(3000, 'localhost', () => {
  console.log('Server is listening on http://localhost:3000');
});