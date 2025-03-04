const User = require("../model/userModel");
const admin = require("firebase-admin");
const Notification = require("../model/notificationModel");

exports.createNotification = async (req, res) => {
  try {
    const { title, description, userId, fcm_token, type } = req.body;
    const notification = new Notification({
      title,
      description,
      userId,
      fcm_token,
      type,
    });
    await notification.save();
  } catch {}
};
