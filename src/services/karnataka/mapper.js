/**
 * Map inbound DIPR payload → Public API body (Kannada title/script only).
 */
function mapToPublicBody(normalized) {
  let media = [];

  if (Array.isArray(normalized.mediaFromBody) && normalized.mediaFromBody.length) {
    media = normalized.mediaFromBody.map((item) => ({
      type: String(item.type).toUpperCase(),
      url: String(item.url).trim(),
    }));
  } else {
    media = [
      ...normalized.images.map((url) => ({
        type: "IMAGE",
        url: String(url).trim(),
      })),
      ...normalized.videos.map((url) => ({
        type: "VIDEO",
        url: String(url).trim(),
      })),
    ];
  }

  const body = {
    title: normalized.title,
    district: normalized.district,
    media,
    voiceover_cdn_url: normalized.voiceover,
  };

  if (normalized.script) {
    body.script = normalized.script;
  }

  return body;
}

module.exports = { mapToPublicBody };
