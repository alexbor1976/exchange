const port = 8080

const WebSocket = require('ws');


class WebSocketServer {
  constructor(port = 8080) {
    this.wss = new WebSocket.Server({ port });
    console.log(`WebSocket server running on ws://localhost:${port}`);
    
    this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));
  }

  // Handle a new client connection
  handleConnection(ws, req) {
    const clientIp = this.getClientIp(req);

    // Broadcast client connection event
    this.broadcast(this.generateClientEventMessage('connected', clientIp));

    // Handle incoming messages
    ws.on('message', message => this.broadcast(message));

    // Handle client disconnection
    ws.on('close', () => {
      this.broadcast(this.generateClientEventMessage('disconnected', clientIp));
    });
  }

  // Broadcast message to all connected clients
  broadcast(message) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Retrieve the client's IP address
  getClientIp(req) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return ip.includes('::') ? '[Localhost or IPv6]' : ip;
  }

  // Generate connection or disconnection event message
  generateClientEventMessage(type, ip) {
    return JSON.stringify({
      type,
      message: `Client ${type}`,
      ip,
      totalClients: this.wss.clients.size,
      timestamp: new Date().toLocaleString(),
    });
  }

  
}

// Instantiate the WebSocket server
new WebSocketServer(port);
