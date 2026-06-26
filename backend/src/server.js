const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const { initSocket } = require("./socket/socket");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const messageRoutes = require("./routes/messageRoutes");
const documentRoutes = require("./routes/documentRoutes");

dotenv.config();
connectDB();
const app = express();
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "CollabSpace API",
    version: "1.0.0",
    status: "Running",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/documents", documentRoutes);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
