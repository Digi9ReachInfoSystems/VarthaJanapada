const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const allowedRoles = require("../middleware/allowedRole");
const authenticateJWT = require("../middleware/authenticateRole");

router.post("/createCategory",authenticateJWT, allowedRoles(['admin','moderator']), categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.put("/:id",authenticateJWT, allowedRoles(['admin', 'moderator']), categoryController.updateCategory);
router.delete("/:id",authenticateJWT, allowedRoles(['admin']), categoryController.deleteCategory);
router.put("/approveCategory/:id",authenticateJWT, allowedRoles(['admin']), categoryController.approveCategory);
module.exports = router;
