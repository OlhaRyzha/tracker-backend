import fastify from 'fastify';
import { WebSocketServer, WebSocket } from 'ws';
import { getTracks } from './utils/db';

const PORT = Number(process.env.PORT) || 8000;

const app = fastify();

app.get('/api/health', async () => {
  return { status: 'ok' };
});

const wss = new WebSocketServer({ noServer: true });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  console.log('➕ WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('➖ Client disconnected');
    clients.delete(ws);
  });
});

app.server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

async function sendRandomTrack() {
  const { tracks } = await getTracks({ page: 1, limit: 100 });
  if (!tracks.length) return;

  const track = tracks[Math.floor(Math.random() * tracks.length)];
  const message = JSON.stringify({ type: 'ACTIVE_TRACK', payload: track });

  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}

setInterval(sendRandomTrack, Math.random() * 2000 + 3000);

app.listen({ port: PORT }, (err) => {
  if (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`🟢 WS server listening on ws://localhost:${PORT}/ws`);
});
