const User = require("../models/userModel");

exports.signup = async (req, res) => {
  try {
    const { phone_Number, displayName, profileImage, email } = req.body;

    const user = await User.create({
      phone_Number,
      displayName,
      email,
      profileImage,
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone_Number, email } = req.body;


    let query = {};
    if (phone_Number) {
      query.phone_Number = phone_Number;
    }
    if (email) {
      query.email = email;
    }

    const user = await User.findOneAndUpdate(
      query,
      { last_logged_in: new Date() },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.signUpWithEmail = async (req, res) => {
  try {
    const { phone_Number, displayName, profileImage, email } = req.body;

    const user = await User.create({
      phone_Number,
      displayName,
      email,
      profileImage,
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.loginWithEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate(
      { phone_Number },
      { last_logged_in: new Date() },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
