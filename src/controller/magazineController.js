const Magazine = require("../models/magazineModel"); // Capital 'M' for model
const { search } = require("../routes/newsRoutes");

const createMagazine = async (req, res) => {
  try {
    const newMagazine = new Magazine(req.body); // Use 'Magazine' (model)
    const savedMagazine = await newMagazine.save();
    res.status(201).json({ success: true, data: savedMagazine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getMagazines = async (req, res) => {
  try {
    const magazines = await Magazine.find(); // Use 'Magazine'
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
