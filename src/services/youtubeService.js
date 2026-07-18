const axios = require("axios");

const YT_BASE = "https://www.googleapis.com/youtube/v3";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
/** Shorts feed: only videos <= 60 seconds (never long videos). */
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

function pickThumbnail(snippet, videoId) {
  const thumbs = snippet?.thumbnails || {};
  // Prefer highest available resolution (hqdefault is soft on Shorts cards)
  return (
    thumbs.maxres?.url ||
    thumbs.standard?.url ||
    thumbs.high?.url ||
    (videoId
      ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
      : "") ||
    thumbs.medium?.url ||
    thumbs.default?.url ||
    ""
  );
}

function mapVideoItem(video, { isShort = false } = {}) {
  const videoId = video.id;
  const snippet = video.snippet || {};
  const durationSeconds = parseDurationSeconds(
    video.contentDetails?.duration
  );
  return {
    videoId,
    title: snippet.title || "",
    thumbnail: pickThumbnail(snippet, videoId),
    publishedAt: snippet.publishedAt || "",
    durationSeconds,
    url: isShort
      ? `https://www.youtube.com/shorts/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`,
  };
}

function isShortDuration(video) {
  const durationSec = parseDurationSeconds(video.contentDetails?.duration);
  if (durationSec === null || durationSec <= 0) return false;
  return durationSec <= SHORTS_MAX_SECONDS;
}

/**
 * YouTube's API does not expose whether a video is actually a Short.
 * Its /shorts/:id route returns 200 for a real Short and redirects ordinary
 * videos to /watch, so validate that route before adding an item to Shorts.
 */
async function isActualYoutubeShort(videoId) {
  if (!videoId) return false;
  try {
    const response = await axios.head(
      `https://www.youtube.com/shorts/${videoId}`,
      {
        maxRedirects: 0,
        timeout: 8000,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );
    return response.status === 200 && !response.headers.location;
  } catch (error) {
    console.error(
      `YouTube Shorts validation failed for ${videoId}:`,
      error.message
    );
    return false;
  }
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
  const videoIds = [];
  let pageToken = undefined;
  const target = Math.min(Math.max(maxItems, 1), 100);

  while (videoIds.length < target) {
    const playlistData = await ytGet("playlistItems", {
      part: "contentDetails",
      playlistId,
      maxResults: Math.min(FETCH_PAGE_SIZE, target - videoIds.length),
      ...(pageToken ? { pageToken } : {}),
    });

    for (const item of playlistData.items || []) {
      const id = item.contentDetails?.videoId;
      if (id) videoIds.push(id);
    }

    pageToken = playlistData.nextPageToken;
    if (!pageToken) break;
  }

  if (!videoIds.length) {
    return [];
  }

  const videos = [];
  // videos.list allows up to 50 ids per call
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const videosData = await ytGet("videos", {
      part: "snippet,contentDetails,liveStreamingDetails",
      id: chunk.join(","),
    });
    videos.push(...(videosData.items || []));
  }

  return videos;
}

async function getCatalog() {
  const now = Date.now();
  if (cache.catalog && now < cache.catalogExpiresAt) {
    return cache.catalog;
  }

  // Scan more uploads so Shorts feed fills with real shorts, not long videos
  const videos = await fetchRecentVideoDetails(100);
  const shorts = [];
  const latestVideos = [];
  const nonLiveVideos = videos.filter((video) => !isCurrentlyLive(video));
  const shortCandidates = nonLiveVideos.filter(isShortDuration);
  const actualShortIds = new Set(
    (
      await Promise.all(
        shortCandidates.map(async (video) => ({
          videoId: video.id,
          isShort: await isActualYoutubeShort(video.id),
        }))
      )
    )
      .filter((result) => result.isShort)
      .map((result) => result.videoId)
  );

  for (const video of nonLiveVideos) {
    const durationSec = parseDurationSeconds(video.contentDetails?.duration);
    if (actualShortIds.has(video.id)) {
      shorts.push(mapVideoItem(video, { isShort: true }));
    } else if (durationSec !== null && durationSec > 0) {
      // Includes short-duration ordinary videos that redirect to /watch.
      latestVideos.push(mapVideoItem(video, { isShort: false }));
    }
  }

  cache.catalog = { shorts, latestVideos };
  cache.catalogExpiresAt = now + CACHE_TTL_MS;
  return cache.catalog;
}

/** Clear in-memory catalog (useful after filter changes / restart). */
function clearCatalogCache() {
  cache.catalog = null;
  cache.catalogExpiresAt = 0;
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
  clearCatalogCache,
};
