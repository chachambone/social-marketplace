import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface WebSocketMessage {
  type: 'message' | 'bid';
  itemId: string;
  senderId: string;
  senderName: string;
  content?: string;
  bidAmount?: number;
  timestamp: string;
}

interface Client {
  ws: WebSocket;
  itemId: string;
  userId: string;
}

const clients: Client[] = [];

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const itemId = url.searchParams.get('itemId');
    const userId = url.searchParams.get('userId');
    
    if (!itemId || !userId) {
      ws.close();
      return;
    }
    
    console.log(`🔌 WebSocket connected: User ${userId} on Item ${itemId}`);
    
    // Add client to room
    clients.push({ ws, itemId, userId });
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'system',
      content: 'Connected to chat room',
      timestamp: new Date().toISOString()
    }));
    
    ws.on('message', (data: string) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        console.log(`📨 Received: ${message.type} from ${message.senderName}`);
        
        // Broadcast to all clients in the same item room
        clients.forEach(client => {
          if (client.itemId === itemId && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log(`🔌 WebSocket disconnected: User ${userId} on Item ${itemId}`);
      const index = clients.findIndex(c => c.ws === ws);
      if (index !== -1) clients.splice(index, 1);
    });
  });
  
  console.log('✅ WebSocket server initialized');
  
  return wss;
}