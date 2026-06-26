const express = require("express");

const router = express.Router();

const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  renameDocument,
  deleteDocument,
} = require("../controllers/documentController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createDocument);
router.get("/workspace/:workspaceId", protect, getDocuments);
router.get("/:id", protect, getDocumentById);
router.put("/:id", protect, updateDocument);
router.put("/:id/rename", protect, renameDocument);
router.delete("/:id", protect, deleteDocument);

module.exports = router;
