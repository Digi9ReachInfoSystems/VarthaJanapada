// const User = require("../models/userModel");
// const jwt = require("jsonwebtoken");
// const cookie = require("cookie");

// exports.signup = async (req, res) => {
//   try {
//     const { phone_Number, displayName, profileImage, email } = req.body;

//     const user = await User.create({
//       phone_Number,
//       displayName,
//       email,
//       profileImage,
//     });
//     res.status(201).json({ success: true, data: user });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// exports.signupWithEmail = async (req, res) => {
//   try {
//     const { displayName, profileImage, email } = req.body;

//     const user = await User.create({
//       displayName,
//       email,
//       profileImage,
//     });
//     res.status(201).json({ success: true, data: user });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };
// exports.login = async (req, res) => {
//   try {
//     const { phone_Number, email } = req.body;

//     // if (!phone_Number) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "Either phone number or email must be provided",
//     //   });
//     // }

//     let query = {};
//     if (phone_Number) {
//       query.phone_Number = phone_Number;
//     }
//     if (email) {
//       query.email = email;
//     }

//     const user = await User.findOneAndUpdate(
//       query,
//       { last_logged_in: new Date() },
//       { new: true }
//     );

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({ success: true, data: user });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// exports.getUserProfile = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }
//     res.status(200).json({ success: true, data: user });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// exports.signUpWithEmail = async (req, res) => {
//   try {
//     const { displayName, profileImage, email } = req.body;

//     const user = await User.create({
//       phone_Number,
//       displayName,
//       email,
//       profileImage,
//     });
//     res.status(201).json({ success: true, data: user });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// exports.loginWithEmail = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOneAndUpdate(
//       { phone_Number },
//       { last_logged_in: new Date() },
//       { new: true }
//     );

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }
//     res.status(200).json({ success: true, data: user });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// exports.createUserRole = async (req, res) => {
//   try {
//     const { userId, role } = req.body;
//     const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }
//     res.status(200).json({ success: true, data: user });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };
// exports.loginWithUserRole = async (req, res) => {
//   try {
//     const { phone_Number, email } = req.body;

//     let query = {};
//     if (phone_Number) {
//       query.phone_Number = phone_Number;
//     }
//     if (email) {
//       query.email = email;
//     }

//     const user = await User.findOne(query);

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     // Create the JWT token with role
//     const token = jwt.sign(
//       {
//         id: user._id,
//         email: user.email,
//         role: user.role, // Include the role in the token
//       },
//       process.env.JWT_SECRET, // Make sure to store this secret safely
//       { expiresIn: "1h" }
//     );

//     // Send the token in the response
//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       data: user,
//       token, // Send the token to the client
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// exports.createUserWithRole = async (req, res) => {
//   try {
//     const { phone_Number, displayName, profileImage, email, role } = req.body;

//     // Validate the role (Optional: You can add more validation for roles)
//     const validRoles = ["admin", "moderator", "content"];
//     if (!validRoles.includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid role. Available roles are admin, moderator, and content.",
//       });
//     }

//     // Create a new user with the provided role
//     const user = await User.create({
//       phone_Number,
//       displayName,
//       email,
//       profileImage,
//       role, // Assign role to the user
//     });

//     // Create the JWT token with the user details and role
//     const token = jwt.sign(
//       {
//         id: user._id,
//         email: user.email,
//         role: user.role, // Include the role in the token
//       },
//       process.env.JWT_SECRET, // Make sure to store this secret safely in your environment variables
//       { expiresIn: "1h" } // Set the expiration time for the token
//     );

//     // Return the user data along with success status and token
//     res.status(201).json({
//       success: true,
//       message: "User created successfully",
//       data: user,
//       token, // Send the token to the client
//     });
//   } catch (error) {
//     // Handle errors (e.g., missing fields, validation errors)
//     res.status(400).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

