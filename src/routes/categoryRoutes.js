const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");

router.post("/createCategory", categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
