import jsonwebtoken from 'jsonwebtoken';
import chatModel from '../models/chats.js';

const usersSockets = new Map();

export const initializeWebSockets = (io) => {
  io.use((socket, next) => {
    const { authToken } = socket.handshake.auth;

    if (!authToken) {
      return next(new Error('No autorizado: authToken es requerido'));
    }

    try {
      const userData = jsonwebtoken.verify(
        authToken,
        process.env.ACCESS_TOKEN_SECRET
      );
      socket.userId = userData.id;
      next();
    } catch (err) {
      return next(new Error('Token inválido o expirado'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    if (!usersSockets.has(userId)) {
      usersSockets.set(userId, []);
    }

    usersSockets.get(userId).push(socket);

    console.log(`Usuario conectado: userId=${userId}, socketId=${socket.id}`);

    // Manejo de eventos
    socket.on('message', (msg) => {
      console.log(`Mensaje recibido de userId=${userId}: ${msg}`);
      socket.emit('message', `Reenvio por parte del servidor: ${msg}`);
    });

    socket.on('privateMessage', async ({ message }) => {
      const toUserId = message.receiverId;
      
      console.log(
        `Mensaje privado de ${socket.userId} a ${toUserId}: ${message}`
      );

      await sendMessageToUser(io, toUserId, message);
    });

    socket.on('disconnect', () => {
      console.log(
        `Usuario desconectado: userId=${userId}, socketId=${socket.id}`
      );
      const sockets = usersSockets.get(userId) || [];
      usersSockets.set(
        userId,
        sockets.filter((s) => s.id !== socket.id)
      );

      if (usersSockets.get(userId).length === 0) {
        usersSockets.delete(userId);
      }
    });
  });
};

const sendMessageToUser = async (io, userId, message) => {

  const sockets = usersSockets.get(String(userId)) || [];
  sockets.forEach((socket) => {
    socket.emit('message', message);
    socket.emit('notification', 'Tienes un nuevo mensaje');
  });
};
