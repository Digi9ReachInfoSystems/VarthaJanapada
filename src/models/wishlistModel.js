const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema({
  collection_Name: {
    type: String,
    required: [true, "A Collection name should be there."],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
    required: [true, "A description is needed for Collection."],
  },
  createdTime: {
    type: Date,
  },
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "News",
    },
  ],
  varthajanapada: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Magazine",
    },
  ],
  marchOfKaranataka: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Magazine2",
    },
  ],
  shortVideo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  longVideo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LongVideo",
    },
  ],
});

const WishList = mongoose.model("WishList", wishListSchema);

module.exports = WishList;
