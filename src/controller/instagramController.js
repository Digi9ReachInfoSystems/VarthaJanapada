const instagramService = require("../services/instagramService");

function getErrorPayload(error) {
  const igError = error.response?.data?.error;
  const message =
    igError?.message ||
    error.message ||
    "Instagram request failed";
  const statusCode =
    error.statusCode ||
    error.response?.status ||
    500;
  return { statusCode, message, details: igError || undefined };
}

exports.getMedia = async (req, res) => {
  try {
    const data = await instagramService.getMedia(req.query.limit);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getMedia error:", error.response?.data || error.message);
    const { statusCode, message, details } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
      ...(details ? { details } : {}),
    });
  }
};

exports.getReels = async (req, res) => {
  try {
    const data = await instagramService.getReels(req.query.limit);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getReels error:", error.response?.data || error.message);
    const { statusCode, message, details } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
      ...(details ? { details } : {}),
    });
  }
};
