const mongoose = require("mongoose");
const PhotoCategory = require("../models/photoCategoryModel");
const Photos = require("../models/photosModel");

// Digi9 photo-category IDs (match existing photo.category values in DB)
const NEWS_BULLETIN_ID = "696df3c95b6ecd55f07e06e7";
const CM_ID = "696f332f325d4dcc0a3c5fc8";

const DEFAULT_PHOTO_CATEGORIES = [
  {
    _id: new mongoose.Types.ObjectId(NEWS_BULLETIN_ID),
    name: "News Bulletin",
    category_name: "News Bulletin",
    english: "News Bulletin",
    hindi: "समाचार बुलेटिन",
    kannada: "ಸುದ್ದಿ ಪ್ರಕಟಣೆ",
    status: "approved",
  },
  {
    _id: new mongoose.Types.ObjectId(CM_ID),
    name: "CM",
    category_name: "CM",
    english: "CM",
    hindi: "सीएम",
    kannada: "ಸಿಎಂ",
    status: "approved",
  },
];

async function ensureDefaultPhotoCategories() {
  await PhotoCategory.deleteMany({
    name: { $in: ["News Bulletin", "CM"] },
    _id: {
      $nin: [
        new mongoose.Types.ObjectId(NEWS_BULLETIN_ID),
        new mongoose.Types.ObjectId(CM_ID),
      ],
    },
  });

  for (const cat of DEFAULT_PHOTO_CATEGORIES) {
    await PhotoCategory.updateOne(
      { _id: cat._id },
      {
        $set: {
          name: cat.name,
          category_name: cat.category_name,
          english: cat.english,
          hindi: cat.hindi,
          kannada: cat.kannada,
          status: "approved",
        },
        $setOnInsert: { createdTime: new Date() },
      },
      { upsert: true }
    );
  }
}

async function backfillPhotoCategories() {
  await Photos.updateMany(
    { $or: [{ category: null }, { category: { $exists: false } }] },
    { $set: { category: NEWS_BULLETIN_ID } }
  );
}

async function ensurePhotoCategoryData() {
  await ensureDefaultPhotoCategories();
  await backfillPhotoCategories();
}

exports.ensurePhotoCategoryData = ensurePhotoCategoryData;
exports.NEWS_BULLETIN_ID = NEWS_BULLETIN_ID;
exports.CM_ID = CM_ID;

exports.getAllPhotoCategories = async (req, res) => {
  try {
    await ensurePhotoCategoryData();

    const categories = await PhotoCategory.find({ status: "approved" })
      .sort({ createdTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPhotoCategory = async (req, res) => {
  try {
    const { name, category_name, english, hindi, kannada, description } =
      req.body;

    if (!name && !english && !category_name) {
      return res.status(400).json({
        success: false,
        message: "Provide name, english, or category_name.",
      });
    }

    const resolvedName = name || english || category_name;
    const category = new PhotoCategory({
      name: resolvedName,
      category_name: category_name || resolvedName,
      english: english || resolvedName,
      hindi,
      kannada,
      description,
      createdBy: req.user?.id,
      status: req.user?.role === "admin" ? "approved" : "pending",
    });

    const saved = await category.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
