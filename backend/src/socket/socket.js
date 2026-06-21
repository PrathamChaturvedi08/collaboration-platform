const { Server } = require("socket.io");

let io;

const onlineUsers = new Map();

const documentEditors = {};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("user-online", (userId) => {
      onlineUsers.set(socket.id, userId);

      io.emit("online-users", Array.from(onlineUsers.values()));
    });

    socket.on("join-workspace", (workspaceId) => {
      socket.join(workspaceId);
    });

    socket.on("join-document", ({ documentId, user }) => {
      socket.join(documentId);

      if (!documentEditors[documentId]) {
        documentEditors[documentId] = [];
      }

      const exists = documentEditors[documentId].find(
        (editor) => editor._id === user._id,
      );

      if (!exists) {
        documentEditors[documentId].push({
          ...user,
          socketId: socket.id,
        });
      }

      io.to(documentId).emit("active-editors", documentEditors[documentId]);
    });

    socket.on("leave-document", (documentId) => {
      if (!documentEditors[documentId]) return;

      documentEditors[documentId] = documentEditors[documentId].filter(
        (editor) => editor.socketId !== socket.id,
      );

      io.to(documentId).emit("active-editors", documentEditors[documentId]);

      socket.leave(documentId);
    });

    socket.on("typing", ({ workspaceId, user }) => {
      socket.to(workspaceId).emit("user-typing", user);
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
      for (const documentId in documentEditors) {
        documentEditors[documentId] = documentEditors[documentId].filter(
          (editor) => editor.socketId !== socket.id,
        );

        io.to(documentId).emit("active-editors", documentEditors[documentId]);
      }

      onlineUsers.delete(socket.id);

      io.emit("online-users", Array.from(onlineUsers.values()));
    });
  });
};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO,
};
