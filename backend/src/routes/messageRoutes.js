const express = require("express");

const router = express.Router();

const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

const { protect } = require("../middleware/authMiddleware");

router.post("/:workspaceId", protect, sendMessage);

router.get("/:workspaceId", protect, getMessages);

module.exports = router;
