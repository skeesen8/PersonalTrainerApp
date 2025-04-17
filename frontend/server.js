const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

console.log('Starting server...');
console.log('Port:', port);
console.log('Current directory:', __dirname);
console.log('Files in directory:', fs.readdirSync(__dirname));
console.log('Files in build directory:', fs.readdirSync(path.join(__dirname, 'build')));

const server = http.createServer((req, res) => {
    console.log('Received request:', req.method, req.url);

    if (req.url === '/_health') {
        console.log('Health check request received');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
    }

    // Serve static files from build directory
    let filePath = path.join(__dirname, 'build', req.url === '/' ? 'index.html' : req.url);
    
    console.log('Attempting to serve:', filePath);

    try {
        if (fs.existsSync(filePath)) {
            if (fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }
            const content = fs.readFileSync(filePath);
            res.writeHead(200);
            res.end(content);
        } else {
            // Fallback to index.html for client-side routing
            const content = fs.readFileSync(path.join(__dirname, 'build', 'index.html'));
            res.writeHead(200);
            res.end(content);
        }
    } catch (error) {
        console.error('Error serving file:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 