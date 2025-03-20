const Announcement = require("../models/AnnouncementModel");
const { Translate } = require("@google-cloud/translate").v2;

const base64Key = process.env.GOOGLE_CLOUD_KEY_BASE64;
if (!base64Key) {
  throw new Error(
    "GOOGLE_CLOUD_KEY_BASE64 is not set in environment variables"
  );
}
// const credentials = JSON.parse(
//   Buffer.from(base64Key, "base64").toString("utf-8")
// );

// const translate = new Translate({ credentials });

// // Helper function to translate text
// const translateText = async (text, targetLanguage) => {
//   try {
//     const [translation] = await translate.translate(text, targetLanguage);
//     return translation;
//   } catch (err) {
//     console.error(`Error translating to ${targetLanguage}:`, err);
//     return text; // Return the original text if translation fails
//   }
// };

// // 1. Create a new announcement with translations
// exports.createAnnouncement = async (req, res) => {
//   try {
//     const { title, description } = req.body;

//     // Translate the title and description into Hindi, English, and Kannada
//     const [titleHindi, titleEnglish, titleKannada] = await Promise.all([
//       translateText(title, "hi"), // Hindi
//       translateText(title, "en"), // English
//       translateText(title, "kn"), // Kannada
//     ]);

//     const [descriptionHindi, descriptionEnglish, descriptionKannada] =
//       await Promise.all([
//         translateText(description, "hi"), // Hindi
//         translateText(description, "en"), // English
//         translateText(description, "kn"), // Kannada
//       ]);

//     // Create the announcement with translations
//     const newAnnouncement = await Announcement.create({
//       title: {
//         en: titleEnglish,
//         hi: titleHindi,
//         kn: titleKannada,
//       },
//       description: {
//         en: descriptionEnglish,
//         hi: descriptionHindi,
//         kn: descriptionKannada,
//       },
//     });

//     res.status(201).json({
//       status: "success",
//       data: {
//         announcement: newAnnouncement,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };
// // 2. Get all announcements
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
