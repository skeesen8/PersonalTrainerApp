const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, 'build');

// Simple MIME type mapping
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/_health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
    }

    // Handle static files
    let filePath = path.join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    
    try {
        if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
            const content = fs.readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
            res.end(content);
        } else {
            // Serve index.html for client-side routing
            const content = fs.readFileSync(path.join(BUILD_DIR, 'index.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        }
    } catch (error) {
        console.error('Error serving file:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
}); 