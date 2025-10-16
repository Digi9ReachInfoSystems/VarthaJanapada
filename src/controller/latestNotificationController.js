const latestNotificationController = require("../models/latestNotificationModel");

exports.createLatestNotification = async (req, res) => {
  try {
    const { title, link } = req.body;
    const newLatestNotification = new latestNotificationController({
      title,
      link,
    });
    const savedLatestNotification = await newLatestNotification.save();
    res.status(201).json({ success: true, data: savedLatestNotification });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllLatestNotifications = async (req, res) => {
  try {
    const latestNotifications = await latestNotificationController.find();
    res.status(200).json({ success: true, data: latestNotifications });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteLatestNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNotification = await latestNotificationController.findByIdAndDelete(id);
    if (!deletedNotification) {
        return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, message: "Notification deleted successfully" });
  }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};


exports.getAllLatestNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await latestNotificationController.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

