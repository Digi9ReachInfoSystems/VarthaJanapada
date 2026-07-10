const express = require("express");
const router = express.Router();
const districtsNewController = require("../controller/districtsNewController");

router.get("/list", districtsNewController.listDistricts);
router.get("/news", districtsNewController.getAllDistrictNews);
router.get("/news/:districtSlug", districtsNewController.getDistrictNewsBySlug);

module.exports = router;
