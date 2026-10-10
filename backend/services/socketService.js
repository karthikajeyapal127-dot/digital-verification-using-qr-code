let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId.toString()}`);
      }
    });

    socket.on('join-room', (room) => {
      if (room) {
        socket.join(room);
      }
    });

    socket.on('ping:check', () => {
      socket.emit('pong:check', { timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      // client disconnected cleanly
    });
  });

  return ioInstance;
};

export const getIO = () => ioInstance;

export const emitVerificationEvent = (verificationRecord) => {
  if (ioInstance) {
    ioInstance.emit('verification:new', verificationRecord);
    ioInstance.emit('verification:event', verificationRecord);
    ioInstance.emit('dashboard:refresh');
  }
};

export const emitDigitalIDEvent = (event, digitalId) => {
  if (ioInstance) {
    ioInstance.emit(`digitalId:${event}`, digitalId);
    ioInstance.emit(`digital_id:${event}`, digitalId);
    ioInstance.emit('dashboard:refresh');
  }
};

export const emitCredentialEvent = (event, credential) => {
  if (ioInstance) {
    ioInstance.emit(`credential:${event}`, credential);
    ioInstance.emit('dashboard:refresh');
  }
};

export const emitNotificationEvent = (notification) => {
  if (ioInstance) {
    if (notification.userId) {
      ioInstance.to(`user:${notification.userId.toString()}`).emit('notification:new', notification);
      ioInstance.to(`user:${notification.userId.toString()}`).emit('notification', notification);
    }
    ioInstance.emit('notification:broadcast', notification);
    ioInstance.emit('notification', notification);
  }
};
