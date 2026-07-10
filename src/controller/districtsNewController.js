const District = require("../models/districtModel");
const News = require("../models/newsModel");

const VALID_MAGAZINE_TYPES = ["magazine", "magazine2"];

function formatDistrict(doc) {
  if (!doc) return null;
  return {
    _id: doc._id,
    district_name: doc.district_name,
    district_slug: doc.district_slug,
    district_code: doc.district_code,
    english: doc.english,
    hindi: doc.hindi,
    kannada: doc.kannada,
  };
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

function parseDateQuery(req, res) {
  const { date } = req.query;

  if (date === undefined) {
    return { ok: true, dateRange: undefined };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({
      success: false,
      message: "Invalid date. Use YYYY-MM-DD format.",
    });
    return { ok: false };
  }

  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    res.status(400).json({
      success: false,
      message: "Invalid date.",
    });
    return { ok: false };
  }

  return {
    ok: true,
    dateRange: { publishedAt: { $gte: start, $lte: end } },
  };
}

function parsePaginationQuery(req, res) {
  const homepage = req.query.homepage === "true";
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  if (req.query.page !== undefined && Number.isNaN(parseInt(req.query.page, 10))) {
    res.status(400).json({
      success: false,
      message: "Invalid page. Must be a positive number.",
    });
    return { ok: false };
  }

  const limit = homepage
    ? 10
    : Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

  if (
    !homepage &&
    req.query.limit !== undefined &&
    Number.isNaN(parseInt(req.query.limit, 10))
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid limit. Must be a number between 1 and 50.",
    });
    return { ok: false };
  }

  return { ok: true, homepage, page, limit, skip: (page - 1) * limit };
}

function buildDistrictNewsFilter({ districtSlug, magazineType, dateRange }) {
  const filter = { newsType: "districtnews" };

  if (districtSlug) {
    filter.district_slug = districtSlug;
  }
  if (magazineType) {
    filter.magazineType = magazineType;
  }
  if (dateRange) {
    Object.assign(filter, dateRange);
  }

  return filter;
}

async function fetchDistrictNewsPaginated(filter, page, limit, skip) {
  const [news, totalRecords] = await Promise.all([
    News.find(filter).sort({ createdTime: -1 }).skip(skip).limit(limit),
    News.countDocuments(filter),
  ]);

  const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / limit);

  return {
    news,
    totalRecords,
    totalPages,
    limit,
    page,
  };
}

function buildNewsResponse({ district, result }) {
  return {
    success: true,
    district,
    data: {
      news: result.news,
      total: result.totalRecords,
      page: result.page,
      page_size: result.limit,
    },
    pagination: {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalRecords: result.totalRecords,
      limit: result.limit,
      hasNextPage: result.page < result.totalPages,
      hasPreviousPage: result.page > 1 && result.totalPages > 0,
    },
  };
}

exports.listDistricts = async (req, res) => {
  try {
    const districts = await District.find().sort({ district_name: 1 });

    res.status(200).json({
      success: true,
      data: { districts },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllDistrictNews = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req, res);
    if (!pagination.ok) return;

    const magazineResult = parseMagazineTypeQuery(req, res);
    if (!magazineResult.ok) return;

    const dateResult = parseDateQuery(req, res);
    if (!dateResult.ok) return;

    const filter = buildDistrictNewsFilter({
      magazineType: magazineResult.magazineType,
      dateRange: dateResult.dateRange,
    });

    const result = await fetchDistrictNewsPaginated(
      filter,
      pagination.page,
      pagination.limit,
      pagination.skip
    );

    res.status(200).json(buildNewsResponse({ district: null, result }));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDistrictNewsBySlug = async (req, res) => {
  try {
    const districtSlug = String(req.params.districtSlug || "")
      .trim()
      .toLowerCase();

    if (!districtSlug) {
      return res.status(400).json({
        success: false,
        message: "Invalid district slug.",
      });
    }

    const districtDoc = await District.findOne({ district_slug: districtSlug });
    if (!districtDoc) {
      return res.status(404).json({
        success: false,
        message: "District not found.",
      });
    }

    const pagination = parsePaginationQuery(req, res);
    if (!pagination.ok) return;

    const magazineResult = parseMagazineTypeQuery(req, res);
    if (!magazineResult.ok) return;

    const dateResult = parseDateQuery(req, res);
    if (!dateResult.ok) return;

    const filter = buildDistrictNewsFilter({
      districtSlug,
      magazineType: magazineResult.magazineType,
      dateRange: dateResult.dateRange,
    });

    const result = await fetchDistrictNewsPaginated(
      filter,
      pagination.page,
      pagination.limit,
      pagination.skip
    );

    res.status(200).json(
      buildNewsResponse({ district: formatDistrict(districtDoc), result })
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
