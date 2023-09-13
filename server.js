const http = require('http');
const fs = require('fs');
const path = require('path');

// Main Website Server
const mainServer = http.createServer((req, res) => {
    let filePath = '.' + req.url;

    if (filePath === './') {
        filePath = './index.html';
    }

    if (filePath === './admin' || filePath.startsWith('./admin/')) {
        // Redirect to admin server on port 3001
        res.writeHead(302, { 'Location': 'http://localhost:3001/admin' });
        res.end();
        return;
    }

    if (!path.extname(filePath)) {
        // If the filePath has no extension, assume it's an HTML file
        filePath += '.html';
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Serve the custom 404 page
                const notFoundPath = './404.html';
                fs.readFile(notFoundPath, (err, notFoundContent) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Internal server error');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(notFoundContent, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Internal server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': getContentType(filePath) });
            res.end(content, 'utf-8');
        }
    });
});

const mainPort = 3000;
mainServer.listen(mainPort, () => {
    console.log(`Main server is running on http://localhost:${mainPort}`);
});

// Admin Section Server
const adminServer = http.createServer((req, res) => {
    if (req.url === '/') {
        // Redirect to main server on port 3000
        res.writeHead(302, { 'Location': 'http://localhost:3000/' });
        res.end();
        return;
    }

    let filePath = '.' + req.url;

    if (filePath === './admin') {
        filePath = './admin/index.html';
    } else {
        filePath = './admin' + req.url;
    }

    if (!path.extname(filePath)) {
        // If the filePath has no extension, assume it's an HTML file
        filePath += '.html';
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Internal server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': getContentType(filePath) });
            res.end(content, 'utf-8');
        }
    });
});

const adminPort = 3001;
adminServer.listen(adminPort, () => {
    console.log(`Admin server is running on http://localhost:${adminPort}`);
});

function getContentType(filePath) {
    const extname = path.extname(filePath);
    switch (extname) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'text/javascript';
        case '.png':
            return 'image/png';
        default:
            return 'application/octet-stream';
    }
}
