const express = require("express");
const router = express.Router();
const serviceController = require("../controller/serviceController");

router.get("/list", serviceController.listServices);
router.post("/", serviceController.createService);
router.delete("/:id", serviceController.deleteService);

module.exports = router;
