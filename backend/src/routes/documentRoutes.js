const express = require("express");

const router = express.Router();

const {
  createDocument,
  getDocuments,
  getDocumentById,
} = require("../controllers/documentController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createDocument);

router.get("/workspace/:workspaceId", protect, getDocuments);

router.get("/:id", protect, getDocumentById);

module.exports = router;
