const NewArticle = require("../models/serviceModel");

exports.createService = async (req, res) => {
  try {
    const { title, link, kannada, hindi, English } = req.body;
    if (!title || !link) {
      return res.status(400).json({
        success: false,
        message: "title and link are required",
      });
    }

    const saved = await NewArticle.create({
      title: String(title).trim(),
      link: String(link).trim(),
      kannada: kannada ? String(kannada).trim() : undefined,
      hindi: hindi ? String(hindi).trim() : undefined,
      English: English ? String(English).trim() : String(title).trim(),
    });

    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.listServices = async (req, res) => {
  try {
    const newarticles = await NewArticle.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: { newarticles },
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await NewArticle.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
