const Document = require("../models/Document");
const Workspace = require("../models/Workspace");

const createDocument = async (req, res) => {
  try {
    if (!req.body.title?.trim()) {
      return res.status(400).json({
        message: "Document title is required",
      });
    }

    const workspace = await Workspace.findById(req.body.workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        message: "Not a workspace member",
      });
    }

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
    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        message: "Not a workspace member",
      });
    }

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

    const workspace = await Workspace.findById(document.workspace);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        message: "Not a workspace member",
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

    const workspace = await Workspace.findById(document.workspace);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        message: "Not a workspace member",
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

const renameDocument = async (req, res) => {
  try {
    if (!req.body.title?.trim()) {
      return res.status(400).json({
        message: "Document title is required",
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const workspace = await Workspace.findById(document.workspace);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only workspace owner can rename documents",
      });
    }

    document.title = req.body.title;

    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const workspace = await Workspace.findById(document.workspace);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only workspace owner can delete documents",
      });
    }

    await document.deleteOne();

    res.json({
      message: "Document deleted",
    });
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
  renameDocument,
  deleteDocument,
};
