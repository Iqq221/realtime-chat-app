const mongoose = require("mongoose");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, receiverId } = req.body;
    let imagePath = "";

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    let conversation;

    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation && receiverId) {
      conversation = await Conversation.findOne({
        participants: { $all: [req.user.id, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user.id, receiverId],
        });
      }
    }

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found and recipient not specified",
      });
    }

    if (!text?.trim() && !imagePath) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      text: text ? text.trim() : "",
      image: imagePath,
    });

    // Update conversation lastMessage
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    // Populate sender info for frontend rendering
    const populatedMessage = await Message.findById(message._id).populate("sender", "name email profilePic");

    // Real-time socket emissions
    const globalIo = req.app.get("io");
    if (globalIo) {
      const convIdStr = conversation._id.toString();
      const currentUserIdStr = req.user.id.toString();

      // Emit to conversation room
      globalIo.to(convIdStr).emit("newMessage", populatedMessage);

      // Emit to recipient's personal user room
      const receiverIdToNotify = conversation.participants.find((p) => {
        const pIdStr = p._id ? p._id.toString() : p.toString();
        return pIdStr !== currentUserIdStr;
      });

      if (receiverIdToNotify) {
        const receiverIdStr = receiverIdToNotify._id ? receiverIdToNotify._id.toString() : receiverIdToNotify.toString();
        globalIo.to(receiverIdStr).emit("newMessage", populatedMessage);
        console.log(`📡 Emitted newMessage to conversation room (${convIdStr}) & user room (${receiverIdStr})`);
      }
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversationId: conversation._id,
    });

  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const currentUserIdStr = req.user.id.toString();
    if (
      !conversation.participants.some(
        (participant) => (participant._id ? participant._id.toString() : participant.toString()) === currentUserIdStr
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name email profilePic")
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

const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user.id },
        seen: false,
      },
      { $set: { seen: true } }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as seen",
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
  markAsSeen,
};