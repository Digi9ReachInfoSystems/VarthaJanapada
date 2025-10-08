const express = require("express");
const router = express.Router();
const photosController = require("../controller/photosController");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");

router.post("/createphotos",authenticateJWT,allowedRoles(['admin','moderator']), photosController.createPhotos);
router.get("/getAllPhotos", photosController.getAllPhotos);
router.get("/:id", photosController.getPhotosById);
router.delete("/deletePhotos/:id",authenticateJWT, allowedRoles(['admin']), photosController.deletePhotosById);
router.patch("/approvePhotos/:id", authenticateJWT, allowedRoles(['admin']), photosController.approvePhotos);
module.exports = router;