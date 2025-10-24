const User = require("../models/userModel");
const News = require("../models/newsModel");
const Video = require("../models/videoModel");
const LongVideo = require("../models/longVideoModel");
const Magazine = require("../models/magazineModel");
const Magazine2 = require("../models/magazineModel2");

const modelMap = {
  news: { ref: News, path: "playlist.newsplaylist", field: "newsId" },
  shortvideo: { ref: Video, path: "playlist.shortvideoplaylist", field: "videoId" },
  longvideo: { ref: LongVideo, path: "playlist.longvideoplaylist", field: "videoId" },
  varthajanapada: { ref: Magazine, path: "playlist.varthaJanapadaplaylist", field: "magazineId" },
  marchofkarnataka: { ref: Magazine2, path: "playlist.marchofkarnatakaplaylist", field: "magazineId" },
};

// ➕ Add to playlist
exports.addToPlaylist = async (req, res) => {
  try {
    const { userId, itemId, type } = req.body;
    if (!userId || !itemId || !type)
      return res.status(400).json({ success: false, message: "userId, itemId, and type are required" });

    const map = modelMap[type.toLowerCase()];
    if (!map)
      return res.status(400).json({ success: false, message: "Invalid type specified" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const Model = map.ref;
    const item = await Model.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: `${type} not found` });

    const playlistArr = user.playlist[type.toLowerCase() + "playlist"] || [];
    const alreadyExists = playlistArr.some((p) => p[map.field] && p[map.field].toString() === itemId);
    if (alreadyExists)
      return res.status(400).json({ success: false, message: `${type} already in playlist` });

    playlistArr.push({ [map.field]: itemId });
    user.playlist[type.toLowerCase() + "playlist"] = playlistArr;

    await user.save();
    return res.status(200).json({ success: true, message: `${type} added to playlist`, playlist: playlistArr });
  } catch (error) {
    console.error("Error adding to playlist:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ➖ Remove from playlist
exports.removeFromPlaylist = async (req, res) => {
  try {
    const { userId, itemId, type } = req.body;
    if (!userId || !itemId || !type)
      return res.status(400).json({ success: false, message: "userId, itemId, and type are required" });

    const map = modelMap[type.toLowerCase()];
    if (!map)
      return res.status(400).json({ success: false, message: "Invalid type specified" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const playlistArr = user.playlist[type.toLowerCase() + "playlist"] || [];
    user.playlist[type.toLowerCase() + "playlist"] = playlistArr.filter(
      (p) => p[map.field] && p[map.field].toString() !== itemId
    );

    await user.save();
    return res.status(200).json({
      success: true,
      message: `${type} removed from playlist`,
      playlist: user.playlist[type.toLowerCase() + "playlist"],
    });
  } catch (error) {
    console.error("Error removing from playlist:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// 📄 Get playlist by type
exports.getAllPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required in request parameters",
      });
    }

    const user = await User.findById(userId)
      .populate("playlist.newsplaylist.newsId")
      .populate("playlist.shortvideoplaylist.videoId")
      .populate("playlist.longvideoplaylist.videoId")
      .populate("playlist.varthaJanapadaplaylist.magazineId")
      .populate("playlist.marchofkarnatakaplaylist.magazineId");

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    res.status(200).json({
      success: true,
      message: "Fetched all playlists successfully",
      playlists: {
        newsplaylist: user.playlist.newsplaylist || [],
        shortvideoplaylist: user.playlist.shortvideoplaylist || [],
        longvideoplaylist: user.playlist.longvideoplaylist || [],
        varthaJanapadaplaylist: user.playlist.varthaJanapadaplaylist || [],
        marchofkarnatakaplaylist: user.playlist.marchofkarnatakaplaylist || [],
      },
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};
