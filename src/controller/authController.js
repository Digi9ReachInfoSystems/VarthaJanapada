const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

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

exports.signupWithEmail = async (req, res) => {
  try {
    const { displayName, profileImage, email } = req.body;

    const user = await User.create({
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

    // if (!phone_Number) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Either phone number or email must be provided",
    //   });
    // }

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
    const { displayName, profileImage, email } = req.body;

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

exports.createUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

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
exports.loginWithUserRole = async (req, res) => {
  try {
    const { phone_Number, email } = req.body;

    let query = {};
    if (phone_Number) {
      query.phone_Number = phone_Number;
    }
    if (email) {
      query.email = email;
    }

    const user = await User.findOne(query);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create the JWT token with role
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role, // Include the role in the token
      },
      process.env.JWT_SECRET, // Make sure to store this secret safely
      { expiresIn: "1h" }
    );

    // Send the token in the response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      token, // Send the token to the client
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.createUserWithRole = async (req, res) => {
  try {
    const { phone_Number, displayName, profileImage, email, role } = req.body;

    // Validate the role (Optional: You can add more validation for roles)
    const validRoles = ["admin", "moderator", "content"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Available roles are admin, moderator, and content.",
      });
    }

    // Create a new user with the provided role
    const user = await User.create({
      phone_Number,
      displayName,
      email,
      profileImage,
      role, // Assign role to the user
    });

    // Create the JWT token with the user details and role
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role, // Include the role in the token
      },
      process.env.JWT_SECRET, // Make sure to store this secret safely in your environment variables
      { expiresIn: "1h" } // Set the expiration time for the token
    );

    // Return the user data along with success status and token
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
      token, // Send the token to the client
    });
  } catch (error) {
    // Handle errors (e.g., missing fields, validation errors)
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
