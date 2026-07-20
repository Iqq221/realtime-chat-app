const Conversation = require("../models/Conversation");

const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: {
        $all: [req.user.id, receiverId],
      },
    });

    if (conversation) {
      return res.status(200).json({
        success: true,
        conversation,
      });
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user.id, receiverId],
    });

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
    }).populate("participants", "-password");

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
