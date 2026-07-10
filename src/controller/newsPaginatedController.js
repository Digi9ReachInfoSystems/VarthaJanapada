const News = require("../models/newsModel");

const VALID_NEWS_TYPES = [
  "statenews",
  "districtnews",
  "specialnews",
  "articles",
  "combinedlatestnews",
];
const VALID_MAGAZINE_TYPES = ["magazine", "magazine2"];
const HOMEPAGE_LIMIT = 10;
const SPECIAL_NEWS_HOMEPAGE_SLOTS = 4;

function buildCombinedLatestFilter(magazineType) {
  const filter = { newsType: { $in: ["statenews", "specialnews"] } };
  if (magazineType) {
    filter.magazineType = magazineType;
  }
  return filter;
}

function sortByCreatedTimeDesc(items) {
  return items.sort(
    (a, b) => new Date(b.createdTime) - new Date(a.createdTime)
  );
}

async function fetchCombinedHomepageNews(filter) {
  const stateNewsSlots = HOMEPAGE_LIMIT - SPECIAL_NEWS_HOMEPAGE_SLOTS;

  const [specialNews, stateNews, totalRecords] = await Promise.all([
    News.find({ ...filter, newsType: "specialnews" })
      .sort({ createdTime: -1 })
      .limit(SPECIAL_NEWS_HOMEPAGE_SLOTS),
    News.find({ ...filter, newsType: "statenews" })
      .sort({ createdTime: -1 })
      .limit(stateNewsSlots),
    News.countDocuments(filter),
  ]);

  const data = sortByCreatedTimeDesc([...specialNews, ...stateNews]);
  const totalPages =
    totalRecords === 0 ? 0 : Math.ceil(totalRecords / HOMEPAGE_LIMIT);

  return { data, totalRecords, totalPages, limit: HOMEPAGE_LIMIT };
}

async function fetchCombinedPaginatedNews(filter, skip, limit) {
  const [data, totalRecords] = await Promise.all([
    News.find(filter).sort({ createdTime: -1 }).skip(skip).limit(limit),
    News.countDocuments(filter),
  ]);

  const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / limit);
  return { data, totalRecords, totalPages, limit };
}

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
          "Invalid newsType. Use 'statenews', 'districtnews', 'specialnews', 'articles', or 'combinedlatestnews'.",
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

    if (newsType === "combinedlatestnews" && homepage) {
      const filter = buildCombinedLatestFilter(magazineResult.magazineType);
      const result = await fetchCombinedHomepageNews(filter);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          currentPage: 1,
          totalPages: result.totalPages,
          totalRecords: result.totalRecords,
          limit: result.limit,
          hasNextPage: result.totalPages > 1,
          hasPreviousPage: false,
        },
      });
    }

    const filter =
      newsType === "combinedlatestnews"
        ? buildCombinedLatestFilter(magazineResult.magazineType)
        : { newsType };
    if (newsType !== "combinedlatestnews" && magazineResult.magazineType) {
      filter.magazineType = magazineResult.magazineType;
    }

    let data;
    let totalRecords;
    let totalPages;
    let responseLimit;

    if (newsType === "combinedlatestnews") {
      const result = await fetchCombinedPaginatedNews(filter, skip, limit);
      data = result.data;
      totalRecords = result.totalRecords;
      totalPages = result.totalPages;
      responseLimit = result.limit;
    } else {
      [data, totalRecords] = await Promise.all([
        News.find(filter).sort({ createdTime: -1 }).skip(skip).limit(limit),
        News.countDocuments(filter),
      ]);
      totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / limit);
      responseLimit = limit;
    }

    res.status(200).json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        limit: responseLimit,
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
    const filter = buildCombinedLatestFilter(magazineResult.magazineType);

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
