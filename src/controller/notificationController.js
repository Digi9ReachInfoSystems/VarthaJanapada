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
    const { title, description, userId, fcm_token, type } = req.body;

    // Create the notification document
    const notification = new Notification({
      title,
      description,
      userId,
      fcm_token,
      type,
    });

    await notification.save();

    const message = {
      notification: {
        title: title,
        body: description,
      },
      token: fcm_token, // FCM token for the specific user
    };

    // Send message via Firebase Cloud Messaging
    await admin.messaging().send(message);

    // Send a success response
    res
      .status(200)
      .json({ success: true, message: "Notification sent successfully!" });
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
