const express = require("express");

const router = express.Router();

const {
  createWorkspace,
  getWorkspaces,
  joinWorkspace,
} = require("../controllers/workspaceController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createWorkspace);

router.get("/", protect, getWorkspaces);

router.post("/:id/join", protect, joinWorkspace);

module.exports = router;
