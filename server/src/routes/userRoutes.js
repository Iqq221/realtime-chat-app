const express = require("express");
const { getUsers, updateProfile } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", protect, getUsers);
router.put("/profile", protect, upload.single("profilePic"), updateProfile);

module.exports = router;