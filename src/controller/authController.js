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

// const User = require("../models/userModel");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const admin = require("../config/firebaseConfig");

// // Set secure cookies
// const setTokens = (res, accessToken, refreshToken) => {
//   res.cookie("accessToken", accessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 15 * 60 * 1000, // 15 minutes
//   });

//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   });
// };

// // Signup with phone
// exports.signup = async (req, res) => {
//   try {
//     const { phone_Number, displayName, profileImage, email, password } =
//       req.body;

//     const existing = await User.findOne({ phone_Number });
//     if (existing)
//       return res
//         .status(400)
//         .json({ success: false, message: "Phone number already registered" });

//     const hashedPassword = password
//       ? await bcrypt.hash(password, 12)
//       : undefined;

//     const user = await User.create({
//       phone_Number,
//       displayName,
//       email,
//       profileImage,
//       password: hashedPassword,
//     });
//     await admin.auth().createUser({
//       uid: user._id.toString(),
//       email,
//       phoneNumber: `+91${phone_Number}`,
//       displayName,
//       photoURL: profileImage,
//       password: password || undefined,
//     });

//     const { accessToken, refreshToken } = user.generateAuthToken();
//     user.refreshToken = refreshToken;
//     await user.save();

//     setTokens(res, accessToken, refreshToken);
//     const userData = user.toObject();
//     delete userData.password;
//     delete userData.refreshToken;

//     res.status(201).json({ success: true, data: userData, accessToken });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // Signup with email
// exports.signupWithEmail = async (req, res) => {
//   try {
//     const { displayName, profileImage, email, password } = req.body;

//     const existing = await User.findOne({ email });
//     if (existing)
//       return res
//         .status(400)
//         .json({ success: false, message: "Email already registered" });

//     const hashedPassword = password
//       ? await bcrypt.hash(password, 12)
//       : undefined;

//     const user = await User.create({
//       displayName,
//       email,
//       profileImage,
//       password: hashedPassword,
//     });

//     const { accessToken, refreshToken } = user.generateAuthToken();
//     user.refreshToken = refreshToken;
//     await user.save();

//     setTokens(res, accessToken, refreshToken);
//     const userData = user.toObject();
//     delete userData.password;
//     delete userData.refreshToken;

//     res.status(201).json({ success: true, data: userData, accessToken });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // Login with phone or email
// exports.login = async (req, res) => {
//   try {
//     const { phone_Number, email } = req.body;

//     const query = phone_Number ? { phone_Number } : { email };
//     const user = await User.findOneAndUpdate(
//       query,
//       { last_logged_in: new Date() },
//       { new: true }
//     );

//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });

//     const { accessToken, refreshToken } = user.generateAuthToken();
//     user.refreshToken = refreshToken;
//     await user.save();

//     setTokens(res, accessToken, refreshToken);
//     const userData = user.toObject();
//     delete userData.refreshToken;

//     res.status(200).json({ success: true, data: userData, accessToken });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // Create user with specific role (admin only)
// exports.createUserWithRole = async (req, res) => {
//   try {
//     const { phone_Number, displayName, profileImage, email, role, password } =
//       req.body;

//     const validRoles = ["admin", "moderator", "content"];
//     if (!validRoles.includes(role)) {
//       return res.status(400).json({ success: false, message: "Invalid role" });
//     }

//     const hashedPassword = password
//       ? await bcrypt.hash(password, 12)
//       : undefined;

//     const user = await User.create({
//       phone_Number,
//       displayName,
//       profileImage,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     const { accessToken, refreshToken } = user.generateAuthToken();
//     user.refreshToken = refreshToken;
//     await user.save();

//     setTokens(res, accessToken, refreshToken);
//     const userData = user.toObject();
//     delete userData.password;
//     delete userData.refreshToken;

