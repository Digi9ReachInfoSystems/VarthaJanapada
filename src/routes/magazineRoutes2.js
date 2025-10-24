const express = require("express");
const router = express.Router();
const magazineController = require("../controller/magazine2Controller");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");  

router.get("/", magazineController.getMagazines);
router.get("/searchmagazine", magazineController.searchMagazine);
router.get("/total-Magazine", magazineController.getTotalMagazines);
router.get("/:id", magazineController.getMagazineById);
router.post("/",authenticateJWT, allowedRoles(['admin', 'moderator']), magazineController.createMagazine);
router.post("/update/:id",authenticateJWT, allowedRoles(['admin', 'moderator']), magazineController.updateMagazine);
router.delete("/delete/:id",authenticateJWT, allowedRoles(['admin']), magazineController.deleteMagazine);
router.post("/approveMagazine/:id",authenticateJWT, allowedRoles(['admin']), magazineController.approvemagazine);

router.get("/getHistory/:id",magazineController.getMagazineHistory);
router.post("/reverMagazine2/:id/revert/:versionNumber",magazineController.revertMagazineToVersion);

router.delete("/deleteMagazineVersion2/:id/delete/:versionNumber", magazineController.deleteMagazineVersion2); 
router.get("/by-year/:year", magazineController.getMagazinesByYear);  

router.post("/addmagazine2/playlist", authenticateJWT, allowedRoles(['user']), magazineController.addMarchOfKarnatakaToPlaylist);
router.put("/removemagazine2/playlist", authenticateJWT, allowedRoles(['user']), magazineController.removeMarchOfKarnatakaFromPlaylist);
router.get("/getuser/magazineplaylist2/:userId", authenticateJWT, allowedRoles(['user']), magazineController.getMarchOfKarnatakaPlaylist);
module.exports = router;
