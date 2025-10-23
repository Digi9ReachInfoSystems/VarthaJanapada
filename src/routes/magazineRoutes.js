const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const magazineController = require("../controller/magazineController");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");

const { uploadToAzure } = require("../config/azureService"); // reuse same controller

router.post("/upload", upload.single("file"), uploadToAzure);

router.get("/", magazineController.getMagazines);
router.get("/searchmagazine", magazineController.searchMagazine);
router.get("/total-Magazine", magazineController.getTotalMagazines);
router.get("/getMagazineById/:id", magazineController.getMagazineById);
router.post("/",authenticateJWT, allowedRoles(['admin', 'moderator']), magazineController.createMagazine);
router.post("/update/:id",authenticateJWT, allowedRoles(['admin', 'moderator']), magazineController.updateMagazineController);
router.delete("/delete/:id",authenticateJWT, allowedRoles(['admin']), magazineController.deleteMagazine);
router.put("/approveMagazine/:id",authenticateJWT, allowedRoles(['admin']), magazineController.approveMagazine);
router.get("/getMagazineHistory/:id",magazineController.getMagazineHistory);
router.post("/revertmagazine/:id/revert/:versionNumber", magazineController.revertMagazineToVersion);
router.delete("/deleteMagazine1Version/:id/delete/:versionNumber", magazineController.deleteMagazineVersion);
router.get("/by-year/:year", magazineController.getMagazinesByYear);

router.post("/addmagazine/playlist", authenticateJWT, allowedRoles(['user']), magazineController.addMagazineToPlaylist);
router.delete("/removemagazine/playlist", authenticateJWT, allowedRoles(['user']), magazineController.removeMagazineFromPlaylist);
router.get("/getuser/magazineplaylist/:userId", authenticateJWT, allowedRoles(['user']), magazineController.getMagazinePlaylist);
module.exports = router;
