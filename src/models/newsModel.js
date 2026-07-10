const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  isLive: {
    type: Boolean,
    default: false,
  },

  magazineType: {
    type: String,
    enum: ["magazine", "magazine2"], 
  },

  newsType: {
    type: String,
    enum: ["statenews", "districtnews", "specialnews"],
  },

  district_slug: {
    type: String,
    trim: true,
    lowercase: true,
  },

  description: {
    type: String,
    required: true,
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  last_updated: {
    type: Date,
  },
  newsImage: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: false,
  },
  author: {
    type: String,
  },

  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tags",
    },
  ],
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  },
  total_Likes: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],

  likedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  hindi: {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    audio_description: {
      type: String,
    },
  },
  kannada: {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    audio_description: {
      type: String,
    },
  },

  English: {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    audio_description: {
      type: String,
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

newsSchema.index({ newsType: 1, createdTime: -1 });
newsSchema.index({ newsType: 1, district_slug: 1, createdTime: -1 });
newsSchema.index({ newsType: 1, district_slug: 1, publishedAt: -1 });

module.exports = mongoose.model("News", newsSchema);
