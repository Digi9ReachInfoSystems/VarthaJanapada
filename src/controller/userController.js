const User = require("../models/userModel");
const News = require("../models/newsModel");
const Category = require("../models/categoryModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebaseConfig"); // Import initialized Firebase admin

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("preferences.categories", "name") // Populate category names
      .populate("likedVideos.videoId", "title url thumbnail"); // Populate videos (title, URL, thumbnail)

    // Add totalClickedNews field to each user
    const updatedUsers = users.map((user) => ({
      ...user.toObject(),
      totalClickedNews: user.clickedNews.length, // Count clicked news for each user
    }));

    res.status(200).json({ success: true, data: updatedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("preferences.categories", "name") // Populate category names
      .populate("likedVideos.videoId", "title url thumbnail"); // Populate videos (title, URL, thumbnail)

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Count total clicked news items
    const totalClickedNews = user.clickedNews.length;

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        totalClickedNews, // Include clicked news count in response
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.trackNewsClick = async (req, res) => {
  try {
    const { newsId, userId } = req.body; // newsId will be passed in the request body

    // Check if the news exists
    const news = await News.findById(newsId);
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user has already clicked this news
    const existingClick = user.clickedNews.find(
      (item) => item.newsId.toString() === newsId
    );
    if (existingClick) {
      // Update timestamp if the news is already in the clickedNews array
      existingClick.timestamp = new Date();
    } else {
      // Add the clicked news to the clickedNews array
      user.clickedNews.push({ newsId, timestamp: new Date() });
    }

    // Save the user data with the updated clickedNews
    await user.save();

    // Return a success response
    res
      .status(200)
      .json({ success: true, message: "News click tracked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.recommendCategory = async (req, res) => {
  try {
    const { userId } = req.params; // Now we are getting the userId from the route parameters

    // Fetch the user's clicked news (via clickedNews array)
    const user = await User.findById(userId).populate("clickedNews.newsId");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize an object to track the count of each category based on clicked news
    const categoryCount = {};

    // Loop through each clicked news and tally the categories
    user.clickedNews.forEach((clickedItem) => {
      const categoryId = clickedItem.newsId.category._id.toString();
      categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;
    });

    // If the user has not interacted with any news, return an appropriate message
    if (Object.keys(categoryCount).length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        // message: "No news has been clicked by the user",
      });
    }

    // Sort the categories by the count of user interactions in descending order
    const sortedCategoryIds = Object.keys(categoryCount).sort(
      (a, b) => categoryCount[b] - categoryCount[a]
    );

    // Fetch the top category based on user interactions
    const topCategoryId = sortedCategoryIds[0];
    const topCategory = await Category.findById(topCategoryId);

    if (!topCategory) {
      return res
        .status(200)
        .json({ success: false, message: "Category not found", data: [] });
    }

    // Check if another category has more interactions than the current top category
    let recommendedCategory = topCategory;
    let maxInteractions = categoryCount[topCategoryId];

    // Iterate through the remaining categories to see if any has more interactions
    for (const categoryId of sortedCategoryIds.slice(1)) {
      if (categoryCount[categoryId] > maxInteractions) {
        recommendedCategory = await Category.findById(categoryId);
        maxInteractions = categoryCount[categoryId];
      }
    }

    // Fetch news articles from the recommended category (the one with the highest interactions)
    const recommendedNews = await News.find({
      category: recommendedCategory._id,
      isLive: true,
    })
      .sort({ createdTime: -1 }) // Sort by most recent
      .limit(5) // Limit to top 5 articles
      .populate("category")
      .populate("tags", "name");

    // Return the recommended news articles along with the recommended category
    res.status(200).json({
      success: true,
      data: recommendedNews,
      recommendedCategory: recommendedCategory.name,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { displayName, email, profileImage } = req.body;


   
    // Validate that at least one field is provided
    if (!displayName && !email && !profileImage) {
      return res
        .status(400)
        .json({ success: false, message: "No update fields provided" });
    }

    // Check if email is unique
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already in use" });
      }
    }
const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Update the user profile
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { displayName, email, profileImage } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { categoryIds } = req.body; // List of selected category IDs

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    // Validate that categoryIds is provided and is an array
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid list of category IDs",
      });
    }

    // Validate category IDs
    for (let id of categoryIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category ID: ${id}`,
        });
      }
    }

    // Check if all provided categories exist
    const categories = await Category.find({ _id: { $in: categoryIds } });
    if (categories.length !== categoryIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more categories not found",
      });
    }

    // Update the user's preferences
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { "preferences.categories": categoryIds } },
      { new: true }
    ).populate("preferences.categories", "name");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: updatedUser.preferences.categories, // Return selected categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); // Count total users

    res.status(200).json({
      success: true,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNewUsersCount = async (req, res) => {
  try {
    // Get the start and end time of yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const usersCount = await User.countDocuments({
      createdTime: { $gte: yesterday, $lt: today },
    });

    res.status(200).json({
      success: true,
      newUsers: usersCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

// if (!serviceAccountBase64) {
//   throw new Error(
//     "FIREBASE_SERVICE_ACCOUNT_BASE64 is missing in environment variables"
//   );
// }

// Convert Base64 back to JSON
// const serviceAccount = JSON.parse(
//   Buffer.from(serviceAccountBase64, "base64").toString("utf8")
// );

const generateSessionToken = (user) => {
  return jwt.sign(
    { userId: user._id, phone_Number: user.phone_Number },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.loginOnWeb = async (req, res) => {
  try {
    const { idToken } = req.body; // Expect only the idToken in the body
    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, message: "ID Token is required" });
    }

    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("Decoded Token:", decodedToken);

    // Extract phone number from Firebase Token
    const firebasePhoneNumber = decodedToken.phone_number;
    if (!firebasePhoneNumber) {
      return res.status(401).json({
        success: false,
        message: "Phone number not found in Firebase token",
      });
    }

    // Check if user exists in database, otherwise create a new user
    let user = await User.findOne({ phone_Number: firebasePhoneNumber });

    if (!user) {
      user = await User.create({
        phone_Number: firebasePhoneNumber,
        displayName: decodedToken.name || "New User",
        email: decodedToken.email || "",
        profileImage: decodedToken.picture || "",
      });
    }

    // Update last login time
    user.last_logged_in = new Date();
    await user.save();

    // Fetch the userId from the database (this is your MongoDB document _id)
    const userId = user._id;

    // Generate session token
    const sessionToken = generateSessionToken(user);

    // Set session token in HTTP-only cookie
    res.cookie("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Enable secure cookies in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return the response along with userId and sessionToken
    return res.status(200).json({
      success: true,
      data: user,
      userId: userId, // Include the userId in the response
      token: sessionToken,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error in loginOnWeb:", error);
    return res
      .status(401)
      .json({ success: false, error: error.message });
  }
};

// 🔹 Logout & Clear Cookies
exports.logout = (req, res) => {
  res.clearCookie("sessionToken", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production", // Only secure cookies in production
    sameSite: "strict",
    maxAge: 0, // Set the cookie expiration to 0 to effectively clear it
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

exports.getMonthlyUserCreationData = async (req, res) => {
  try {
    const { year, month } = req.query; // Get year and month from query params

    // Validate year and month
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required in query parameters",
      });
    }

    // Create start and end dates for the specified month
    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JavaScript
    const endDate = new Date(year, month, 1); // Start of the next month

    // Aggregate users by createdTime
    const userCreationData = await User.aggregate([
      {
        $match: {
          createdTime: { $gte: startDate, $lt: endDate }, // Filter users created in the specified month
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdTime" } }, // Group by date
          count: { $sum: 1 }, // Count users for each date
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date in ascending order
      },
    ]);

    // Format the data for the frontend
    const formattedData = userCreationData.map((entry) => ({
      date: entry._id,
      count: entry.count,
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateAdminProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { displayName, email, profileImage } = req.body;
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid admin ID" });
    }
    // Validate that at least one field is provided
    if (!displayName && !email && !profileImage) {
      return res
        .status(400)
        .json({ success: false, message: "No update fields provided" });
    }
    // Check if email is unique
    if (email) {
      const existingUser = await User

        .findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res

          .status(400)
          .json({ success: false, message: "Email is already in use" });
      }
    }
    const updatedAdmin = await User.findByIdAndUpdate(
      userId,
      { $set: { displayName, email, profileImage } },
      { new: true, runValidators: true }
    );
    if (!updatedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    res.status(200).json({ success: true, data: updatedAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};