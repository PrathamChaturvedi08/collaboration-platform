const express = require("express");

const router = express.Router();

const {
  createWorkspace,
  getWorkspaces,
  joinWorkspace,
  deleteWorkspace,
  updateWorkspace,
} = require("../controllers/workspaceController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createWorkspace);

router.get("/", protect, getWorkspaces);

router.post("/:id/join", protect, joinWorkspace);

router.put("/:id", protect, updateWorkspace);

router.delete("/:id", protect, deleteWorkspace);

module.exports = router;
