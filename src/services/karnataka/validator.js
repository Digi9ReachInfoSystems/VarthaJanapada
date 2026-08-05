const {
  SUPPORTED_DISTRICTS,
  normalizeDistrict,
} = require("./districts");

function isHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_) {
    return false;
  }
}

/**
 * Validate inbound publish payload (forward-only; no DB).
 * Accepts flat fields or nested kannada { title, description }.
 * Districts come from Location_Mapping Data Karnataka.xlsx.
 */
function validatePublishPayload(body = {}) {
  const errors = [];

  const kannada =
    body.kannada && typeof body.kannada === "object" ? body.kannada : {};
  const title =
    (typeof body.title === "string" && body.title.trim()) ||
    (typeof kannada.title === "string" && kannada.title.trim()) ||
    "";
  const script =
    (typeof body.script === "string" && body.script.trim()) ||
    (typeof kannada.description === "string" && kannada.description.trim()) ||
    "";

  if (!title) {
    errors.push("title is required (Kannada)");
  }

  // Accept district, district_slug, or districtCode
  const districtInput =
    (typeof body.district === "string" && body.district) ||
    (typeof body.district_slug === "string" && body.district_slug) ||
    (typeof body.districtCode === "string" && body.districtCode) ||
    (typeof body.district_code === "string" && body.district_code) ||
    "";

  const district = normalizeDistrict(districtInput);
  if (!districtInput) {
    errors.push("district is required");
  } else if (!district) {
    errors.push(
      `Invalid district. Use a name or code from Location Mapping (${SUPPORTED_DISTRICTS.length} districts). Example: Chitradurga or KA_CT`
    );
  }

  const images = Array.isArray(body.images) ? body.images : [];
  const videos = Array.isArray(body.videos) ? body.videos : [];
  const mediaFromBody = Array.isArray(body.media) ? body.media : null;

  let mediaCount = 0;
  if (mediaFromBody) {
    mediaCount = mediaFromBody.length;
    mediaFromBody.forEach((item, index) => {
      const type = String(item?.type || "").toUpperCase();
      if (type !== "IMAGE" && type !== "VIDEO") {
        errors.push(`media[${index}].type must be IMAGE or VIDEO`);
      }
      if (!isHttpUrl(item?.url)) {
        errors.push(`media[${index}].url must be a public http(s) URL`);
      }
    });
  } else {
    mediaCount = images.length + videos.length;
    images.forEach((url, index) => {
      if (!isHttpUrl(url)) {
        errors.push(`images[${index}] must be a public http(s) URL`);
      }
    });
    videos.forEach((url, index) => {
      if (!isHttpUrl(url)) {
        errors.push(`videos[${index}] must be a public http(s) URL`);
      }
    });
  }

  if (mediaCount < 1) {
    errors.push("media must contain at least 1 item (images/videos)");
  }
  if (mediaCount > 10) {
    errors.push("media must contain at most 10 items");
  }

  const voiceover =
    (typeof body.voiceover === "string" && body.voiceover.trim()) ||
    (typeof body.voiceover_cdn_url === "string" &&
      body.voiceover_cdn_url.trim()) ||
    "";
  if (!isHttpUrl(voiceover)) {
    errors.push("voiceover must be a public http(s) URL");
  }

  return {
    ok: errors.length === 0,
    errors,
    normalized: {
      title,
      district,
      script: script || undefined,
      images,
      videos,
      mediaFromBody,
      voiceover,
    },
  };
}

module.exports = {
  SUPPORTED_DISTRICTS,
  normalizeDistrict,
  validatePublishPayload,
  isHttpUrl,
};
