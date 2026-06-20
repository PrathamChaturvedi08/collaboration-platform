const express = require("express");

const router = express.Router();

const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
} = require("../controllers/documentController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createDocument);

router.get("/workspace/:workspaceId", protect, getDocuments);

router.get("/:id", protect, getDocumentById);

router.put("/:id", protect, updateDocument);

module.exports = router;
