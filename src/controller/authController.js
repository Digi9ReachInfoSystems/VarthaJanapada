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
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Validate password (assuming you have a method like `comparePassword` in your User model)
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // Update last logged in time
    user.last_logged_in = new Date();
    await user.save();

    // Create a JWT token with the user's role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the token in a cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("authToken", token, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Ensure cookies are only sent over HTTPS in production
        maxAge: 3600, // 1 hour
        sameSite: "strict", // Prevent CSRF attacks
        path: "/", // Make the cookie available across the entire site
      })
    );

    // Send the response
    res.status(200).json({
      success: true,
      data: user,
      token, // Optionally send the token in the response
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
