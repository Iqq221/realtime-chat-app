const express = require("express");
const { sendMessage, getMessages, markAsSeen } = require("../controllers/messageController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", protect, upload.single("image"), sendMessage);
router.get("/:conversationId", protect, getMessages);
router.put("/seen/:conversationId", protect, markAsSeen);

module.exports = router;