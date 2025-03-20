const Announcement = require("../models/AnnouncementModel");

// 1. Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title } = req.body;

    const newAnnouncement = await Announcement.create({
      title,
    });

    res.status(201).json({
      status: "success",
      data: {
        announcement: newAnnouncement,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// 2. Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdTime: -1 }); // Sort by latest first

    res.status(200).json({
      status: "success",
      results: announcements.length,
      data: {
        announcements,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// 3. Get a single announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        status: "fail",
        message: "Announcement not found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        announcement,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// 4. Update an announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        description,
        last_updated: Date.now(),
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Validate the update against the schema
      }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({
        status: "fail",
        message: "Announcement not found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        announcement: updatedAnnouncement,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// 5. Delete an announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({
        status: "fail",
        message: "Announcement not found.",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
