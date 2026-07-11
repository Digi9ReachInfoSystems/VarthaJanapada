const mongoose = require("mongoose");
const VideoCategory = require("../models/videoCategoryModel");
const LongVideo = require("../models/longVideoModel");

// Digi9 video-category IDs (keep stable so filters match migrated data)
const NEWS_BULLETIN_ID = "696df893b001a9c3533fd247";
const CM_ID = "6971baa75189578acfcb15b3";

const DEFAULT_VIDEO_CATEGORIES = [
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

// Digi9 longvideo _id → video-category _id
const VIDEO_CATEGORY_BACKFILL = {
  "6915b44606c86c0afe8aad39": NEWS_BULLETIN_ID,
  "6915bb6806c86c0afe8aad3a": CM_ID,
  "6915c52506c86c0afe8aad3d": CM_ID,
  "6916ac8c06c86c0afe8aad3f": NEWS_BULLETIN_ID,
  "6916ae0e06c86c0afe8aad40": NEWS_BULLETIN_ID,
};

async function ensureDefaultVideoCategories() {
  // Drop prior seeds with same names but non-canonical IDs, then upsert digi9 IDs
  await VideoCategory.deleteMany({
    name: { $in: ["News Bulletin", "CM"] },
    _id: {
      $nin: [
        new mongoose.Types.ObjectId(NEWS_BULLETIN_ID),
        new mongoose.Types.ObjectId(CM_ID),
      ],
    },
  });

  for (const cat of DEFAULT_VIDEO_CATEGORIES) {
    await VideoCategory.updateOne(
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

async function backfillLongVideoCategories() {
  const ops = Object.entries(VIDEO_CATEGORY_BACKFILL).map(([videoId, categoryId]) =>
    LongVideo.updateOne(
      {
        _id: videoId,
        $or: [{ category: null }, { category: { $exists: false } }],
      },
      { $set: { category: categoryId } }
    )
  );
  await Promise.all(ops);

  // Any remaining uncategorized videos default to News Bulletin
  await LongVideo.updateMany(
    { $or: [{ category: null }, { category: { $exists: false } }] },
    { $set: { category: NEWS_BULLETIN_ID } }
  );
}

async function ensureVideoCategoryData() {
  await ensureDefaultVideoCategories();
  await backfillLongVideoCategories();
}

exports.ensureVideoCategoryData = ensureVideoCategoryData;

exports.getAllVideoCategories = async (req, res) => {
  try {
    await ensureVideoCategoryData();

    const categories = await VideoCategory.find({ status: "approved" })
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

exports.createVideoCategory = async (req, res) => {
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
    const category = new VideoCategory({
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
