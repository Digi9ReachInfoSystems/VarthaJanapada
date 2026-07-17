const LiveTV = require("../models/liveTvModel");

/**
 * Extract YouTube video ID from common URL shapes or a bare ID.
 */
function extractYoutubeVideoId(input) {
  if (!input || typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    return raw;
  }

  const patterns = [
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i,
    /youtube\.com\/watch\?[^#]*v=([a-zA-Z0-9_-]{11})/i,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) return match[1];
  }

  try {
    const url = new URL(raw);
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  } catch (_) {
    // not a valid URL
  }

  return null;
}

function toPublicPayload(doc) {
  if (!doc) {
    return {
      title: "Live TV",
      isOnline: false,
      youtubeVideoId: "",
      playbackUrl: "",
      thumbnail: "",
      embedUrl: null,
    };
  }

  const youtubeVideoId = doc.youtubeVideoId || "";
  return {
    title: doc.title || "Live TV",
    isOnline: Boolean(doc.isOnline),
    youtubeVideoId,
    playbackUrl: doc.playbackUrl || "",
    thumbnail: doc.thumbnail || "",
    embedUrl: youtubeVideoId
      ? `https://www.youtube.com/embed/${youtubeVideoId}`
      : null,
    updatedAt: doc.updatedAt || null,
  };
}

exports.upsertLiveTv = async (req, res) => {
  try {
    const { title, playbackUrl, isOnline, thumbnail } = req.body || {};

    const wantsOnline = isOnline === true || isOnline === "true";
    let youtubeVideoId = "";
    let normalizedUrl =
      typeof playbackUrl === "string" ? playbackUrl.trim() : "";

    if (wantsOnline) {
      if (!normalizedUrl) {
        return res.status(400).json({
          success: false,
          message: "playbackUrl is required when isOnline is true",
        });
      }
      youtubeVideoId = extractYoutubeVideoId(normalizedUrl);
      if (!youtubeVideoId) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid YouTube URL. Use /live/, watch?v=, youtu.be/, embed/, or shorts/ links.",
        });
      }
    } else if (normalizedUrl) {
      youtubeVideoId = extractYoutubeVideoId(normalizedUrl) || "";
    }

    const update = {
      isOnline: wantsOnline,
      updatedBy: req.user?.id || req.user?._id,
    };

    if (typeof title === "string" && title.trim()) {
      update.title = title.trim();
    }
    if (normalizedUrl) {
      update.playbackUrl = normalizedUrl;
    }
    if (youtubeVideoId) {
      update.youtubeVideoId = youtubeVideoId;
      if (!thumbnail) {
        update.thumbnail = `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
      }
    }
    if (typeof thumbnail === "string" && thumbnail.trim()) {
      update.thumbnail = thumbnail.trim();
    }

    const doc = await LiveTV.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    return res.status(200).json({
      success: true,
      message: wantsOnline ? "Live TV is online" : "Live TV updated",
      data: toPublicPayload(doc),
    });
  } catch (error) {
    console.error("upsertLiveTv error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Live TV",
      error: error.message,
    });
  }
};

exports.getLiveTv = async (req, res) => {
  try {
    const doc = await LiveTV.findOne().lean();
    return res.status(200).json({
      success: true,
      data: toPublicPayload(doc),
    });
  } catch (error) {
    console.error("getLiveTv error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Live TV",
      error: error.message,
    });
  }
};

exports.setLiveTvOffline = async (req, res) => {
  try {
    const doc = await LiveTV.findOneAndUpdate(
      {},
      {
        isOnline: false,
        updatedBy: req.user?.id || req.user?._id,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Live TV is offline",
      data: toPublicPayload(doc),
    });
  } catch (error) {
    console.error("setLiveTvOffline error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set Live TV offline",
      error: error.message,
    });
  }
};
