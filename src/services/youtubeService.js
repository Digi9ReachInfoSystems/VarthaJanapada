const axios = require("axios");

const YT_BASE = "https://www.googleapis.com/youtube/v3";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const SHORTS_MAX_SECONDS = 60;
const FETCH_PAGE_SIZE = 50;

const cache = {
  catalog: null,
  catalogExpiresAt: 0,
  live: null,
  liveExpiresAt: 0,
  uploadsPlaylistId: null,
};

function getConfig() {
  const apiKey = (process.env.YOUTUBE_API_KEY || "").trim();
  const channelId = (process.env.YOUTUBE_CHANNEL_ID || "").trim();
  if (!apiKey || !channelId) {
    const err = new Error(
      "YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID must be set in .env"
    );
    err.statusCode = 500;
    throw err;
  }
  return { apiKey, channelId };
}

function parseDurationSeconds(isoDuration) {
  if (!isoDuration || typeof isoDuration !== "string") return null;
  const match = isoDuration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i
  );
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function pickThumbnail(snippet) {
  const thumbs = snippet?.thumbnails || {};
  return (
    thumbs.high?.url ||
    thumbs.medium?.url ||
    thumbs.default?.url ||
    ""
  );
}

function mapVideoItem(video, { isShort = false } = {}) {
  const videoId = video.id;
  const snippet = video.snippet || {};
  return {
    videoId,
    title: snippet.title || "",
    thumbnail: pickThumbnail(snippet),
    publishedAt: snippet.publishedAt || "",
    url: isShort
      ? `https://www.youtube.com/shorts/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`,
  };
}

function isShortVideo(video) {
  const title = (video.snippet?.title || "").toLowerCase();
  const desc = (video.snippet?.description || "").toLowerCase();
  if (title.includes("#shorts") || desc.includes("#shorts")) return true;
  const durationSec = parseDurationSeconds(video.contentDetails?.duration);
  return durationSec !== null && durationSec > 0 && durationSec <= SHORTS_MAX_SECONDS;
}

function isCurrentlyLive(video) {
  const liveDetails = video.liveStreamingDetails;
  if (!liveDetails) return false;
  if (video.snippet?.liveBroadcastContent === "live") return true;
  return Boolean(liveDetails.actualStartTime && !liveDetails.actualEndTime);
}

async function ytGet(path, params) {
  const { apiKey } = getConfig();
  const { data } = await axios.get(`${YT_BASE}/${path}`, {
    params: { ...params, key: apiKey },
    timeout: 15000,
  });
  return data;
}

async function getUploadsPlaylistId() {
  if (cache.uploadsPlaylistId) return cache.uploadsPlaylistId;
  const { channelId } = getConfig();
  const data = await ytGet("channels", {
    part: "contentDetails",
    id: channelId,
  });
  const playlistId =
    data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) {
    const err = new Error("Could not resolve uploads playlist for channel");
    err.statusCode = 404;
    throw err;
  }
  cache.uploadsPlaylistId = playlistId;
  return playlistId;
}

async function fetchRecentVideoDetails(maxItems = 50) {
  const playlistId = await getUploadsPlaylistId();
  const playlistData = await ytGet("playlistItems", {
    part: "contentDetails",
    playlistId,
    maxResults: Math.min(maxItems, FETCH_PAGE_SIZE),
  });

  const videoIds = (playlistData.items || [])
    .map((item) => item.contentDetails?.videoId)
    .filter(Boolean);

  if (!videoIds.length) {
    return [];
  }

  const videosData = await ytGet("videos", {
    part: "snippet,contentDetails,liveStreamingDetails",
    id: videoIds.join(","),
  });

  return videosData.items || [];
}

async function getCatalog() {
  const now = Date.now();
  if (cache.catalog && now < cache.catalogExpiresAt) {
    return cache.catalog;
  }

  const videos = await fetchRecentVideoDetails(50);
  const shorts = [];
  const latestVideos = [];

  for (const video of videos) {
    if (isCurrentlyLive(video)) continue;
    if (isShortVideo(video)) {
      shorts.push(mapVideoItem(video, { isShort: true }));
    } else {
      latestVideos.push(mapVideoItem(video, { isShort: false }));
    }
  }

  cache.catalog = { shorts, latestVideos };
  cache.catalogExpiresAt = now + CACHE_TTL_MS;
  return cache.catalog;
}

async function getLatestVideos(limit = 20) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const { latestVideos } = await getCatalog();
  return latestVideos.slice(0, safeLimit);
}

async function getShorts(limit = 20) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const { shorts } = await getCatalog();
  return shorts.slice(0, safeLimit);
}

async function getLive() {
  const now = Date.now();
  if (cache.live && now < cache.liveExpiresAt) {
    return cache.live;
  }

  const { channelId } = getConfig();

  // Prefer search for currently live broadcasts on the channel
  try {
    const searchData = await ytGet("search", {
      part: "snippet",
      channelId,
      eventType: "live",
      type: "video",
      maxResults: 1,
    });

    const liveId = searchData.items?.[0]?.id?.videoId;
    if (liveId) {
      const videosData = await ytGet("videos", {
        part: "snippet,contentDetails,liveStreamingDetails",
        id: liveId,
      });
      const video = videosData.items?.[0];
      if (video) {
        const result = {
          isLive: true,
          data: mapVideoItem(video, { isShort: false }),
        };
        cache.live = result;
        cache.liveExpiresAt = now + CACHE_TTL_MS;
        return result;
      }
    }
  } catch (err) {
    // Fall through to uploads scan if search fails (quota/restriction)
    console.error("YouTube live search failed:", err.response?.data || err.message);
  }

  // Fallback: check recent uploads for an active live stream
  const videos = await fetchRecentVideoDetails(15);
  const liveVideo = videos.find(isCurrentlyLive);
  const result = liveVideo
    ? { isLive: true, data: mapVideoItem(liveVideo, { isShort: false }) }
    : { isLive: false, data: null };

  cache.live = result;
  cache.liveExpiresAt = now + CACHE_TTL_MS;
  return result;
}

module.exports = {
  getLatestVideos,
  getShorts,
  getLive,
};
