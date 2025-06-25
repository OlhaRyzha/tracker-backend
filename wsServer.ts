import { WebSocketServer, WebSocket } from 'ws';
import { getTracks } from './src/utils/db';

const WS_PORT = 4000;

const wss = new WebSocketServer({ port: WS_PORT }, () => {
  console.log(`🟢 WS server listening on ws://localhost:${WS_PORT}`);
});

let clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  console.log('➕ New WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('➖ Client disconnected');
    clients.delete(ws);
  });
});

async function sendRandomTrack() {
  const { tracks } = await getTracks({ page: 1, limit: 100 });

  if (tracks.length === 0) return;

  const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
  
  const msg = JSON.stringify({ type: 'ACTIVE_TRACK', payload: randomTrack });

  for (const client of clients) {
    if (client.readyState === client.OPEN) client.send(msg);
  }
}

setInterval(sendRandomTrack, Math.random() * 2000 + 3000); 
