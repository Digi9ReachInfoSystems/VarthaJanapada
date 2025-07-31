const News = require("../models/newsModel");
const Magazine = require("../models/magazineModel");
const Magazine2 = require("../models/magazineModel2");

exports.searchAllContent = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp(query, "i"); // case-insensitive regex

    const [newsResults, magazine1Results, magazine2Results] = await Promise.all([
      News.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { "hindi.title": searchRegex },
          { "hindi.description": searchRegex },
          { "kannada.title": searchRegex },
          { "kannada.description": searchRegex },
          { "English.title": searchRegex },
          { "English.description": searchRegex },
        ],
      }),

      Magazine.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { "hindi.title": searchRegex },
          { "hindi.description": searchRegex },
          { "kannada.title": searchRegex },
          { "kannada.description": searchRegex },
          { "english.title": searchRegex },
          { "english.description": searchRegex },
        ],
      }),

      Magazine2.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { "hindi.title": searchRegex },
          { "hindi.description": searchRegex },
          { "kannada.title": searchRegex },
          { "kannada.description": searchRegex },
          { "english.title": searchRegex },
          { "english.description": searchRegex },
        ],
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Search results fetched",
      data: {
        news: newsResults,
        magazine1: magazine1Results,
        magazine2: magazine2Results,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
};