//     res
//       .status(201)
//       .json({
//         success: true,
//         message: "User created",
//         data: userData,
//         accessToken,
//       });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // Login with role token generation
// exports.loginWithUserRole = async (req, res) => {
//   try {
//     const { phone_Number, email } = req.body;
//     const query = phone_Number ? { phone_Number } : { email };

//     const user = await User.findOne(query);
//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });

//     const { accessToken, refreshToken } = user.generateAuthToken();
//     user.refreshToken = refreshToken;
//     await user.save();

//     setTokens(res, accessToken, refreshToken);
//     const userData = user.toObject();
//     delete userData.password;
//     delete userData.refreshToken;

//     res.status(200).json({ success: true, data: userData, token: accessToken });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Refresh access token
// exports.refreshToken = async (req, res) => {
//   try {
//     const token = req.cookies.refreshToken;
//     if (!token)
//       return res
//         .status(401)
//         .json({ success: false, message: "Missing refresh token" });

//     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
//     const user = await User.findById(decoded.id).select("+refreshToken");

//     if (!user || user.refreshToken !== token) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid refresh token" });
//     }

//     const { accessToken, refreshToken: newRefresh } = user.generateAuthToken();
//     user.refreshToken = newRefresh;
//     await user.save();

//     setTokens(res, accessToken, newRefresh);
//     res.status(200).json({ success: true, accessToken });
//   } catch (error) {
//     res.status(403).json({ success: false, error: error.message });
//   }
// };

// // Logout
// exports.logout = async (req, res) => {
//   try {
//     if (req.userId)
//       await User.findByIdAndUpdate(req.userId, { refreshToken: null });

//     res.clearCookie("accessToken");
//     res.clearCookie("refreshToken");

//     res.status(200).json({ success: true, message: "Logged out successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Get user profile
// exports.getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.userId); // comes from authenticateJWT
//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });

//     res.status(200).json({ success: true, data: user });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Check user existence
// exports.checkUserByPhoneNumber = async (req, res) => {
//   try {
//     const { phone_Number } = req.body;
//     if (!phone_Number)
//       return res
//         .status(400)
//         .json({ success: false, message: "Phone number is required" });

//     const user = await User.findOne({ phone_Number });
//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User does not exist" });

//     res.status(200).json({ success: true, message: "User exists", data: user });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const admin = require("../config/firebaseConfig");

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

// --- Helpers ---
const validateEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
};

const validatePassword = (pw) => {
  // tweak as you like
  return typeof pw === "string" && pw.length >= 6;
};

// ====================== AUTH WITHOUT FIREBASE ======================

// Signup with email+password (primary flow)
// exports.signupWithEmail = async (req, res) => {
//   try {
//     const { displayName, profileImage, email, password, phone_Number } = req.body;

//     if (!displayName) {
//       return res.status(400).json({ success: false, message: "displayName is required" });
//     }
//     if (!validateEmail(email)) {
//       return res.status(400).json({ success: false, message: "Valid email is required" });
//     }
//     if (!validatePassword(password)) {
//       return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
//     }

//     // Uniqueness checks
//     if (email) {
//       const exists = await User.findOne({ email });
//       if (exists) return res.status(400).json({ success: false, message: "Email already registered" });
//     }
//     if (phone_Number) {
//       const phoneExists = await User.findOne({ phone_Number });
//       if (phoneExists) return res.status(400).json({ success: false, message: "Phone number already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);

//     const user = await User.create({
//       displayName,
//       email,
//       phone_Number,
//       profileImage,
//       password: hashedPassword,
//     });

//     const { accessToken, refreshToken } = user.generateAuthToken();
//     user.refreshToken = refreshToken;
//     await user.save();

//     setTokens(res, accessToken, refreshToken);
//     const userData = user.toObject();
//     delete userData.password;
//     delete userData.refreshToken;

//     res.status(201).json({ success: true, data: userData, accessToken });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

