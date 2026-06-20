const Workspace = require("../models/Workspace");

const createWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.create({
      name: req.body.name,

      owner: req.user._id,

      members: [req.user._id],
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      members: req.user._id,
    })
      .populate("owner", "name email")
      .populate("members", "name email");

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const joinWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const alreadyMember = workspace.members.includes(req.user._id);

    if (alreadyMember) {
      return res.status(400).json({
        message: "Already a member",
      });
    }

    workspace.members.push(req.user._id);

    await workspace.save();

    res.json(workspace);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only owner can delete workspace",
      });
    }

    await workspace.deleteOne();

    res.json({
      message: "Workspace deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only owner can update workspace",
      });
    }

    workspace.name = req.body.name;

    await workspace.save();

    res.json(workspace);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  joinWorkspace,
  deleteWorkspace,
  updateWorkspace,
};
