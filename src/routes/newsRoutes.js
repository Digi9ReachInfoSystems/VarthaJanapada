const express = require("express");
const router = express.Router();
const newsController = require("../controller/newsController");

const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");

router.post(
  "/createNews",
  authenticateJWT,
  allowedRoles(["admin", "moderator"]),
  newsController.createNews
);

router.get("/total-news", newsController.getTotalNews);
router.get("/latest", newsController.getLatestNews);
router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getNewsById);
router.get("/translate/:id/:targetLang", newsController.translateNews);
router.post("/addComment", newsController.addComment);
router.get("/search/:query", newsController.searchNews);
router.get("/categories/:category", newsController.getNewsByCategory);

router.patch(
  "/:id",
  authenticateJWT,
  allowedRoles(["admin", "moderator"]),
  newsController.updateNews
);

router.delete(
  "/:id",
  authenticateJWT,
  allowedRoles(["admin"]),
  newsController.deleteNews
);

router.delete(
  "/deleteComment/:commentId/:userId",
  authenticateJWT,
  allowedRoles(["admin", "moderator"]),
  newsController.deleteComment
);

router.put(
  "/approveNews/:id",
  authenticateJWT,
  allowedRoles(["admin"]),
  newsController.approveNews
);

router.get("/getNewsHistory/:id", newsController.getNewsHistory);
router.post(
  "/revertNews/:id/revert/:versionNumber",
  newsController.revertNewsToVersion
);
router.delete(
  "/deleteVersion/:id/delete/:versionNumber",
  newsController.deleteVersion
);

router.post("/add/addnews",
  authenticateJWT,
  allowedRoles(["user"]), newsController.addNewsToPlaylist);

router.put(
  "/delete/removenews",
  authenticateJWT,
  allowedRoles(["user"]),
  newsController.removeNewsFromPlaylist
);

router.get("/getuser/newsplaylist/:userId", 
  authenticateJWT,
  allowedRoles(["user"]),
  newsController.getNewsPlaylist
);

router.get("/getNewsByNewsType/:newsType", newsController.getNewsByNewsType);
module.exports = router;
