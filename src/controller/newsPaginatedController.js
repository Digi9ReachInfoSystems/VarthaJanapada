const News = require("../models/newsModel");

const VALID_NEWS_TYPES = ["statenews", "districtnews", "specialnews", "articles"];
const VALID_MAGAZINE_TYPES = ["magazine", "magazine2"];

function parseMagazineTypeQuery(req, res) {
  const { magazineType } = req.query;

  if (magazineType === undefined) {
    return { ok: true, magazineType: undefined };
  }

  if (!VALID_MAGAZINE_TYPES.includes(magazineType)) {
    res.status(400).json({
      success: false,
      message: "Invalid magazineType. Use 'magazine' or 'magazine2'.",
    });
    return { ok: false };
  }

  return { ok: true, magazineType };
}

exports.getNewsByNewsTypePaginated = async (req, res) => {
  try {
    const { newsType } = req.params;

    if (!VALID_NEWS_TYPES.includes(newsType)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid newsType. Use 'statenews', 'districtnews', 'specialnews', or 'articles'.",
      });
    }

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
      : Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

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

    const magazineResult = parseMagazineTypeQuery(req, res);
    if (!magazineResult.ok) return;

    const skip = (page - 1) * limit;
    const filter = { newsType };
    if (magazineResult.magazineType) {
      filter.magazineType = magazineResult.magazineType;
    }

    const [data, totalRecords] = await Promise.all([
      News.find(filter).sort({ createdTime: -1 }).skip(skip).limit(limit),
      News.countDocuments(filter),
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

exports.getLatestCombinedNewsPaginated = async (req, res) => {
  try {
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
      : Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

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

    const magazineResult = parseMagazineTypeQuery(req, res);
    if (!magazineResult.ok) return;

    const skip = (page - 1) * limit;
    const filter = { newsType: { $in: ["statenews", "specialnews"] } };
    if (magazineResult.magazineType) {
      filter.magazineType = magazineResult.magazineType;
    }

    const [data, totalRecords] = await Promise.all([
      News.find(filter).sort({ createdTime: -1 }).skip(skip).limit(limit),
      News.countDocuments(filter),
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
