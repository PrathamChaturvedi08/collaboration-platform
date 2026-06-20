const Document = require("../models/Document");

const createDocument = async (req, res) => {
  try {
    const document = await Document.create({
      title: req.body.title,
      workspace: req.body.workspaceId,
      createdBy: req.user._id,
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      workspace: req.params.workspaceId,
    })
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    document.content = req.body.content;

    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
};
