const publishService = require("../services/karnataka/publishService");
const { listDistrictMapping } = require("../services/karnataka/districts");

/**
 * POST /api/karnataka/publish
 * Forward-only to pv-api.pix.in — does not save news in our DB.
 */
exports.publish = async (req, res) => {
  try {
    const result = await publishService.publishToPublic(req.body || {}, {
      force: true,
      userId: req.userId || req.user?.id || null,
    });
    return res.status(result.statusCode).json(result.data);
  } catch (err) {
    console.error("[karnataka] publish controller error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/** GET /api/karnataka/created-marks */
exports.getCreatedMarks = async (req, res) => {
  try {
    const data = await publishService.listCreatedMarks();
    return res.status(200).json({
      success: true,
      data,
      message: "Karnataka Public create marks",
    });
  } catch (err) {
    console.error("[karnataka] getCreatedMarks error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load create marks",
    });
  }
};

/** GET /api/karnataka/districts — full Location Mapping list */
exports.getDistricts = async (req, res) => {
  try {
    const data = listDistrictMapping();
    return res.status(200).json({
      success: true,
      data,
      message: "Karnataka location mapping districts",
    });
  } catch (err) {
    console.error("[karnataka] getDistricts error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load district mapping",
    });
  }
};

/** GET /api/karnataka/config */
exports.getConfig = async (req, res) => {
  try {
    const data = await publishService.getConfig();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("[karnataka] getConfig error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load Karnataka integration config",
    });
  }
};

/** PUT /api/karnataka/config */
exports.updateConfig = async (req, res) => {
  try {
    const data = await publishService.updateConfig(
      req.body || {},
      req.userId || req.user?.id
    );
    return res.status(200).json({
      success: true,
      data,
      message: "Karnataka integration settings saved",
    });
  } catch (err) {
    console.error("[karnataka] updateConfig error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save Karnataka integration config",
    });
  }
};

/** POST /api/karnataka/test */
exports.testConnection = async (req, res) => {
  try {
    const result = await publishService.testConnection();
    return res.status(result.statusCode).json(result.data);
  } catch (err) {
    console.error("[karnataka] testConnection error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Connection test failed",
    });
  }
};
