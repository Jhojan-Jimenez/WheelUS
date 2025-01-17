import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { authCookieJWT } from '../middlewares/authCookieJWT.js';
import authRouter from '../routes/auth.js';
import rideRouter from '../routes/rides.js';
import vehicleRouter from '../routes/vehicles.js';
import userRouter from '../routes/users.js';
import cors from 'cors';
import { initializeWebSockets } from '../middlewares/webSockets.js';
import chatRouter from '../routes/chats.js';

const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No autorizado por política CORS'));
      }
    },
    credentials: true,
  },
});

initializeWebSockets(io);

const port = 5000;
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No autorizado por política CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use('/auth', authRouter);
app.use('/user', authCookieJWT, userRouter);
app.use('/ride', authCookieJWT, rideRouter);
app.use('/vehicle', authCookieJWT, vehicleRouter);
app.use('/chat', authCookieJWT, chatRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Esta ruta no existe' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message_error: err.message || 'Error interno del servidor',
  });
});

httpServer.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

export default app;
