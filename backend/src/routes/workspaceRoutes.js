const express = require("express");

const router = express.Router();

const { createWorkspace } = require("../controllers/workspaceController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createWorkspace);

module.exports = router;
