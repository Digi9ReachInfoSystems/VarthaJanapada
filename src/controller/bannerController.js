const Banner = require("../models/bannerModel");
const mongoose = require("mongoose");

const createBanner = async (req, res) => {
  const { title, description, bannerImage } = req.body;
  try {
    const banner = new Banner({ title, description, bannerImage });
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
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

module.exports = { createBanner, getAllBanners, deleteBanner };
