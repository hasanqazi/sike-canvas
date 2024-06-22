const express = require('express');
const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

const app = express();

// Certificate
const privateKey = fs.readFileSync('/path/to/your/private.key', 'utf8');
const certificate = fs.readFileSync('/path/to/your/certificate.crt', 'utf8');
const ca = fs.readFileSync('/path/to/your/ca_bundle.crt', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const httpsServer = https.createServer(credentials, app);
const wss = new WebSocket.Server({ server: httpsServer });

app.use(express.static('public'));

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => {
        console.log('Received:', message);
        try {
            const parsedMessage = JSON.parse(message);
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

httpsServer.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
