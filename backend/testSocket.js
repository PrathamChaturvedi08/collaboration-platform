const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const workspaceId =
  "6a3567c17b4d46c0b05aa916";

socket.on("connect", () => {

  console.log(
    "Connected:",
    socket.id
  );

  socket.emit(
    "join-workspace",
    workspaceId
  );
});

socket.on(
  "new-message",
  (message) => {

    console.log(
      "\nNEW MESSAGE:"
    );

    console.log(message);
  }
);