let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!ioInstance) {
    console.warn('[Socket.IO] ioInstance not initialized yet');
  }
  return ioInstance;
};

const emitEvent = (eventName, data) => {
  if (ioInstance) {
    ioInstance.emit(eventName, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitEvent
};
