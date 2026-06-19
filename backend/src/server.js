const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const http = require("http");

const { initSocket } = require("./socket/socket");

const cors = require("cors");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/workspaces", require("./routes/workspaceRoutes"));

app.use("/api/messages", require("./routes/messageRoutes"));

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