exports.signupWithEmail = async (req, res) => {
  try {
    const { idToken } = req.body; // Firebase ID token from frontend
    if (!idToken)
      return res
        .status(400)
        .json({ success: false, message: "Firebase ID token is required" });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, phone_number, name, picture } = decoded;

    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    user = await User.create({
      email,
      phone_Number: phone_number,
      profileImage: picture,
      displayName: name || "User",
    });

    const { accessToken, refreshToken } = user.generateAuthToken();
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    res.status(201).json({ success: true, data: user, accessToken });
  } catch (error) {
    console.error("signupWithEmail error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// (Optional) Legacy signup with phone+password (if you want to allow)
// If you DO NOT want phone-based signup anymore, you can delete this.
// controllers/auth.controller.js
// exports.signup = async (req, res) => {
//   try {
//     const { displayName, email, password, phone_Number, profileImage } = req.body;

//     if (!displayName) {
//       return res.status(400).json({ success: false, message: "displayName is required" });
//     }
//     if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase())) {
//       return res.status(400).json({ success: false, message: "Valid email is required" });
//     }
//     if (typeof password !== "string" || password.length < 6) {
//       return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
//     }

//     // uniqueness checks
//     if (await User.findOne({ email })) {
//       return res.status(400).json({ success: false, message: "Email already registered" });
//     }
//     if (phone_Number && await User.findOne({ phone_Number })) {
//       return res.status(400).json({ success: false, message: "Phone number already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);

//     const user = await User.create({
//       displayName,
//       email,
//       phone_Number,        // optional
//       profileImage,
//       password: hashedPassword,
//     });

//     const { accessToken, refreshToken } = user.generateAuthToken();
//     user.refreshToken = refreshToken;
//     await user.save();

//     setTokens(res, accessToken, refreshToken);
//     const userData = user.toObject();
//     delete userData.password;
//     delete userData.refreshToken;

//     return res.status(201).json({ success: true, data: userData, accessToken });
//   } catch (error) {
//     return res.status(400).json({ success: false, error: error.message });
//   }
// };

const extractUserInfoFromFirebase = (decodedToken) => {
  const { uid, email, phone_number, name, picture, email_verified, firebase } =
    decodedToken;

  return {
    firebaseUid: uid,
    email: email || null,
    phone_Number: phone_number || null,
    displayName: name || "User",
    profileImage: picture || null,
    emailVerified: email_verified || false,
    signInProvider: firebase?.sign_in_provider || null,
  };
};

// Unified Signup with Firebase
// exports.signup = async (req, res) => {
//   try {
//     const { firebaseUid, email, phone_Number, displayName, profileImage } =
//       req.body;

//     // Check if user already exists by firebaseUid, email, or phone
//     const existingUser = await User.findOne({
//       $or: [
//         { firebaseUid: firebaseUid },
//         // { email: userInfo.email },
//         { phone_Number: phone_Number },
//       ].filter((condition) => Object.values(condition)[0] !== null), // Remove null conditions
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists with this email or phone number",
//       });
//     }

//     // Create new user
//     const user = await User.create({
//       firebaseUid,
//       email,
//       phone_Number,
//       displayName,
//       profileImage,
//     });

//     // Generate JWT tokens
//     const { accessToken, refreshToken } = user.generateAuthToken();
//     user.refreshToken = refreshToken;
//     await user.save();

//     // Set cookies
//     setTokens(res, accessToken, refreshToken);

//     // Return user data (excluding sensitive fields)
//     const userResponse = user.toObject();
//     delete userResponse.refreshToken;

//     res.status(201).json({
//       success: true,
//       message: "User created successfully",
//       data: userResponse,
//       accessToken,
//     });
//   } catch (error) {
//     console.error("Signup error:", error);

//     // Handle specific Firebase errors
//     if (error.code === "auth/id-token-expired") {
//       return res.status(401).json({
//         success: false,
//         message: "Firebase token expired",
//       });
//     }

//     if (error.code === "auth/id-token-revoked") {
//       return res.status(401).json({
//         success: false,
//         message: "Firebase token revoked",
//       });
//     }

//     if (error.code === "auth/argument-error") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid Firebase token",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };


exports.signup = async (req, res) => {
  try {
    const { firebaseUid, email, phone_Number, displayName, profileImage } = req.body;

    // Ensure at least one unique identifier
    if (!firebaseUid && !email && !phone_Number) {
      return res.status(400).json({
        success: false,
        message: "Provide at least firebaseUid, email, or phone number",
      });
    }

    // 1️⃣ Check if user exists by Firebase UID or Phone Number
    const existingUser = await User.findOne({
      $or: [
        firebaseUid ? { firebaseUid } : null,
        phone_Number ? { phone_Number } : null,
      ].filter(Boolean),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this Firebase UID or phone number",
      });
    }

    // 2️⃣ Check if email already exists — if so, link firebaseUid if missing
    let existingEmailUser = null;
    if (email) {
      existingEmailUser = await User.findOne({ email });

      // If email exists but firebaseUid not linked yet, attach it
      if (existingEmailUser && !existingEmailUser.firebaseUid) {
        existingEmailUser.firebaseUid = firebaseUid;
        if (displayName) existingEmailUser.displayName = displayName;
        if (profileImage) existingEmailUser.profileImage = profileImage;
        await existingEmailUser.save();

        // Generate JWT tokens
        const { accessToken, refreshToken } = existingEmailUser.generateAuthToken();
        existingEmailUser.refreshToken = refreshToken;
        await existingEmailUser.save();

        // Set cookies
        setTokens(res, accessToken, refreshToken);

        const userResponse = existingEmailUser.toObject();
        delete userResponse.refreshToken;

        return res.status(200).json({
          success: true,
          message: "Firebase UID linked to existing user",
          data: userResponse,
          accessToken,
        });
      }

      // If email already used with another firebaseUid, block signup
      if (existingEmailUser && existingEmailUser.firebaseUid !== firebaseUid) {
        return res.status(400).json({
          success: false,
          message: "Email already associated with another Firebase UID",
        });
      }
    }

    // 3️⃣ Create new user
    const user = await User.create({
      firebaseUid,
      email,
      phone_Number,
      displayName,
      profileImage,
    });

    // 4️⃣ Generate JWT tokens
    const { accessToken, refreshToken } = user.generateAuthToken();
    user.refreshToken = refreshToken;
    await user.save();

    // 5️⃣ Set cookies
    setTokens(res, accessToken, refreshToken);

    // 6️⃣ Prepare clean response
    const userResponse = user.toObject();
    delete userResponse.refreshToken;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
      accessToken,
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handle Firebase-specific errors
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        message: "Firebase token expired",
      });
    }
    if (error.code === "auth/id-token-revoked") {
      return res.status(401).json({
        success: false,
        message: "Firebase token revoked",
      });
    }
    if (error.code === "auth/argument-error") {
      return res.status(400).json({
        success: false,
        message: "Invalid Firebase token",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


exports.getUserByFirebaseUserId = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = user.generateAuthToken();
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    setTokens(res, accessToken, refreshToken);

    // Return user data (excluding sensitive fields)
    const userResponse = user.toObject();
    delete userResponse.refreshToken;

    res.status(201).json({
      success: true,
      message: "User fetched successfully",
      data: userResponse,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// exports.checkUserAlreadyExists = async (req, res) => {
//   try {
//     const { phone_Number, email } = req.body;
//     if (email && phone_Number) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Provide either email or phone number, not both",
//         });
//     }
//     if (!email && !phone_Number) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Provide email or phone number" });
//     }
//     if (email) {
//       if (phone_Number) {
//         const user = await User.findOne({ email });

//         if (user) {
//           return res
//             .status(200)
//             .json({ success: true, message: "User already exists" });
//         } else {
//           return res
//             .status(200)
//             .json({ success: false, message: "User does not exist" });
//         }
//       }
//     }
//     if (phone_Number) {
//       const user = await User.findOne({ phone_Number });

//       if (user) {
//         return res
//           .status(200)
//           .json({ success: true, message: "User already exists" });
//       } else {
//         return res
//           .status(200)
//           .json({ success: false, message: "User does not exist" });
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// Login with email OR phone + password
// exports.login = async (req, res) => {
//   try {
//     const { phone_Number, email, password } = req.body;

//     if ((!email && !phone_Number) || !password) {
//       return res.status(400).json({ success: false, message: "Email/phone and password are required" });
//     }

//     const query = email ? { email } : { phone_Number };
//     // need password field
//     const user = await User.findOne(query).select("+password");
//     if (!user)
//       return res.status(404).json({ success: false, message: "User not found" });

//     const ok = await bcrypt.compare(password, user.password || "");
//     if (!ok) {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }

//     user.last_logged_in = new Date();
//     const { accessToken, refreshToken } = user.generateAuthToken();
//     user.refreshToken = refreshToken;
//     await user.save();

//     setTokens(res, accessToken, refreshToken);
//     const userData = user.toObject();
//     delete userData.password;
//     delete userData.refreshToken;

//     res.status(200).json({ success: true, data: userData, accessToken });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

exports.checkUserAlreadyExists = async (req, res) => {
  try {
    const { phone_Number, email } = req.body;

    // Allow only one identifier at a time
    if (email && phone_Number) {
      return res.status(400).json({
        success: false,
        message: "Provide either email or phone number, not both",
      });
    }

    if (!email && !phone_Number) {
      return res
        .status(400)
        .json({ success: false, message: "Provide email or phone number" });
    }

    let user;

    // Check by email
    if (email) {
      user = await User.findOne({ email });
    }

    // Check by phone number
    if (phone_Number) {
      user = await User.findOne({ phone_Number });
    }

    if (user) {
      return res
        .status(200)
        .json({ success: true, message: "User already exists" });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "User does not exist" });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res
        .status(400)
        .json({ success: false, message: "Firebase ID token required" });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, phone_number } = decoded;

    const user = await User.findOne({
      $or: [{ email }, { phone_Number: phone_number }],
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found. Please sign up." });

    user.last_logged_in = new Date();

    const { accessToken, refreshToken } = user.generateAuthToken();
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    res.status(200).json({ success: true, data: user, accessToken });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create user with specific role (admin only)
// Requires admin auth via middleware (see routes below)
exports.createUserWithRole = async (req, res) => {
  try {
    const { phone_Number, displayName, profileImage, email, role, password } =
      req.body;

    const validRoles = ["admin", "moderator", "content", "user"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (!displayName) {
      return res
        .status(400)
        .json({ success: false, message: "displayName is required" });
    }
    if (email && !validateEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists)
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });
    }
    if (phone_Number) {
      const phoneExists = await User.findOne({ phone_Number });
      if (phoneExists)
        return res
          .status(400)
          .json({ success: false, message: "Phone number already registered" });
    }

    let hashedPassword;
    if (password) {
      if (!validatePassword(password)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Password must be at least 6 characters",
          });
      }
      hashedPassword = await bcrypt.hash(password, 12);
    }

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

    res.status(201).json({
      success: true,
      message: "User created",
      data: userData,
      accessToken,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Login (returns role in payload just like normal login; keeping a separate endpoint if you use it)
exports.loginWithUserRole = async (req, res) => {
  try {
    const { phone_Number, email, password } = req.body;

    if ((!email && !phone_Number) || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email/phone and password are required",
        });
    }

    const query = email ? { email } : { phone_Number };
    const user = await User.findOne(query).select("+password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = user.generateAuthToken();
    user.refreshToken = refreshToken;
    user.last_logged_in = new Date();
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
    const user = await User.findById(req.userId); // from authenticateJWT
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check user existence by phone
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