// exports.checkUserByPhoneNumber = async (req, res) => {
//   try {
//     const { phone_Number } = req.body;

//     // Check if the phone number is provided
//     if (!phone_Number) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone number is required",
//       });
//     }

//     // Find the user by phone number
//     const user = await User.findOne({ phone_Number });

//     if (user) {
//       // If user exists, return success and user data
//       return res.status(200).json({
//         success: true,
//         message: "User account exists",
//         data: user,
//       });
//     } else {
//       // If user does not exist, return a message indicating that
//       return res.status(404).json({
//         success: false,
//         message: "User account does not exist",
//       });
//     }
//   } catch (error) {
//     // Handle any errors that occur during the process
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const admin = require("../config/firebaseConfig");

// Set secure cookies
const setTokens = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Signup with phone
exports.signup = async (req, res) => {
  try {
    const { phone_Number, displayName, profileImage, email, password } =
      req.body;

    const existing = await User.findOne({ phone_Number });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Phone number already registered" });

    const hashedPassword = password
      ? await bcrypt.hash(password, 12)
      : undefined;

    const user = await User.create({
      phone_Number,
      displayName,
      email,
      profileImage,
      password: hashedPassword,
    });
    await admin.auth().createUser({
      uid: user._id.toString(),
      email,
      phoneNumber: `+91${phone_Number}`,
      displayName,
      photoURL: profileImage,
      password: password || undefined,
    });

    const { accessToken, refreshToken } = user.generateAuthToken();
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    res.status(201).json({ success: true, data: userData, accessToken });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Signup with email
exports.signupWithEmail = async (req, res) => {
  try {
    const { displayName, profileImage, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    const hashedPassword = password
      ? await bcrypt.hash(password, 12)
      : undefined;

    const user = await User.create({
      displayName,
      email,
      profileImage,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = user.generateAuthToken();
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    res.status(201).json({ success: true, data: userData, accessToken });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Login with phone or email
exports.login = async (req, res) => {
  try {
    const { phone_Number, email } = req.body;

    const query = phone_Number ? { phone_Number } : { email };
    const user = await User.findOneAndUpdate(
      query,
      { last_logged_in: new Date() },
      { new: true }
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const { accessToken, refreshToken } = user.generateAuthToken();
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    const userData = user.toObject();
    delete userData.refreshToken;

    res.status(200).json({ success: true, data: userData, accessToken });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Create user with specific role (admin only)
exports.createUserWithRole = async (req, res) => {
  try {
    const { phone_Number, displayName, profileImage, email, role, password } =
      req.body;

    const validRoles = ["admin", "moderator", "content"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 12)
      : undefined;

    const user = await User.create({
      phone_Number,
      displayName,
      profileImage,
      email,
      password: hashedPassword,
      role,
    });

    const { accessToken, refreshToken } = user.generateAuthToken();
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    res
      .status(201)
      .json({
        success: true,
        message: "User created",
        data: userData,
        accessToken,
      });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Login with role token generation
exports.loginWithUserRole = async (req, res) => {
  try {
    const { phone_Number, email } = req.body;
    const query = phone_Number ? { phone_Number } : { email };

    const user = await User.findOne(query);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const { accessToken, refreshToken } = user.generateAuthToken();
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    res.status(200).json({ success: true, data: userData, token: accessToken });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Missing refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefresh } = user.generateAuthToken();
    user.refreshToken = newRefresh;
    await user.save();

    setTokens(res, accessToken, newRefresh);
    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    res.status(403).json({ success: false, error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    if (req.userId)
      await User.findByIdAndUpdate(req.userId, { refreshToken: null });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId); // comes from authenticateJWT
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check user existence
exports.checkUserByPhoneNumber = async (req, res) => {
  try {
    const { phone_Number } = req.body;
    if (!phone_Number)
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });

    const user = await User.findOne({ phone_Number });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });

    res.status(200).json({ success: true, message: "User exists", data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
