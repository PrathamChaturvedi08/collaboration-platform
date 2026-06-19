const Message = require("../models/Message");
const Workspace = require("../models/Workspace");

const sendMessage = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.includes(req.user.userId);

    if (!isMember) {
      return res.status(403).json({
        message: "Not a workspace member",
      });
    }

    const message = await Message.create({
      workspace: workspace._id,
      sender: req.user.userId,
      content: req.body.content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.includes(req.user.userId);

    if (!isMember) {
      return res.status(403).json({
        message: "Not a workspace member",
      });
    }

    const messages = await Message.find({
      workspace: req.params.workspaceId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
