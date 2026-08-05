const express = require("express");
const router = express.Router();
const karnatakaController = require("../controller/karnatakaController");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");

/**
 * Optional internal key for service-to-service calls (e.g. later digi9).
 * If KARNATAKA_INTERNAL_API_KEY is unset, JWT admin/moderator is required.
 */
function authenticatePublish(req, res, next) {
  const internalKey = (process.env.KARNATAKA_INTERNAL_API_KEY || "").trim();
  const provided =
    req.headers["x-internal-key"] ||
    req.headers["x-karnataka-internal-key"] ||
    "";

  if (internalKey && provided && provided === internalKey) {
    return next();
  }

  return authenticateJWT(req, res, () =>
    allowedRoles(["admin", "moderator", "content"])(req, res, next)
  );
}

// Forward-only — no news save
router.post("/publish", authenticatePublish, karnatakaController.publish);

// Location mapping (from Location_Mapping Data Karnataka.xlsx)
router.get(
  "/districts",
  authenticateJWT,
  allowedRoles(["admin", "moderator", "content"]),
  karnatakaController.getDistricts
);

router.get(
  "/created-marks",
  authenticateJWT,
  allowedRoles(["admin", "moderator", "content"]),
  karnatakaController.getCreatedMarks
);

// Admin settings
router.get(
  "/config",
  authenticateJWT,
  allowedRoles(["admin", "moderator"]),
  karnatakaController.getConfig
);
router.put(
  "/config",
  authenticateJWT,
  allowedRoles(["admin", "moderator"]),
  karnatakaController.updateConfig
);
router.post(
  "/test",
  authenticateJWT,
  allowedRoles(["admin", "moderator"]),
  karnatakaController.testConnection
);

module.exports = router;
