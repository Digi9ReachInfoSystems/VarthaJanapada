const express = require("express");
const router = express.Router();
const magazineController = require("../controller/magazineController");

router.get("/", magazineController.getMagazines);
router.post("/", magazineController.createMagazine);
module.exports = router;
