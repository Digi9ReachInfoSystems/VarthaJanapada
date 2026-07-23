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

const cache = {
  media: null,
  mediaExpiresAt: 0,
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

async function igGet(path, params) {
  const { accessToken } = getConfig();
  const base = getIgBase(accessToken);
  const { data } = await axios.get(`${base}/${path}`, {
    params: { ...params, access_token: accessToken },
    timeout: 15000,
  });
  return data;
}

async function fetchMediaFromInstagram(limit) {
  const { userId } = getConfig();
  const data = await igGet(`${userId}/media`, {
    fields: MEDIA_FIELDS,
    limit,
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  return items.map(mapMediaItem).filter((item) => item.imageUrl);
}

async function getMedia(limit = 12) {
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const now = Date.now();

  if (cache.media && now < cache.mediaExpiresAt) {
    return cache.media.slice(0, safeLimit);
  }

  // Fetch a full page (up to 50) once, then serve slices from cache.
  const media = await fetchMediaFromInstagram(50);
  cache.media = media;
  cache.mediaExpiresAt = now + getCacheTtlMs();
  return media.slice(0, safeLimit);
}

/** Clear in-memory media cache (useful after token change / restart). */
function clearMediaCache() {
  cache.media = null;
  cache.mediaExpiresAt = 0;
}

module.exports = {
  getMedia,
  clearMediaCache,
};
