const WebSocket = require('ws');

const PORT = process.env.PORT || 3001;
const wss  = new WebSocket.Server({ port: PORT });

// games[gameId] = { players: [{ ws, playerId, playerNumber }] }
const games = new Map();

// ── Cleanup empty rooms every 5 minutes ──────────────────────────────────────
setInterval(() => {
  for (const [gameId, game] of games.entries()) {
    game.players = game.players.filter(p => p.ws.readyState === WebSocket.OPEN);
    if (game.players.length === 0) games.delete(gameId);
  }
}, 5 * 60 * 1000);

function send(ws, obj) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}

function broadcast(game, obj) {
  game.players.forEach(p => send(p.ws, obj));
}

// ── New connection ────────────────────────────────────────────────────────────
wss.on('connection', (ws, req) => {
  const url      = new URL(req.url, `ws://localhost:${PORT}`);
  const gameId   = url.searchParams.get('game');
  const playerId = url.searchParams.get('player');

  if (!gameId || !playerId) { ws.close(); return; }

  // Get or create game room
  if (!games.has(gameId)) games.set(gameId, { players: [] });
  const game = games.get(gameId);

  // Remove stale connections
  game.players = game.players.filter(p => p.ws.readyState === WebSocket.OPEN);

  // Reject if room is full (already 2 active players)
  if (game.players.length >= 2) {
    send(ws, { type: 'full', message: 'Game is full' });
    ws.close();
    return;
  }

  // Assign player number (1 = first to join, 2 = second)
  const playerNumber = game.players.length + 1;
  game.players.push({ ws, playerId, playerNumber });

  if (game.players.length === 1) {
    // First player – wait for opponent
    send(ws, { type: 'waiting', playerNumber: 1 });
    console.log(`[${gameId}] Player 1 joined – waiting for Player 2`);
  } else {
    // Second player joined – start game for both
    game.players.forEach(p => {
      send(p.ws, { type: 'start', playerNumber: p.playerNumber });
    });
    console.log(`[${gameId}] Player 2 joined – game started`);
  }

  // ── Messages from client ──────────────────────────────────────────────────
  ws.on('message', data => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }

    if (msg.type === 'move') {
      // Broadcast the full message to ALL players (including sender) so every
      // client applies it from the same server-confirmed payload.
      // This works for any game (dots-and-boxes, trains, etc.)
      broadcast(game, msg);
    }

    if (msg.type === 'reset') {
      broadcast(game, msg);
      console.log(`[${gameId}] Game reset`);
    }
  });

  // ── Disconnect ────────────────────────────────────────────────────────────
  ws.on('close', () => {
    game.players = game.players.filter(p => p.ws !== ws);
    console.log(`[${gameId}] Player ${playerNumber} disconnected`);

    // Notify remaining player
    game.players.forEach(p => {
      send(p.ws, { type: 'disconnect', message: 'Opponent disconnected' });
    });

    // Clean up empty room
    if (game.players.length === 0) games.delete(gameId);
  });
});

console.log(`✅ Dots and Boxes WebSocket server running on ws://localhost:${PORT}`);
