const express = require('express');
const cors    = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// ── VARIABLES DE ENTORNO ─────────────────────────────────────────
// Estas se configuran en Railway, no aquí directamente
const LIVEKIT_URL        = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY    = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const PORT               = process.env.PORT || 3000;

// ── HEALTH CHECK ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'REVEN Backend corriendo ✓' });
});

// ── GENERAR TOKEN DE LIVEKIT ─────────────────────────────────────
// El frontend llama a este endpoint para obtener un token
// antes de conectarse al live
app.post('/token', async (req, res) => {
  try {
    const { username, roomName, isPublisher } = req.body;

    if (!username || !roomName) {
      return res.status(400).json({ error: 'username y roomName son requeridos' });
    }

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: username,
      ttl: '4h', // Token válido por 4 horas
    });

    token.addGrant({
      roomJoin:     true,
      room:         roomName,
      canPublish:   isPublisher === true,  // Solo el jugador puede publicar
      canSubscribe: true,                  // Todos pueden ver
    });

    const jwt = await token.toJwt();

    res.json({
      token:    jwt,
      url:      LIVEKIT_URL,
      room:     roomName,
    });

  } catch (err) {
    console.error('Error generando token:', err);
    res.status(500).json({ error: 'Error al generar token' });
  }
});

// ── INICIAR LIVE (crea la sala) ──────────────────────────────────
app.post('/start-live', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'username requerido' });

  // El nombre de la sala es el username del jugador
  const roomName = `live-${username}`;

  res.json({ roomName, message: 'Sala lista' });
});

app.listen(PORT, () => {
  console.log(`REVEN Backend corriendo en puerto ${PORT}`);
});
