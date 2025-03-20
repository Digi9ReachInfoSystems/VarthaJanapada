const express = require("express");
const wishListController = require("../controller/wishListController");

const router = express.Router();

// Create a new wishlist
router.post("/create", wishListController.createWishList);

// Add/Update/Delete items in the wishlist
router.patch("/update/:wishListId", wishListController.updateWishList);
router.patch("/remove/:wishListId", wishListController.removeItemFromWishList);

// Get wishlist by userId
router.get("/user/:userId", wishListController.getWishListByUserId);

// Delete a wishlist
router.delete("/delete/:wishListId", wishListController.deleteWishList);

module.exports = router;
