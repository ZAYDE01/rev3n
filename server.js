
bash

cat /home/claude/reven-backend/server.js
Salida

const express = require('express');
const cors    = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const app = express();

// Permitir cualquier origen (Netlify, celular, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET','POST','OPTIONS'],
}));
app.options('*', cors());
app.use(express.json());

const LIVEKIT_URL        = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY    = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const PORT               = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ status: 'REVEN Backend corriendo ✓' });
});

app.post('/token', async (req, res) => {
  try {
    const { username, roomName, isPublisher } = req.body;
    if (!username || !roomName) {
      return res.status(400).json({ error: 'username y roomName son requeridos' });
    }

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: username,
      ttl: '4h',
    });

    token.addGrant({
      roomJoin:     true,
      room:         roomName,
      canPublish:   isPublisher === true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    res.json({ token: jwt, url: LIVEKIT_URL, room: roomName });

  } catch (err) {
    console.error('Error generando token:', err);
    res.status(500).json({ error: 'Error al generar token' });
  }
});

app.post('/start-live', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'username requerido' });
  const roomName = `live-${username}`;
  res.json({ roomName, message: 'Sala lista' });
});

app.listen(PORT, () => {
  console.log(`REVEN Backend corriendo en puerto ${PORT}`);
});
