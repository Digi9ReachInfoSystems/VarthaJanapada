const express = require("express");
const router = express.Router();
const tagController = require("../controller/tagsController");

router.post("/createTags", tagController.createTags);
router.get("/", tagController.getAllTags);
router.put("/:id", tagController.updateTags);
router.delete("/:id", tagController.deleteTags);

module.exports = router;
