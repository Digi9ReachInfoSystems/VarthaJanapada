const mongoose = require("mongoose");

/**
 * Admin settings for Karnataka Public integration only.
 * Does not store news/posts.
 */
const karnatakaIntegrationConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    apiEndpoint: {
      type: String,
      default: "https://pv-api.pix.in/v1/news_house/create",
    },
    clientSecret: {
      type: String,
      default: "",
    },
    timeoutMs: {
      type: Number,
      default: 30000,
    },
    lastStatus: {
      type: String,
      default: "",
    },
    lastRequestId: {
      type: String,
      default: "",
    },
    lastResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    lastError: {
      type: String,
      default: "",
    },
    lastCheckedAt: {
      type: Date,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "KarnatakaIntegrationConfig",
  karnatakaIntegrationConfigSchema
);
