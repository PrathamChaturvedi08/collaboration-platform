const { Server } = require("socket.io");

let io;

const onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("user-online", (userId) => {
      onlineUsers.set(socket.id, userId);

      io.emit("online-users", Array.from(onlineUsers.values()));
    });

    socket.on("join-workspace", (workspaceId) => {
      socket.join(workspaceId);

      console.log(`Socket ${socket.id} joined workspace ${workspaceId}`);
    });

    socket.on("typing", ({ workspaceId, user }) => {
      socket.to(workspaceId).emit("user-typing", user);
    });

    socket.on("join-document", (documentId) => {
      socket.join(documentId);

      console.log(`Socket ${socket.id} joined document ${documentId}`);
    });

    socket.on("document-change", ({ documentId, content }) => {
      socket.to(documentId).emit("receive-document-change", content);
    });

    socket.on("message-edited", ({ workspaceId, message }) => {
      socket.to(workspaceId).emit("receive-message-edit", message);
    });

    socket.on("message-deleted", ({ workspaceId, messageId }) => {
      socket.to(workspaceId).emit("receive-message-delete", messageId);
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);

      io.emit("online-users", Array.from(onlineUsers.values()));

      console.log("User Disconnected:", socket.id);
    });
  });
};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO,
};
