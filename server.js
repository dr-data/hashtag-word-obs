const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

// Create express app and server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);
    
    // Send current state to new client
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to server'
    }));

    // Handle client messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message from client:', data);

            if (data.type === 'test') {
                // Broadcast test message to all clients
                const testMessage = JSON.stringify({
                    type: 'ready',
                    timestamp: Date.now()
                });
                
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(testMessage);
                    }
                });
            }
            
            if (data.type === 'reset') {
                // Broadcast reset to all clients
                const resetMessage = JSON.stringify({ type: 'reset' });
                
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(resetMessage);
                    }
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

// Webhook endpoint for Social Stream Ninja
app.post('/webhook', (req, res) => {
    try {
        console.log('Received webhook:', req.body);
        const message = req.body;

        if (message.chatmessage && message.chatmessage.toLowerCase() === 'ready') {
            // Broadcast to all connected clients
            const broadcastMessage = JSON.stringify({
                type: 'ready',
                timestamp: Date.now(),
                user: message.chatname || 'anonymous'
            });

            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastMessage);
                }
            });

            res.status(200).json({
                status: 'success',
                message: 'Ready command processed'
            });
        } else {
            res.status(200).json({
                status: 'ignored',
                message: 'Message did not contain ready command'
            });
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server is ready`);
});