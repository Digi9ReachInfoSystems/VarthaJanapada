const Tags = require("../models/tagsModel");

exports.createTags = async (req, res) => {
  try {
    const tags = new Tags(req.body);
    const savedTags = await tags.save();
    res.status(201).json({ success: true, data: savedTags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTags = async (req, res) => {
  try {
    const tagsList = await Tags.find().sort({ createdTime: -1 });
    res.status(200).json({ success: true, data: tagsList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTags = async (req, res) => {
  try {
    const tags = await Tags.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!tags) {
      return res
        .status(404)
        .json({ success: false, message: "Tags not found" });
    }
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTags = async (req, res) => {
  try {
    const tags = await Tags.findByIdAndDelete(req.params.id);
    if (!tags) {
      return res
        .status(404)
        .json({ success: false, message: "Tags not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Tags deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
