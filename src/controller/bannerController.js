const Banner = require("../models/bannerModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");

// const createBanner = async (req, res) => {
//   const { title, description, bannerImage } = req.body;
//   try {
//     const banner = new Banner({ title, description, bannerImage });
//     await banner.save();
//     res.status(201).json(banner);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

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
  const { title, description, bannerImage } = req.body;

  try {
    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

    banner.title = title;
    banner.description = description;
    banner.bannerImage = bannerImage;
    banner.last_updated = new Date();

    if (user.role === "moderator") {
      banner.status = "pending"; // force approval again
    } else if (user.role === "admin") {
      banner.status = "approved"; // auto publish
    }

    await banner.save();

    res.status(200).json({ success: true, message: "Banner updated", data: banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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

module.exports = { createBanner, getAllBanners, deleteBanner, approveBanner, updateBanner };
