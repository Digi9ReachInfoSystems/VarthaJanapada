const express = require("express");
const router = express.Router();
const { searchAllContent } = require("../controller/searchController");

router.get("/searchContent", searchAllContent);

module.exports = router;
