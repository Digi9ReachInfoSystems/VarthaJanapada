const Tags = require("../models/tagsModel");

exports.createTags = async (req, res) => {
  try {
      const tag = new Tags({
      ...req.body,
      createdBy: req.user._id,
      // Admins get instant approval; everyone else is pending
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });
    const savedTags = await tag.save();
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
try{
  const { name, description} = req.body;
  const tag = await Tags.findById(req.params.id);
  if (!tag) {
    return res
      .status(404)
      .json({ success: false, message: "Tags not found" });
  }
 
  const updatedTag = await Tags.findByIdAndUpdate(
    req.params.id,
    { 
      name,
       description,
      createdBy: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    },
    { new: true }
      )

    if(req.user.role !== "admin"){
      updatedTag.status = "pending";
    }

  res.status(200).json({ success: true, data: updatedTag });
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


exports.approveTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tags.findById(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    if (tag.status !== "pending") {
      return res.status(400).json({ success: false, message: "Tag is not in pending state" });
    }

    tag.status = "approved";
    tag.last_updated = new Date();
    const updatedTag = await tag.save();

    res.status(200).json({
      success: true,
      message: "Tag approved successfully",
      data: updatedTag
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
