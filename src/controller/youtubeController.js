const youtubeService = require("../services/youtubeService");

function getErrorPayload(error) {
  const ytError = error.response?.data?.error;
  const message =
    ytError?.message ||
    error.message ||
    "YouTube request failed";
  const statusCode =
    error.statusCode ||
    error.response?.status ||
    500;
  return { statusCode, message, details: ytError || undefined };
}

exports.getLatestVideos = async (req, res) => {
  try {
    const data = await youtubeService.getLatestVideos(req.query.limit);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getLatestVideos error:", error.response?.data || error.message);
    const { statusCode, message, details } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
      ...(details ? { details } : {}),
    });
  }
};

exports.getShorts = async (req, res) => {
  try {
    const data = await youtubeService.getShorts(req.query.limit);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getShorts error:", error.response?.data || error.message);
    const { statusCode, message, details } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
      ...(details ? { details } : {}),
    });
  }
};

exports.getLive = async (req, res) => {
  try {
    const result = await youtubeService.getLive();
    return res.status(200).json({
      success: true,
      isLive: result.isLive,
      data: result.data,
    });
  } catch (error) {
    console.error("getLive error:", error.response?.data || error.message);
    const { statusCode, message, details } = getErrorPayload(error);
    return res.status(statusCode).json({
      success: false,
      message,
      ...(details ? { details } : {}),
    });
  }
};
