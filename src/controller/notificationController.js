const User = require("../model/userModel");
const admin = require("firebase-admin");
const Notification = require("../model/notificationModel");

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
