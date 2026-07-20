const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, image } = req.body;

    // Validate message
    if (!text?.trim() && !image) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if logged-in user is part of the conversation
    if (
      !conversation.participants.some(
        (participant) => participant.toString() === req.user.id
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text,
      image,
    });

    // Update last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    res.status(201).json({
      success: true,
      message,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    // Check if conversation exists
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if logged-in user is part of the conversation
    if (
      !conversation.participants.some(
        (participant) => participant.toString() === req.user.id
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};