const express = require("express");

const router = express.Router();

const {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
} = require("../controllers/messageController");

const { protect } = require("../middleware/authMiddleware");

router.post("/:workspaceId", protect, sendMessage);

router.get("/:workspaceId", protect, getMessages);

router.put("/:id", protect, updateMessage);

router.delete("/:id", protect, deleteMessage);

module.exports = router;
