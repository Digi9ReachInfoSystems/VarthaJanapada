const WishList = require("../models/wishListModel");

// 1. Create a new wishlist
exports.createWishList = async (req, res) => {
  try {
    const { userId, collection_Name, description } = req.body;

    // Check if the user already has a wishlist with the same name
    const existingWishList = await WishList.findOne({
      userId,
      collection_Name,
    });
    if (existingWishList) {
      return res.status(400).json({
        status: "fail",
        message: "A wishlist with this name already exists for the user.",
      });
    }

    const newWishList = await WishList.create({
      userId,
      collection_Name,
      description,
    });

    res.status(201).json({
      status: "success",
      data: {
        wishList: newWishList,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.removeItemFromWishList = async (req, res) => {
  try {
    const { wishListId } = req.params;
    const { itemType, itemId } = req.body;

    const wishList = await WishList.findById(wishListId);
    if (!wishList) {
      return res.status(404).json({
        status: "fail",
        message: "Wishlist not found.",
      });
    }

    // Determine the array to update based on itemType
    let itemArray;
    switch (itemType) {
      case "article":
        itemArray = wishList.articles;
        break;
      case "varthajanapada":
        itemArray = wishList.varthajanapada;
        break;
      case "marchOfKaranataka":
        itemArray = wishList.marchOfKaranataka;
        break;
      case "shortVideo":
        itemArray = wishList.shortVideo;
        break;
      case "longVideo":
        itemArray = wishList.longVideo;
        break;
      default:
        return res.status(400).json({
          status: "fail",
          message: "Invalid item type.",
        });
    }

    // Remove the item if it exists
    const index = itemArray.indexOf(itemId);
    if (index > -1) {
      itemArray.splice(index, 1);
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Item not found in the wishlist.",
      });
    }

    await wishList.save();

    res.status(200).json({
      status: "success",
      data: {
        wishList,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// 2. Add/Update/Delete items in the wishlist
exports.updateWishList = async (req, res) => {
  try {
    const { wishListId } = req.params;
    const { action, itemType, itemId } = req.body;

    const wishList = await WishList.findById(wishListId);
    if (!wishList) {
      return res.status(404).json({
        status: "fail",
        message: "Wishlist not found.",
      });
    }

    // Determine the array to update based on itemType
    let itemArray;
    switch (itemType) {
      case "article":
        itemArray = wishList.articles;
        break;
      case "varthajanapada":
        itemArray = wishList.varthajanapada;
        break;
      case "marchOfKaranataka":
        itemArray = wishList.marchOfKaranataka;
        break;
      case "shortVideo":
        itemArray = wishList.shortVideo;
        break;
      case "longVideo":
        itemArray = wishList.longVideo;
        break;
      default:
        return res.status(400).json({
          status: "fail",
          message: "Invalid item type.",
        });
    }

    // Perform the action (add, delete, or update)
    if (action === "add") {
      if (!itemArray.includes(itemId)) {
        itemArray.push(itemId);
      }
    } else if (action === "delete") {
      const index = itemArray.indexOf(itemId);
      if (index > -1) {
        itemArray.splice(index, 1);
      }
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Invalid action. Use 'add' or 'delete'.",
      });
    }

    await wishList.save();

    res.status(200).json({
      status: "success",
      data: {
        wishList,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// 3. Get wishlist by userId
exports.getWishListByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const wishLists = await WishList.find({ userId }).populate([
      "articles",
      "varthajanapada",
      "marchOfKaranataka",
      "shortVideo",
      "longVideo",
    ]);

    if (!wishLists || wishLists.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No wishlists found for this user.",
      });
    }

    res.status(200).json({
      status: "success",
      results: wishLists.length,
      data: {
        wishLists,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// 4. Delete a wishlist
exports.deleteWishList = async (req, res) => {
  try {
    const { wishListId } = req.params;

    const wishList = await WishList.findByIdAndDelete(wishListId);
    if (!wishList) {
      return res.status(404).json({
        status: "fail",
        message: "Wishlist not found.",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
