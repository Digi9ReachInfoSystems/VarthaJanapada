const express = require("express");
const router = express.Router();
const magazineController = require("../controller/magazineController");

router.get("/", magazineController.getMagazines);
router.get("/searchmagazine", magazineController.searchMagazine);
router.get("/:id", magazineController.getMagazineById);
router.post("/", magazineController.createMagazine);

module.exports = router;
