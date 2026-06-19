const Workspace = require("../models/Workspace");

const createWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.create({
      name: req.body.name,

      owner: req.user.userId,

      members: [req.user.userId],
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
      members: req.user.userId,
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

const joinWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const alreadyMember = workspace.members.includes(req.user.userId);

    if (alreadyMember) {
      return res.status(400).json({
        message: "Already a member",
      });
    }

    workspace.members.push(req.user.userId);

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
  joinWorkspace,
};
