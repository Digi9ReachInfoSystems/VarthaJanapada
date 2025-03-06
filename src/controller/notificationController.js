const User = require("../models/userModel");
const admin = require("firebase-admin");
const Notification = require("../models/notificationModel");

exports.updateFcmToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.fcmToken = fcm_token;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "FCM token updated successfully" });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update FCM token",
      error: error.message,
    });
  }
};
exports.createNotification = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Fetch all users and their FCM tokens
    const users = await User.find();
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }

    // Extract FCM tokens and user IDs
    const fcmTokens = users.map((user) => user.fcmToken).filter(Boolean); // Filter out any invalid (null or empty) tokens
    const userIds = users.map((user) => user._id);

    // Ensure there are valid tokens before proceeding
    if (fcmTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid FCM tokens found for users",
      });
    }

    // Send message to all FCM tokens (one for each user)
    const messages = fcmTokens.map((token) => ({
      notification: {
        title,
        body: description,
      },
      token,
    }));

    // Send all notifications via Firebase Cloud Messaging
    await Promise.all(
      messages.map((message) => {
        if (message.token) {
          return admin.messaging().send(message); // Only send if there's a valid token
        }
      })
    );

    // Create the notification document (optional, includes user IDs)
    const notification = new Notification({
      title,
      description,
      userId: userIds, // List of user IDs to whom the notification was sent
      fcm_token: "", // Not needed here, we are sending to multiple tokens
      type: "general", // Adjust as needed
    });

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification sent successfully!",
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const { userId } = req.query; // Optionally get userId from query params
    let notifications;

    if (userId) {
      // Fetch notifications for a specific user
      notifications = await Notification.find({ userId });
    } else {
      // Fetch all notifications
      notifications = await Notification.find();
    }

    if (notifications.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No notifications found" });
    }

    res.status(200).json({
      success: true,
      notifications: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};
