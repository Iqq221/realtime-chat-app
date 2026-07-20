const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    // Exclude logged-in user
    const users = await User.find({
      _id: { $ne: req.user.id },
    }).select("-password");

    res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
};