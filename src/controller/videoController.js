const Videos = require("../models/videoModel");
const Comment = require("../models/commentsModel");
const VideoVersion = require("../models/videoVersionModel");


function normalizeMagazineType(input) {
  if (input == null) return undefined;
  const s = String(input).trim().toLowerCase();
  if (s === "magazine" || s === "mag") return "magazine";
  if (s === "magazine2" || s === "mag2") return "magazine2";
  return "invalid";
}


function normalizeNewsType(input) {
  if (input == null) return undefined;
  const s = String(input).trim().toLowerCase();

  // Accept a few common aliases; store canonical value
  if (["statenews", "state", "state_news"].includes(s)) return "statenews";
  if (["districtnews", "district", "district_news"].includes(s)) return "districtnews";
  if (["specialnews", "special", "special_news"].includes(s)) return "specialnews";

  return "invalid";
}



const { Translate } = require("@google-cloud/translate").v2;

const base64Key = process.env.GOOGLE_CLOUD_KEY_BASE64;
if (!base64Key) {
  throw new Error(
    "GOOGLE_CLOUD_KEY_BASE64 is not set in environment variables"
  );
}
const credentials = JSON.parse(
  Buffer.from(base64Key, "base64").toString("utf-8")
);

const translate = new Translate({ credentials });


// exports.uploadVideo = async (req, res) => {
//   try {
//     const { title, description, thumbnail, video_url, category } = req.body;

//     // Validate required fields
//     if (!title || !description || !thumbnail || !video_url || !category) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Please provide all required fields: title, description, videoThumbnail, videoUrl, category",
//       });
//     }

//     // Define the target languages for translation
//     const targetLanguages = ["en", "kn", "hi"]; // English, Kannada, Hindi

//     // Translate the title and description into each language individually
//     const titleTranslations = await Promise.all(
//       targetLanguages.map(async (lang) => {
//         return await translate.translate(title, lang);
//       })
//     );

//     const descriptionTranslations = await Promise.all(
//       targetLanguages.map(async (lang) => {
//         return await translate.translate(description, lang);
//       })
//     );

//     // Create a new video object with the translations
//     const newVideo = new Videos({
//       title, // Original title
//       description, // Original description
//       english: {
//         title: titleTranslations[0][0], // English translation of the title
//         description: descriptionTranslations[0][0], // English translation of description
//       },
//       kannada: {
//         title: titleTranslations[1][0], // Kannada translation of the title
//         description: descriptionTranslations[1][0], // Kannada translation of description
//       },
//       hindi: {
//         title: titleTranslations[2][0], // Hindi translation of the title
//         description: descriptionTranslations[2][0], // Hindi translation of description
//       },
//       thumbnail,
//       video_url,
//       category, // Assuming 'category' is passed in the request body
//       videoDuration: req.body.videoDuration, // Optional, if provided
//       last_updated: new Date(),
//       createdBy: req.user.id,
//       status: req.user.role === "admin" ? "approved" : "pending",
//     });
//     console.log(newVideo);
//     // Save the new video to the database
//     const savedVideo = await newVideo.save();

//     res.status(201).json({ success: true, data: savedVideo });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// controllers/videoController.js
// controllers/videoController.js

exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, thumbnail, video_url, category, magazineType, newsType } = req.body;

    if (!title || !description || !thumbnail || !video_url || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide: title, description, thumbnail, video_url, category",
      });
    }

    // 🔹 validate magazineType tag (optional)
    const normalizedMagazine = normalizeMagazineType(magazineType);
    if (normalizedMagazine === "invalid") {
      return res.status(400).json({
        success: false,
        message: "Invalid magazineType. Use 'magazine' or 'magazine2'.",
      });
    }

    // 🔹 validate newsType tag (optional)
    const normalizedNews = normalizeNewsType(newsType);
    if (normalizedNews === "invalid") {
      return res.status(400).json({
        success: false,
        message: "Invalid newsType. Use 'statenews', 'districtnews', or 'specialnews'.",
      });
    }

    // translations (unchanged)
    const targetLanguages = ["en", "kn", "hi"];
    const [titleTranslations, descriptionTranslations] = await Promise.all([
      Promise.all(targetLanguages.map((lang) => translate.translate(title, lang))),
      Promise.all(targetLanguages.map((lang) => translate.translate(description, lang))),
    ]);

    const newVideo = new Videos({
      title,
      description,
      english: { title: titleTranslations[0][0], description: descriptionTranslations[0][0] },
      kannada: { title: titleTranslations[1][0], description: descriptionTranslations[1][0] },
      hindi: { title: titleTranslations[2][0], description: descriptionTranslations[2][0] },
      thumbnail,
      video_url,
      category,
      videoDuration: req.body.videoDuration,
      last_updated: new Date(),
      createdBy: req.user.id,
      status: req.user.role === "admin" ? "approved" : "pending",
      magazineType: normalizedMagazine,   // undefined if not provided
      newsType: normalizedNews,           // undefined if not provided
    });

    const savedVideo = await newVideo.save();
    res.status(201).json({ success: true, data: savedVideo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Videos.find().populate({
      path: "Comments", // Populate the Comments array
      populate: {
        // Populate the 'user' field within each comment
        path: "user", // Assuming your Comment model has a 'user' field referencing the User model
        select: "displayName profileImage", // Select which fields from the user you want to include (important for performance)
      },
    })
     .populate("createdBy");

    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVideoId = async (req, res) => {
  try {
    const video = await Videos.findById(req.params.id).populate({
      path: "Comments",
      populate: {
        path: "user",
        select: "displayName profileImage", // Select the fields you need
      },
    });
    res.status(200).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Videos.findByIdAndDelete(req.params.id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "No video found" });
    }
    res.status(200).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.addCommentToVideo = async (req, res) => {
  try {
    const { userId, videoId, text } = req.body;

    const video = await Videos.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    const newComment = new Comment({
      // Create a new Comment document
      user: userId,
      video: videoId,
      comment: text,
    });

    const savedComment = await newComment.save(); // Save the comment FIRST

    video.Comments.push(savedComment._id); // Push the comment's _id into the video's comments array
    await video.save(); // Save the updated video

    res.status(201).json({ success: true, data: savedComment }); // Respond with the saved comment
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.deleteCommentByUserIdAndCommentId = async (req, res) => {
  try {
    const { userId, commentId } = req.body; // Extract userId and commentId

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId or commentId" });
    }

    // Find and delete the comment
    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      user: userId,
    });

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Remove the comment reference from the associated video
    const video = await Video.findOneAndUpdate(
      { comments: commentId }, // Fixed: Use "comments" instead of "Comments"
      { $pull: { comments: commentId } }, // Fixed: Correct field name
      { new: true }
    );

    return res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.getTotalNumberOfVideos = async (req, res) => {
  try {
    const count = await Videos.countDocuments();
    res.status(200).json({ success: true, data: count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getMostLikedVideo = async (req, res) => {
  try {
    // Find the video with the highest number of likes
    const mostLikedVideo = await Videos.findOne().sort({ total_likes: -1 });

    // Check if a video was found
    if (!mostLikedVideo) {
      return res.status(404).json({
        success: false,
        message: "No videos found",
      });
    }

    // Return the most liked video
    res.status(200).json({
      success: true,
      data: mostLikedVideo,
    });
  } catch (error) {
    console.error("Error fetching most liked video:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.updateVideo = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       title,
//       description,
//       thumbnail,
//       video_url,
//       category,
//       videoDuration,
//     } = req.body;

//     // Find the existing video
//     const existingVideo = await Videos.findById(id);
//     if (!existingVideo) {
//       return res.status(404).json({
//         success: false,
//         message: "Video not found",
//       });
//     }

//     // Check if the user is the creator, moderator, or admin
//     const isCreator = existingVideo.createdBy?.toString() === req.user.id;
//     const isAdmin = req.user.role === "admin";
//     const isModerator = req.user.role === "moderator";

//     if (!isCreator && !isAdmin && !isModerator) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized to update this video",
//       });
//     }

//     // STEP 1: Save a version snapshot BEFORE updating
//     const latestVersion = await VideoVersion.find({ videoId: id })
//       .sort({ versionNumber: -1 })
//       .limit(1);

//     const nextVersionNumber = latestVersion.length > 0
//       ? latestVersion[0].versionNumber + 1
//       : 1;

//     const snapshot = {
//       title: existingVideo.title,
//       description: existingVideo.description,
//       english: existingVideo.english,
//       kannada: existingVideo.kannada,
//       hindi: existingVideo.hindi,
//       thumbnail: existingVideo.thumbnail,
//       video_url: existingVideo.video_url,
//       category: existingVideo.category,
//       videoDuration: existingVideo.videoDuration,
//     };

//     await VideoVersion.create({
//       videoId: existingVideo._id,
//       versionNumber: nextVersionNumber,
//       updatedBy: req.user.id,
//       snapshot,
//     });

//     // STEP 2: Define update fields
//     const updateFields = {
//       last_updated: new Date(),
//       videoDuration: videoDuration || existingVideo.videoDuration,
//     };

//     // STEP 3: Translate if title or description is changed
//     if (title || description) {
//       const targetLanguages = ["en", "kn", "hi"];
//       const titleToTranslate = title || existingVideo.title;
//       const descToTranslate = description || existingVideo.description;

//       const [titleTranslations, descriptionTranslations] = await Promise.all([
//         Promise.all(targetLanguages.map((lang) => translate.translate(titleToTranslate, lang))),
//         Promise.all(targetLanguages.map((lang) => translate.translate(descToTranslate, lang))),
//       ]);

//       updateFields.title = title || existingVideo.title;
//       updateFields.description = description || existingVideo.description;
//       updateFields.english = {
//         title: titleTranslations[0][0],
//         description: descriptionTranslations[0][0],
//       };
//       updateFields.kannada = {
//         title: titleTranslations[1][0],
//         description: descriptionTranslations[1][0],
//       };
//       updateFields.hindi = {
//         title: titleTranslations[2][0],
//         description: descriptionTranslations[2][0],
//       };
//     }

//     // STEP 4: Update other fields
//     if (thumbnail) updateFields.thumbnail = thumbnail;
//     if (video_url) updateFields.video_url = video_url;
//     if (category) updateFields.category = category;

//     // STEP 5: Set approval status based on role
//     if (isAdmin) {
//       updateFields.status = "approved";
//     } else if (isModerator || isCreator) {
//       updateFields.status = "pending";
//     }

//     // STEP 6: Perform the update
//     const updatedVideo = await Videos.findByIdAndUpdate(
//       id,
//       { $set: updateFields },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       data: updatedVideo,
//       message: isAdmin
//         ? "Video updated and approved"
//         : "Video updated, awaiting admin approval",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      thumbnail,
      video_url,
      category,
      videoDuration,
      magazineType, // optional tag: "magazine" | "magazine2" | null
      newsType,     // optional tag: "statenews" | "districtnews" | "specialnews" | null
    } = req.body;

    // 1) Find the existing video
    const existingVideo = await Videos.findById(id);
    if (!existingVideo) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    // 2) AuthZ
    const isCreator = existingVideo.createdBy?.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    const isModerator = req.user.role === "moderator";
    if (!isCreator && !isAdmin && !isModerator) {
      return res.status(403).json({ success: false, message: "Not authorized to update this video" });
    }

    // 3) Version snapshot (BEFORE changes)
    const latestVersion = await VideoVersion.find({ videoId: id })
      .sort({ versionNumber: -1 })
      .limit(1);
    const nextVersionNumber = latestVersion.length ? latestVersion[0].versionNumber + 1 : 1;

    await VideoVersion.create({
      videoId: existingVideo._id,
      versionNumber: nextVersionNumber,
      updatedBy: req.user.id,
      snapshot: {
        title: existingVideo.title,
        description: existingVideo.description,
        english: existingVideo.english,
        kannada: existingVideo.kannada,
        hindi: existingVideo.hindi,
        thumbnail: existingVideo.thumbnail,
        video_url: existingVideo.video_url,
        category: existingVideo.category,
        videoDuration: existingVideo.videoDuration,
        magazineType: existingVideo.magazineType,
        newsType: existingVideo.newsType,
      },
    });

    // 4) Build update fields
    const updateFields = {
      last_updated: new Date(),
      // preserve existing if not provided (avoid overwriting with undefined)
      videoDuration:
        typeof videoDuration !== "undefined" ? videoDuration : existingVideo.videoDuration,
    };

    // 5) Translate if title or description changed
    if (title || description) {
      const targetLanguages = ["en", "kn", "hi"];
      const titleToTranslate = title || existingVideo.title;
      const descToTranslate = description || existingVideo.description;

      const [titleTranslations, descriptionTranslations] = await Promise.all([
        Promise.all(targetLanguages.map((lang) => translate.translate(titleToTranslate, lang))),
        Promise.all(targetLanguages.map((lang) => translate.translate(descToTranslate, lang))),
      ]);

      updateFields.title = title || existingVideo.title;
      updateFields.description = description || existingVideo.description;
      updateFields.english = {
        title: titleTranslations[0][0],
        description: descriptionTranslations[0][0],
      };
      updateFields.kannada = {
        title: titleTranslations[1][0],
        description: descriptionTranslations[1][0],
      };
      updateFields.hindi = {
        title: titleTranslations[2][0],
        description: descriptionTranslations[2][0],
      };
    }

    // 6) Other simple fields
    if (thumbnail) updateFields.thumbnail = thumbnail;
    if (video_url) updateFields.video_url = video_url;
    if (category) updateFields.category = category;

    // 7) Validate & set/clear magazineType tag (matches your enum: "magazine" | "magazine2")
    if (typeof magazineType !== "undefined") {
      const normalizedMagazine = normalizeMagazineType(magazineType); // you already have this helper
      if (normalizedMagazine === "invalid") {
        return res.status(400).json({
          success: false,
          message: "Invalid magazineType. Use 'magazine' or 'magazine2'.",
        });
      }
      if (normalizedMagazine === undefined) {
        // explicit clear (e.g., sending null)
        updateFields.$unset = { ...(updateFields.$unset || {}), magazineType: "" };
      } else {
        updateFields.magazineType = normalizedMagazine;
      }
    }

    // 8) Validate & set/clear newsType tag (matches your enum: "statenews" | "districtnews" | "specialnews")
    if (typeof newsType !== "undefined") {
      const normalizedNews = normalizeNewsType(newsType); // add the helper if not present
      if (normalizedNews === "invalid") {
        return res.status(400).json({
          success: false,
          message: "Invalid newsType. Use 'statenews', 'districtnews', or 'specialnews'.",
        });
      }
      if (normalizedNews === undefined) {
        updateFields.$unset = { ...(updateFields.$unset || {}), newsType: "" };
      } else {
        updateFields.newsType = normalizedNews;
      }
    }

    // 9) Role-based status
    if (isAdmin) updateFields.status = "approved";
    else if (isModerator || isCreator) updateFields.status = "pending";

    // 10) Apply update
    const updateOps = { $set: updateFields };
    if (updateFields.$unset) {
      updateOps.$unset = updateFields.$unset;
      delete updateFields.$unset;
    }

    const updatedVideo = await Videos.findByIdAndUpdate(id, updateOps, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: updatedVideo,
      message: isAdmin ? "Video updated and approved" : "Video updated, awaiting admin approval",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


exports.approveVideo = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admins can approve videos" });
    }

    const { id } = req.params;
    const video = await Videos.findById(id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    if (video.status === "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Video already approved" });
    }

    video.status = "approved";
    video.approvedBy = user.id; // you may want to add these fields to your schema
    video.approvedAt = new Date();
    await video.save();

    res.json({ success: true, data: video });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getVideoHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const versions = await VideoVersion.find({ videoId: id })
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

//just swaps the previous versions

// exports.revertVideoToVersion = async (req, res) => {
//   try {
//     const { id, versionNumber } = req.params;

//     const version = await VideoVersion.findOne({ videoId: id, versionNumber });
//     if (!version) {
//       return res.status(404).json({ success: false, message: "Version not found" });
//     }

//     const snapshot = version.snapshot;
//     delete snapshot._id;
//     delete snapshot.__v;

//     const reverted = await Videos.findByIdAndUpdate(id, snapshot, { new: true });

//     res.status(200).json({ success: true, data: reverted });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


exports.revertVideoToVersion = async (req, res) => {
  try {
    const { id, versionNumber } = req.params;
const currentVersionNumber = parseInt(versionNumber);
    const targetVersionNumber = currentVersionNumber - 1;

     const targetVersion = await VideoVersion.findOne({
          videoId: id,
          versionNumber: targetVersionNumber,
        });

         if (!targetVersion) {
      return res.status(404).json({ success: false, message: "Target version not found." });
    }

    await VideoVersion.deleteOne({
          videoId: id,
          versionNumber: currentVersionNumber,
        });
        res.status(200).json({ success: true, message: "Reverted and cleaned up successfully" });
  } catch (error) {
    console.error("Error in revertAndDeleteCurrentVersion:", error);
    res.status(500).json({ success: false, message: error.message });
  }


  

  //   const version = await VideoVersion.findOne({ videoId: id, versionNumber });
  //   if (!version) {
  //     return res.status(404).json({ success: false, message: "Version not found" });
  //   }

  //   const snapshot = { ...version.snapshot };
  //   delete snapshot._id;
  //   delete snapshot.__v;

  //   const reverted = await Videos.findByIdAndUpdate(
  //     id,
  //     snapshot,
  //     { new: true, context: { skipVersioning: true } } // signal to skip versioning
  //   );

  //   res.status(200).json({ success: true, data: reverted });
  // } catch (error) {
  //   res.status(500).json({ success: false, message: error.message });
  // }
};


exports.deleteVersion = async (req, res) => {
  try {
    const { id, versionNumber } = req.params;

    const deleted = await VideoVersion.findOneAndDelete({ videoId: id, versionNumber });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }

    // STEP 2: Renumber all remaining versions sequentially
    const versions = await VideoVersion.find({ videoId: id }).sort({ versionNumber: 1 });

    for (let i = 0; i < versions.length; i++) {
      versions[i].versionNumber = i + 1;
      await versions[i].save();
    }

    res.status(200).json({ success: true, message: "Version deleted and renumbered successfully" });
  } catch (error) {
    console.error("Error in deleteVersion:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

