const express = require("express");
const router = express.Router();
const magazineController = require("../controller/magazineController");

router.get("/", magazineController.getMagazines);
router.get("/searchmagazine", magazineController.searchMagazine);
router.get("/total-Magazine", magazineController.getTotalMagazines);
router.get("/:id", magazineController.getMagazineById);
router.post("/", magazineController.createMagazine);
router.post("/update/:id", magazineController.updateMagazine);
router.delete("/delete/:id", magazineController.deleteMagazine);

module.exports = router;
