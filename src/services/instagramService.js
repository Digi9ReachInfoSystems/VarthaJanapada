const axios = require("axios");

/** Instagram Login tokens (IGAA...) use graph.instagram.com; Page tokens use graph.facebook.com */
function getIgBase(accessToken) {
  if (String(accessToken || "").startsWith("IG")) {
    return "https://graph.instagram.com/v21.0";
  }
  return "https://graph.facebook.com/v19.0";
}

const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MEDIA_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

/** Page size while hunting for VIDEO posts for /reels. */
const REELS_PAGE_SIZE = 25;
/** Safety cap: max pages scanned (25 * 8 = 200 posts). */
const REELS_MAX_PAGES = 8;

/** In-memory cache of raw Graph media items for /media. */
const cache = {
  media: null,
  mediaExpiresAt: 0,
};

/**
 * Independent cache for /reels VIDEO items.
 * minCountFetched tracks how many videos the last scan aimed for;
 * if a later request asks for more, we refetch with a deeper scan.
 */
const reelsCache = {
  videos: null,
  minCountFetched: 0,
  expiresAt: 0,
};

function getCacheTtlMs() {
  const raw = Number(process.env.INSTAGRAM_CACHE_TTL_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_CACHE_TTL_MS;
}

function getConfig() {
  const accessToken = (process.env.INSTAGRAM_ACCESS_TOKEN || "").trim();
  const userId = (process.env.INSTAGRAM_USER_ID || "").trim();
  if (
    !accessToken ||
    !userId ||
    accessToken.startsWith("REPLACE_") ||
    userId.startsWith("REPLACE_")
  ) {
    const err = new Error(
      "INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID must be set in .env"
    );
    err.statusCode = 500;
    throw err;
  }
  return { accessToken, userId };
}

/** Pick the best image URL depending on the media type. */
function pickImageUrl(item) {
  const type = item?.media_type;
  if (type === "VIDEO") {
    // Reels / videos expose a still frame via thumbnail_url.
    return item.thumbnail_url || item.media_url || "";
  }
  // IMAGE and CAROUSEL_ALBUM use media_url (album cover for carousels).
  return item.media_url || item.thumbnail_url || "";
}

/** Map a raw Graph item for GET /api/instagram/media (unchanged public shape). */
function mapMediaItem(item) {
  return {
    id: item.id,
    caption: item.caption || "",
    mediaType: item.media_type || "",
    imageUrl: pickImageUrl(item),
    permalink: item.permalink || "",
    timestamp: item.timestamp || "",
  };
}

/**
 * Map a VIDEO Graph item for GET /api/instagram/reels.
 * Includes videoUrl only when Graph provides a playable media_url.
 */
function mapReelItem(item) {
  const thumbnailUrl = item.thumbnail_url || item.media_url || "";
  const reel = {
    id: item.id,
    caption: item.caption || "",
    mediaType: "VIDEO",
    thumbnailUrl,
    permalink: item.permalink || "",
    timestamp: item.timestamp || "",
  };
  if (item.media_url) {
    reel.videoUrl = item.media_url;
  }
  return reel;
}

async function igGet(path, params) {
  const { accessToken } = getConfig();
  const base = getIgBase(accessToken);
  const { data } = await axios.get(`${base}/${path}`, {
    params: { ...params, access_token: accessToken },
    timeout: 15000,
  });
  return data;
}

/** Fetch raw Graph media items (not mapped). Used by /media only. */
async function fetchMediaFromInstagram(limit) {
  const { userId } = getConfig();
  const data = await igGet(`${userId}/media`, {
    fields: MEDIA_FIELDS,
    limit,
  });
  return Array.isArray(data?.data) ? data.data : [];
}

/**
 * Page through the media feed until enough VIDEO posts are collected
 * (or REELS_MAX_PAGES is hit). Returns raw VIDEO Graph items.
 */
async function fetchVideosFromInstagram(minCount) {
  const { userId } = getConfig();
  const videos = [];
  const seen = new Set();
  let cursor;

  for (let page = 0; page < REELS_MAX_PAGES; page += 1) {
    const params = {
      fields: MEDIA_FIELDS,
      limit: REELS_PAGE_SIZE,
    };
    if (cursor) {
      params.after = cursor;
    }

    const data = await igGet(`${userId}/media`, params);
    const items = Array.isArray(data?.data) ? data.data : [];

    for (const item of items) {
      if (item?.media_type !== "VIDEO" || !item.id || seen.has(item.id)) {
        continue;
      }
      seen.add(item.id);
      videos.push(item);
    }

    if (videos.length >= minCount) {
      break;
    }

    cursor = data?.paging?.cursors?.after;
    if (!cursor) {
      break;
    }
  }

  return videos;
}

/**
 * Cache loader for /media — one Graph page (50 items), reused until TTL.
 * Returns raw Graph items.
 */
async function getCachedMediaList() {
  const now = Date.now();
  if (cache.media && now < cache.mediaExpiresAt) {
    return cache.media;
  }

  const media = await fetchMediaFromInstagram(50);
  cache.media = media;
  cache.mediaExpiresAt = now + getCacheTtlMs();
  return media;
}

async function getMedia(limit = 12) {
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const raw = await getCachedMediaList();
  return raw
    .map(mapMediaItem)
    .filter((item) => item.imageUrl)
    .slice(0, safeLimit);
}

/**
 * Latest Instagram Reels (VIDEO posts only), newest first.
 * Paginates the feed until enough videos are found (or page cap is hit).
 * Uses its own cache — does not share /media's 50-item page.
 */
async function getReels(limit = 4) {
  const safeLimit = Math.min(Math.max(Number(limit) || 4, 1), 50);
  const now = Date.now();

  const cacheFresh =
    reelsCache.videos &&
    now < reelsCache.expiresAt &&
    reelsCache.minCountFetched >= safeLimit;

  let videos;
  if (cacheFresh) {
    videos = reelsCache.videos;
  } else {
    videos = await fetchVideosFromInstagram(safeLimit);
    reelsCache.videos = videos;
    reelsCache.minCountFetched = safeLimit;
    reelsCache.expiresAt = now + getCacheTtlMs();
  }

  const reels = videos
    .map(mapReelItem)
    .filter((item) => item.thumbnailUrl)
    .sort((a, b) => {
      const ta = Date.parse(a.timestamp) || 0;
      const tb = Date.parse(b.timestamp) || 0;
      return tb - ta;
    });

  return reels.slice(0, safeLimit);
}

/** Clear in-memory caches (useful after token change / restart). */
function clearMediaCache() {
  cache.media = null;
  cache.mediaExpiresAt = 0;
  reelsCache.videos = null;
  reelsCache.minCountFetched = 0;
  reelsCache.expiresAt = 0;
}

module.exports = {
  getMedia,
  getReels,
  clearMediaCache,
};
