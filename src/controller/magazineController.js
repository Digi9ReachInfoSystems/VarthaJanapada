const Magazine = require("../models/magazineModel"); // Capital 'M' for model
const { search } = require("../routes/newsRoutes");
const { Translate } = require("@google-cloud/translate").v2;

const base64Key = process.env.GOOGLE_CLOUD_KEY_BASE64;
if (!base64Key) {
  throw new Error(
    "GOOGLE_CLOUD_KEY_BASE64 is not set in environment variables"
  );
}
const credentials = JSON.parse(
  Buffer.from(base64Key, "base64").toString("utf-8")
);

const translate = new Translate({ credentials });
const createMagazine = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Define the target languages for translation
    const targetLanguages = ["en", "kn", "hi"]; // English, Kannada, Hindi

    // Translate the title and description into multiple languages
    const translationPromises = targetLanguages.map(async (lang) => {
      const titleTranslation = await translate.translate(title, lang);
      const descriptionTranslation = await translate.translate(
        description,
        lang
      );

      return {
        language: lang,
        title: titleTranslation[0], // Translation result for title
        description: descriptionTranslation[0], // Translation result for description
      };
    });

    // Wait for all translations to complete
    const translations = await Promise.all(translationPromises);

    // Prepare the translated data for the new magazine
    const newMagazine = new Magazine({
      title, // Original title
      description, // Original description
      english: {
        title: translations.find((t) => t.language === "en").title,
        description: translations.find((t) => t.language === "en").description,
      },
      kannada: {
        title: translations.find((t) => t.language === "kn").title,
        description: translations.find((t) => t.language === "kn").description,
      },
      hindi: {
        title: translations.find((t) => t.language === "hi").title,
        description: translations.find((t) => t.language === "hi").description,
      },
      magazineThumbnail: req.body.magazineThumbnail,
      magazinePdf: req.body.magazinePdf,
      editionNumber: req.body.editionNumber,
      last_updated: new Date(),
    });

    // Save the new magazine to the database
    const savedMagazine = await newMagazine.save();

    res.status(201).json({ success: true, data: savedMagazine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
const getMagazines = async (req, res) => {
  try {
    const { publishedYear, publishedMonth, homepage } = req.query; // Extract query parameters

    // Build the filter object based on provided query parameters
    const filter = {};

    // Add conditions to the filter object if they exist in the query parameters
    if (publishedYear) {
      filter.publishedYear = publishedYear;
    }

    if (publishedMonth) {
      filter.publishedMonth = publishedMonth;
    }

    // Check if the homepage query parameter is passed
    const limit = homepage ? 10 : null; // Limit to 10 items if homepage is true

    // Find magazines based on the filter object and apply limit if necessary
    const magazines = await Magazine.find(filter)
      .sort({ createdTime: -1 }) // Sort by latest first
      .limit(limit); // Apply limit if homepage is true

    res.status(200).json({ success: true, data: magazines });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getMagazineById = async (req, res) => {
  try {
    const magazine = await Magazine.findById(req.params.id); // Use 'Magazine'
    if (!magazine) {
      // Check if magazine exists
      return res
        .status(404)
        .json({ success: false, message: "Magazine not found" });
    }
    res.status(200).json({ success: true, data: magazine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteMagazine = async (req, res) => {
  try {
    const deletedMagazine = await Magazine.findByIdAndDelete(req.params.id); // Use 'Magazine'
    if (!deletedMagazine) {
      return res
        .status(404)
        .json({ success: false, message: "Magazine not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Magazine deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const searchMagazine = async (req, res) => {
  try {
    const { query } = req.query; // Use req.query for search parameters

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const magazineList = await Magazine.find({
      title: { $regex: query, $options: "i" }, // Case-insensitive search
    }).sort({ createdTime: -1 }); // Sort by createdTime (if needed)

    if (magazineList.length === 0) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "No magazines found matching the search criteria",
      });
    }

    res.status(200).json({ success: true, data: magazineList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTotalMagazines = async (req, res) => {
  try {
    const totalMagazines = await Magazine.countDocuments();
    res.status(200).json({ success: true, data: totalMagazines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMagazine = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Ensure the magazine exists
    const magazine = await Magazine.findById(id);
    if (!magazine) {
      return res.status(404).json({
        success: false,
        message: "Magazine not found",
      });
    }

    // Update the magazine with the provided data (partial update)
    // Only fields that are provided will be updated
    if (updatedData.title) magazine.title = updatedData.title;
    if (updatedData.description) magazine.description = updatedData.description;
    if (updatedData.magazineThumbnail)
      magazine.magazineThumbnail = updatedData.magazineThumbnail;
    if (updatedData.magazinePdf) magazine.magazinePdf = updatedData.magazinePdf;
    if (updatedData.editionNumber)
      magazine.editionNumber = updatedData.editionNumber;

    // Update the last_updated timestamp
    magazine.last_updated = new Date();

    // Save the updated magazine
    const updatedMagazine = await magazine.save();

    res.status(200).json({
      success: true,
      data: updatedMagazine,
      message: "Magazine updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMagazine,
  getMagazines,
  getMagazineById,
  deleteMagazine,
  searchMagazine,
  getTotalMagazines,
  updateMagazine,
};
