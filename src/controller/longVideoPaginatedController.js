const mongoose = require("mongoose");
const Videos = require("../models/longVideoModel");
const {
  ensureVideoCategoryData,
} = require("./videoCategoryController");

const populateVideos = (query) =>
  query
    .populate({
      path: "Comments",
      populate: {
        path: "user",
        select: "displayName profileImage",
      },
    })
    .populate("createdBy")
    .populate({
      path: "category",
      select: "name category_name english hindi kannada",
    });

exports.getAllVideosPaginated = async (req, res) => {
  try {
    await ensureVideoCategoryData();

    const homepage = req.query.homepage === "true";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    if (req.query.page !== undefined && Number.isNaN(parseInt(req.query.page, 10))) {
      return res.status(400).json({
        success: false,
        message: "Invalid page. Must be a positive number.",
      });
    }

    const limit = homepage
      ? 10
      : Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 50);

    if (
      !homepage &&
      req.query.limit !== undefined &&
      Number.isNaN(parseInt(req.query.limit, 10))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit. Must be a number between 1 and 50.",
      });
    }

    const filter = {};
    const { category } = req.query;

    if (category !== undefined && category !== "") {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category. Must be a valid ObjectId.",
        });
      }
      filter.category = category;
    }

    const skip = (page - 1) * limit;

    const [data, totalRecords] = await Promise.all([
      populateVideos(
        Videos.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      ),
      Videos.countDocuments(filter),
    ]);

    const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / limit);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalPages > 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
