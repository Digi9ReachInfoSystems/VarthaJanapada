const express = require("express");
const router = express.Router();
const staticpageController = require("../controller/staticpageController");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");


router.post("/createStaticPage",authenticateJWT, allowedRoles(['admin','moderator']), staticpageController.createStaticPage);
router.get("/getAllStaticPage", staticpageController.getAllStaticPages);
router.get("/:id", staticpageController.getStaticPageById);
router.delete("/deleteStaticPage/:id",authenticateJWT, allowedRoles(['admin']), staticpageController.deleteStaticPageById);
router.patch("/approveStaticPage/:id", authenticateJWT, allowedRoles(['admin']), staticpageController.approveStaticPage);
module.exports = router;