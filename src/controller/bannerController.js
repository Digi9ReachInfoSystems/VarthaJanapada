const Banner = require("../models/bannerModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const BannerVersion = require("../models/BannerVersionModel");

const createBanner = async (req, res) => {
  const { title, description, bannerImage } = req.body;
  const user = req.user; // from authenticateJWT

  try {
    const banner = new Banner({
      title,
      description,
      bannerImage,
      createdBy: user.id,
      status: user.role === "admin" ? "approved" : "pending", // moderator needs approval
    });

    await banner.save();
    res.status(201).json({ success: true, message: "Banner created", data: banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const approveBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

    banner.status = "approved";
    banner.last_updated = new Date();
    await banner.save();

    res.status(200).json({ success: true, message: "Banner approved & published", data: banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const updateBanner = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  
  try {
    // Validate required fields
    const { title, description, bannerImage } = req.body;
    if (!title || !description || !bannerImage) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, description, and bannerImage are required" 
      });
    }

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        message: "Banner not found" 
      });
    }

    // STEP 1: Create a version snapshot BEFORE changes
    const versionCount = await BannerVersion.countDocuments({ bannerId: banner._id });
    await BannerVersion.create({
      bannerId: banner._id,
      updatedBy: user._id, // Make sure this is included
      versionNumber: versionCount + 1,
      snapshot: {
        ...banner.toObject(),
        createdBy: banner.createdBy // Ensure createdBy is preserved in snapshot
      },
      updatedAt: new Date()
    });

    // STEP 2: Apply updates
    banner.title = title;
    banner.description = description;
    banner.bannerImage = bannerImage;
    banner.last_updated = new Date();
    banner.updatedBy = user._id; // Track who made the update

    // Handle status based on user role
    if (user.role === "moderator") {
      banner.status = "pending";
    } else if (user.role === "admin") {
      banner.status = req.body.status || banner.status;
    }

    const updatedBanner = await banner.save();

    res.status(200).json({ 
      success: true, 
      data: updatedBanner,
      message: "Banner updated successfully with version tracking"
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().populate("createdBy");
    res.status(200).json(banners);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("No banner with that id");
    await Banner.findByIdAndDelete(id);

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("No banner with that id");
    const banner = await Banner.findById(id);
    res.status(200).json(banner);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}
module.exports = { createBanner,getBannerById, getAllBanners, deleteBanner, approveBanner, updateBanner };
