const Magazine = require("../models/magazineModel"); // Capital 'M' for model
const { search } = require("../routes/newsRoutes");
const { Translate } = require("@google-cloud/translate").v2;
const MagazineVersion = require("../models/magazineVersionModel");

const MONTH_ORDER = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const getMonthRank = (month) =>
  MONTH_ORDER[String(month || "").toLowerCase()] || 0;

/** Latest first: year desc → month desc (Dec→Jan) → createdTime desc */
const sortMagazinesLatestFirst = (magazines) =>
  [...magazines].sort((a, b) => {
    const yearA = parseInt(a.publishedYear, 10) || 0;
    const yearB = parseInt(b.publishedYear, 10) || 0;
    if (yearA !== yearB) return yearB - yearA;

    const monthA = getMonthRank(a.publishedMonth);
    const monthB = getMonthRank(b.publishedMonth);
    if (monthA !== monthB) return monthB - monthA;

    return new Date(b.createdTime || 0) - new Date(a.createdTime || 0);
  });

const createMagazine = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!description) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    const newMagazine = new Magazine({
      title,
      description,
      publishedDate: req.body.publishedDate,
      publishedMonth: req.body.publishedMonth,
      publishedYear: req.body.publishedYear,
      magazineThumbnail: req.body.magazineThumbnail,
      magazinePdf: req.body.magazinePdf,
      editionNumber: req.body.editionNumber,
      last_updated: new Date(),
      createdBy: req.user.id,
      status: req.user.role === "admin" ? "approved" : "pending",
    });

    const savedMagazine = await newMagazine.save();
    res.status(201).json({ success: true, data: savedMagazine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



const getMagazines = async (req, res) => {
  try {
    const { publishedYear, publishedMonth, homepage, editionNumber } =
      req.query; // Extract query parameters

    // Build the filter object based on provided query parameters
    const filter = {};

    // Add conditions to the filter object if they exist in the query parameters
    if (publishedYear) {
      filter.publishedYear = publishedYear;
    }

    if (publishedMonth) {
      filter.publishedMonth = publishedMonth;
    }
    if (editionNumber !== undefined && editionNumber !== "0") {
      if (editionNumber.trim() !== "") {
        filter.editionNumber = editionNumber.trim();
      }
    }

    const isHomepage = homepage === "true" || homepage === true;

    let magazines = await Magazine.find(filter).populate("createdBy");
    magazines = sortMagazinesLatestFirst(magazines);
    if (isHomepage) {
      magazines = magazines.slice(0, 10);
    }

    res.status(200).json({ success: true, data: magazines });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getMagazineById = async (req, res) => {
  try {
    const magazine = await Magazine.findById(req.params.id) ; // Use 'Magazine'
    if (!magazine) {
      // Check if magazine exists
      return res
        .status(404)
        .json({ success: false, message: "Magazine not found" ,data:allMa});
    }
    res.status(200).json({ success: true, data: magazine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteMagazine = async (req, res) => {
  try {
    const deletedMagazine = await Magazine.findByIdAndDelete(req.params.id); // Use 'Magazine'
    if (!deletedMagazine) {
      return res
        .status(404)
        .json({ success: false, message: "Magazine not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Magazine deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const searchMagazine = async (req, res) => {
  try {
    const { query } = req.query; // Use req.query for search parameters

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const magazineList = await Magazine.find({
      title: { $regex: query, $options: "i" }, // Case-insensitive search
    }).sort({ createdTime: -1 }); // Sort by createdTime (if needed)

    if (magazineList.length === 0) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "No magazines found matching the search criteria",
      });
    }

    res.status(200).json({ success: true, data: magazineList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTotalMagazines = async (req, res) => {
  try {
    const totalMagazines = await Magazine.countDocuments();
    res.status(200).json({ success: true, data: totalMagazines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateMagazineController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const magazine = await Magazine.findById(id);
    if (!magazine) {
      return res.status(404).json({ success: false, message: "Magazine not found" });
    }

    // Save version snapshot before update
    const versionCount = await MagazineVersion.countDocuments({ magazineId: id });
    await MagazineVersion.create({
      magazineId: magazine._id,
      versionNumber: versionCount + 1,
      updatedBy: req.user.id,
      snapshot: magazine.toObject(),
    });

    // Apply updates (no translation)
    if (updatedData.title !== undefined) magazine.title = updatedData.title;
    if (updatedData.description !== undefined) magazine.description = updatedData.description;
    if (updatedData.magazineThumbnail !== undefined) magazine.magazineThumbnail = updatedData.magazineThumbnail;
    if (updatedData.magazinePdf !== undefined) magazine.magazinePdf = updatedData.magazinePdf;
    if (updatedData.editionNumber !== undefined) magazine.editionNumber = updatedData.editionNumber;
    if (updatedData.publishedMonth !== undefined) magazine.publishedMonth = updatedData.publishedMonth;
    if (updatedData.publishedYear !== undefined) magazine.publishedYear = updatedData.publishedYear;

    magazine.last_updated = new Date();
    if (req.user.role === "moderator") magazine.status = "pending";

    const updatedMagazine = await magazine.save();

    res.status(200).json({
      success: true,
      data: updatedMagazine,
      message: "Magazine updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const approveMagazine = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = { status: "approved" };
    const updatedMagazine = await Magazine.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!updatedMagazine) {
      return res.status(404).json({ success: false, message: "Magazine not found" });
    }
    res.status(200).json({ success: true, data: updatedMagazine });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

const getMagazineHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const versions = await MagazineVersion.find({ magazineId: id })
      .populate("updatedBy", "displayName email")
      .sort({ versionNumber: -1 });

    if (!versions.length) {
      return res.status(404).json({ success: false, message: "No version history found" });
    }

    res.status(200).json({ success: true, data: versions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const revertMagazineToVersion = async (req, res) => {
  try {
    const { id, versionNumber } = req.params;

    const currentVersionNumber = parseInt(versionNumber);
    const targetVersionNumber = currentVersionNumber - 1;

    const targetVersion = await MagazineVersion.findOne({
      magazineId: id,
      versionNumber: targetVersionNumber,
    });

    if (!targetVersion) {
      return res.status(404).json({ success: false, message: "Target version not found." });
    }

    await Magazine.updateOne({ _id: id }, targetVersion.snapshot);

    await MagazineVersion.deleteOne({
      magazineId: id,
      versionNumber: currentVersionNumber,
    });

    res.status(200).json({ success: true, message: "Reverted and cleaned up successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteMagazineVersion = async (req, res) => {
  try {
    const { id, versionNumber } = req.params;

    const deleted = await MagazineVersion.findOneAndDelete({
      magazineId: id,
      versionNumber,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }

    // Renumber remaining versions
    const remainingVersions = await MagazineVersion.find({ magazineId: id }).sort({ versionNumber: 1 });
    for (let i = 0; i < remainingVersions.length; i++) {
      remainingVersions[i].versionNumber = i + 1;
      await remainingVersions[i].save();
    }

    res.status(200).json({
      success: true,
      message: "Version deleted and renumbered successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};






const getMagazinesByYear = async (req, res) => {
  try {
    const { year } = req.params;

    // ✅ Validate year format (must be 4 digits)
    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year format. Use YYYY (e.g., 2025)",
      });
    }

    // ✅ Fetch all magazines for the given year
    const magazines = await Magazine.find({ publishedYear: year })
      .populate("createdBy", "displayName email role")
      .lean(); // lean for faster read ops

    const sortedMagazines = sortMagazinesLatestFirst(magazines);

    // ✅ Return sorted response
    res.status(200).json({
      success: true,
      message: `Magazines found for year ${year}`,
      count: sortedMagazines.length,
      data: sortedMagazines,
    });
  } catch (error) {
    console.error("Error fetching magazines by year:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};



const User = require("../models/userModel");

// ➕ Add magazine to playlist
const addMagazineToPlaylist = async (req, res) => {
  try {
    const { userId, magazineId } = req.body;

    if (!userId || !magazineId) {
      return res
        .status(400)
        .json({ success: false, message: "userId and magazineId are required" });
    }

  const user = await User.findById(userId);
if (!user) return res.status(404).json({ success: false, message: "User not found" });

// ensure nested playlist array exists
if (!user.playlist) user.playlist = {};
if (!user.playlist.varthaJanapadaplaylist)
  user.playlist.varthaJanapadaplaylist = [];

const magazine = await Magazine.findById(magazineId);
if (!magazine)
  return res.status(404).json({ success: false, message: "Magazine not found" });

// Prevent duplicates
const alreadyExists = user.playlist.varthaJanapadaplaylist.some(
  (item) => item.magazineId && item.magazineId.toString() === magazineId
);
if (alreadyExists)
  return res
    .status(400)
    .json({ success: false, message: "Magazine already in playlist" });

user.playlist.varthaJanapadaplaylist.push({ magazineId });
await user.save();


    res.status(200).json({
      success: true,
      message: "Magazine added to playlist successfully",
      playlist: user.playlist.varthaJanapadaplaylist,
    });
  } catch (error) {
    console.error("Error adding magazine to playlist:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ➖ Remove magazine from playlist
const removeMagazineFromPlaylist = async (req, res) => {
  try {
    const { userId, magazineId } = req.body;

    // Validate input
    if (!userId || !magazineId) {
      return res
        .status(400)
        .json({ success: false, message: "userId and magazineId are required" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // Ensure playlist structure exists
    if (!user.playlist) user.playlist = {};
    if (!user.playlist.varthaJanapadaplaylist)
      user.playlist.varthaJanapadaplaylist = [];

    // Remove the magazine safely
    user.playlist.varthaJanapadaplaylist = user.playlist.varthaJanapadaplaylist.filter(
      (item) => item.magazineId && item.magazineId.toString() !== magazineId
    );

    // Save updated user
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Magazine removed from playlist successfully",
      playlist: user.playlist.varthaJanapadaplaylist,
    });
  } catch (error) {
    console.error("Error removing magazine from playlist:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};



// 📄 Get user's magazine playlist
const getMagazinePlaylist = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "playlist.varthaJanapadaplaylist.magazineId"
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      playlist: user.playlist.varthaJanapadaplaylist,
    });
  } catch (error) {
    console.error("Error fetching magazine playlist:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};



module.exports = {
  createMagazine,
  getMagazines,
  getMagazineById,
  deleteMagazine,
  searchMagazine,
  getTotalMagazines,
  updateMagazineController,
  approveMagazine,
  getMagazineHistory,
  revertMagazineToVersion,
  deleteMagazineVersion,
  getMagazinesByYear,
  addMagazineToPlaylist,
  removeMagazineFromPlaylist,
  getMagazinePlaylist
};
