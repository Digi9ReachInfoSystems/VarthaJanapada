const express = require("express");
const router = express.Router();
const tagController = require("../controller/tagsController");

const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");


router.post("/createTags",authenticateJWT, allowedRoles(['admin', 'moderator']), tagController.createTags);
router.get("/", tagController.getAllTags);
router.put("/:id",authenticateJWT, allowedRoles(['admin', 'moderator']), tagController.updateTags);
router.delete("/:id", tagController.deleteTags);
router.put("/approveTag/:id",authenticateJWT, allowedRoles(['admin']), tagController.approveTag);

module.exports = router;
