const Conversation = require("../models/Conversation");

const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [req.user.id, receiverId],
      },
    })
      .populate("participants", "-password")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name profilePic" },
      });

    if (conversation) {
      return res.status(200).json({
        success: true,
        conversation,
      });
    }

    conversation = await Conversation.create({
      participants: [req.user.id, receiverId],
    });

    conversation = await Conversation.findById(conversation._id).populate(
      "participants",
      "-password"
    );

    res.status(201).json({
      success: true,
      conversation,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("participants", "-password")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name profilePic" },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
};
