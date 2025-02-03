const magazine = require("../models/magazineModel");

const createMagazine = async (req, res) => {
  try {
    const magazine = new magazine(req.body);
    const savedMagazine = await magazine.save();
    res.status(201).json({ success: true, data: savedMagazine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getMagazines = async (req, res) => {
  try {
    const magazines = await magazine.find();
    res.status(200).json({ success: true, data: magazines });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getMagazineById = async (req, res) => {
  try {
    const magazines = await magazine.findById(req.params.id);
    res.status(200).json({ success: true, data: magazines });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteMagazine = async (req, res) => {
  try {
    const magazines = await magazine.findByIdAndDelete(req.params.id);
    if (!magazines) {
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

module.exports = {
  createMagazine,
  getMagazines,
  getMagazineById,
  deleteMagazine,
};
