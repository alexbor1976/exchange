const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Helper function to broadcast message to all connected clients
function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Helper function to get a client's IP address
function getClientIp(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return ip.includes('::') ? '[Localhost or IPv6]' : ip;  // Simplified IP address formatting
}

// Generate a message for connection or disconnection events
function generateClientEventMessage(type, ip) {
  return JSON.stringify({
    type,
    message: `Client ${type}`,
    ip,
    totalClients: wss.clients.size,
    timestamp: new Date().toLocaleString(),
  });
}

wss.on('connection', (ws, req) => {
  const clientIp = getClientIp(req);

  // Broadcast client connection event
  broadcast(generateClientEventMessage('connected', clientIp));

  ws.on('message', (message) => {
    // Broadcast the received message to all clients (common log)
    broadcast(message);
  });

  ws.on('close', () => {
    // Broadcast client disconnection event
    broadcast(generateClientEventMessage('disconnected', clientIp));
  });
});

console.log('WebSocket server running on ws://localhost:8080');
