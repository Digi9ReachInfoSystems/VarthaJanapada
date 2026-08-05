const crypto = require("crypto");
const axios = require("axios");
const mongoose = require("mongoose");
const KarnatakaIntegrationConfig = require("../../models/karnatakaIntegrationConfigModel");
const KarnatakaPublicCreateMark = require("../../models/karnatakaPublicCreateMarkModel");
const { generateSignature } = require("./signature");
const { validatePublishPayload } = require("./validator");
const { mapToPublicBody } = require("./mapper");

const DEFAULT_ENDPOINT = "https://pv-api.pix.in/v1/news_house/create";
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_SECRET =
  process.env.KARNATAKA_PUBLIC_CLIENT_SECRET || "1b8ca7wexi7p";

function maskSecret(secret) {
  const value = String(secret || "");
  if (!value) return "";
  if (value.length <= 4) return "****";
  return `${"*".repeat(Math.min(value.length - 4, 12))}${value.slice(-4)}`;
}

async function getOrCreateConfig() {
  let doc = await KarnatakaIntegrationConfig.findOne({ key: "default" });
  if (!doc) {
    doc = await KarnatakaIntegrationConfig.create({
      key: "default",
      enabled: false,
      apiEndpoint: DEFAULT_ENDPOINT,
      clientSecret: DEFAULT_SECRET,
      timeoutMs: DEFAULT_TIMEOUT_MS,
    });
  }
  return doc;
}

function toPublicConfig(doc) {
  return {
    enabled: Boolean(doc.enabled),
    apiEndpoint: doc.apiEndpoint || DEFAULT_ENDPOINT,
    clientSecretMasked: maskSecret(doc.clientSecret),
    hasClientSecret: Boolean(doc.clientSecret),
    timeoutMs: Number(doc.timeoutMs) || DEFAULT_TIMEOUT_MS,
    lastStatus: doc.lastStatus || "",
    lastRequestId: doc.lastRequestId || "",
    lastResponse: doc.lastResponse || null,
    lastError: doc.lastError || "",
    lastCheckedAt: doc.lastCheckedAt || null,
    updatedAt: doc.updatedAt || null,
  };
}

async function updateMonitoring(doc, fields) {
  Object.assign(doc, fields);
  doc.lastCheckedAt = new Date();
  await doc.save();
}

function extractArticleId(rawBody = {}) {
  const raw = rawBody.articleId || rawBody.article_id || null;
  if (!raw) return null;
  const id = String(raw).trim();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return id;
}

async function saveCreateMark({
  articleId,
  title,
  district,
  requestId,
  publicData,
  userId,
}) {
  if (!articleId) return null;
  const publicId =
    (publicData &&
      typeof publicData === "object" &&
      (publicData.id || publicData._id)) ||
    "";
  return KarnatakaPublicCreateMark.findOneAndUpdate(
    { articleId },
    {
      $set: {
        articleId,
        title: title || "",
        district: district || "",
        requestId: requestId || "",
        publicId: String(publicId || ""),
        ...(userId ? { createdBy: userId } : {}),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function listCreatedMarks() {
  const rows = await KarnatakaPublicCreateMark.find({})
    .select("articleId title district requestId publicId createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return rows.map((row) => ({
    articleId: String(row.articleId),
    title: row.title || "",
    district: row.district || "",
    requestId: row.requestId || "",
    publicId: row.publicId || "",
    createdAt: row.createdAt || null,
  }));
}

/**
 * Forward to Public API. Does not save news posts.
 * Optional articleId → create-mark in DB after Public success.
 */
async function publishToPublic(rawBody, options = {}) {
  const startedAt = Date.now();
  const config = await getOrCreateConfig();
  const articleId = extractArticleId(rawBody);

  if (!config.enabled && !options.force) {
    console.log("[karnataka] publish skipped — integration disabled");
    return {
      skipped: true,
      statusCode: 200,
      data: {
        success: true,
        skipped: true,
        message: "Karnataka DIPR integration is disabled",
      },
    };
  }

  const validation = validatePublishPayload(rawBody);
  if (!validation.ok) {
    return {
      skipped: false,
      statusCode: 400,
      data: {
        success: false,
        message: validation.errors.join("; "),
        errors: validation.errors,
      },
    };
  }

  const clientSecret = config.clientSecret || DEFAULT_SECRET;
  if (!clientSecret) {
    return {
      skipped: false,
      statusCode: 400,
      data: {
        success: false,
        message: "Client secret is not configured",
      },
    };
  }

  const publicBody = mapToPublicBody(validation.normalized);
  const rawJson = JSON.stringify(publicBody);
  const bodyBuffer = Buffer.from(rawJson, "utf8");
  const requestId = crypto.randomUUID();
  const signature = generateSignature(clientSecret, requestId, bodyBuffer);
  const endpoint = (config.apiEndpoint || DEFAULT_ENDPOINT).trim();
  const timeoutMs = Number(config.timeoutMs) || DEFAULT_TIMEOUT_MS;

  console.log(
    JSON.stringify({
      tag: "karnataka",
      event: "publish_start",
      requestId,
      endpoint,
      articleId: articleId || null,
      startedAt: new Date(startedAt).toISOString(),
    })
  );

  try {
    const response = await axios.post(endpoint, bodyBuffer, {
      headers: {
        "Content-Type": "application/json",
        "X-REQUEST-ID": requestId,
        "X-SIGNATURE": signature,
      },
      timeout: timeoutMs,
      validateStatus: () => true,
      transformRequest: [(data) => data],
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const durationMs = Date.now() - startedAt;
    const publicData = response.data;
    const ok = response.status >= 200 && response.status < 300;

    await updateMonitoring(config, {
      lastStatus: ok ? "success" : `error_${response.status}`,
      lastRequestId: requestId,
      lastResponse: publicData,
      lastError: ok
        ? ""
        : typeof publicData === "object"
          ? publicData?.message || `Public API returned ${response.status}`
          : String(publicData || `Public API returned ${response.status}`),
    });

    let marked = false;
    if (ok && articleId) {
      try {
        await saveCreateMark({
          articleId,
          title: validation.normalized.title,
          district: validation.normalized.district,
          requestId,
          publicData,
          userId: options.userId || null,
        });
        marked = true;
      } catch (markErr) {
        console.error("[karnataka] saveCreateMark error:", markErr.message);
      }
    }

    console.log(
      JSON.stringify({
        tag: "karnataka",
        event: "publish_done",
        requestId,
        publicStatus: response.status,
        durationMs,
        status: ok ? "success" : "error",
        marked,
      })
    );

    return {
      skipped: false,
      statusCode: response.status,
      data: {
        success: ok,
        requestId,
        publicStatus: response.status,
        marked,
        articleId: articleId || null,
        data: publicData,
        message: ok
          ? "News created successfully"
          : publicData?.message || "Create failed. Please try again.",
      },
    };
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const isTimeout =
      err.code === "ECONNABORTED" || /timeout/i.test(err.message || "");
    const message = isTimeout
      ? "Request to Public API timed out"
      : err.message || "Failed to reach Public API";

    await updateMonitoring(config, {
      lastStatus: isTimeout ? "timeout" : "error",
      lastRequestId: requestId,
      lastResponse: null,
      lastError: message,
    });

    console.error(
      JSON.stringify({
        tag: "karnataka",
        event: "publish_error",
        requestId,
        durationMs,
        status: isTimeout ? "timeout" : "error",
        error: message,
      })
    );

    return {
      skipped: false,
      statusCode: isTimeout ? 504 : 500,
      data: {
        success: false,
        requestId,
        message,
      },
    };
  }
}

async function getConfig() {
  const doc = await getOrCreateConfig();
  return toPublicConfig(doc);
}

async function updateConfig(payload = {}, userId) {
  const doc = await getOrCreateConfig();

  if (typeof payload.enabled === "boolean") {
    doc.enabled = payload.enabled;
  } else if (payload.enabled === "true" || payload.enabled === "false") {
    doc.enabled = payload.enabled === "true";
  }

  if (typeof payload.apiEndpoint === "string" && payload.apiEndpoint.trim()) {
    doc.apiEndpoint = payload.apiEndpoint.trim();
  }

  if (
    typeof payload.clientSecret === "string" &&
    payload.clientSecret.trim() &&
    !payload.clientSecret.includes("*")
  ) {
    doc.clientSecret = payload.clientSecret.trim();
  }

  if (payload.timeoutMs !== undefined && payload.timeoutMs !== null) {
    const timeout = Number(payload.timeoutMs);
    if (Number.isFinite(timeout) && timeout >= 1000 && timeout <= 120000) {
      doc.timeoutMs = timeout;
    }
  }

  if (userId) {
    doc.updatedBy = userId;
  }

  await doc.save();
  return toPublicConfig(doc);
}

/**
 * Lightweight connectivity check: validates config + signs a tiny dry-run body.
 * Does not create news in our DB. Optionally hits Public with a minimal invalid
 * payload only when options.liveProbe is true — default is local sign check.
 */
async function testConnection() {
  const doc = await getOrCreateConfig();
  const clientSecret = doc.clientSecret || DEFAULT_SECRET;
  const endpoint = (doc.apiEndpoint || DEFAULT_ENDPOINT).trim();

  if (!clientSecret) {
    await updateMonitoring(doc, {
      lastStatus: "error",
      lastError: "Client secret is not configured",
      lastResponse: null,
      lastRequestId: "",
    });
    return {
      statusCode: 400,
      data: {
        success: false,
        message: "Client secret is not configured",
        data: toPublicConfig(doc),
      },
    };
  }

  if (!/^https?:\/\//i.test(endpoint)) {
    await updateMonitoring(doc, {
      lastStatus: "error",
      lastError: "API endpoint must be http(s)",
      lastResponse: null,
      lastRequestId: "",
    });
    return {
      statusCode: 400,
      data: {
        success: false,
        message: "API endpoint must be http(s)",
        data: toPublicConfig(doc),
      },
    };
  }

  const requestId = crypto.randomUUID();
  const sampleBody = Buffer.from(
    JSON.stringify({
      title: "connection-test",
      district: "Chitradurga",
      media: [{ type: "IMAGE", url: "https://example.com/test.jpg" }],
      voiceover_cdn_url: "https://example.com/test.mp3",
    }),
    "utf8"
  );
  const signature = generateSignature(clientSecret, requestId, sampleBody);
  const timeoutMs = Number(doc.timeoutMs) || DEFAULT_TIMEOUT_MS;

  try {
    const response = await axios.post(endpoint, sampleBody, {
      headers: {
        "Content-Type": "application/json",
        "X-REQUEST-ID": requestId,
        "X-SIGNATURE": signature,
      },
      timeout: timeoutMs,
      validateStatus: () => true,
      transformRequest: [(data) => data],
    });

    // 401 = signature/auth problem; other 4xx means we reached Public (headers accepted or body rejected)
    const reachable = response.status !== 0;
    const authOk = response.status !== 401;
    const statusLabel = reachable
      ? authOk
        ? "connected"
        : "auth_failed"
      : "unreachable";

    await updateMonitoring(doc, {
      lastStatus: statusLabel,
      lastRequestId: requestId,
      lastResponse: {
        status: response.status,
        body: response.data,
      },
      lastError:
        response.status === 401
          ? "Signature validation failed (401)"
          : response.status >= 500
            ? `Public API error ${response.status}`
            : "",
    });

    return {
      statusCode: 200,
      data: {
        success: response.status !== 401 && response.status < 500,
        message:
          response.status === 401
            ? "Reached Public API but signature/auth failed"
            : `Reached Public API (HTTP ${response.status})`,
        requestId,
        publicStatus: response.status,
        data: toPublicConfig(await getOrCreateConfig()),
      },
    };
  } catch (err) {
    const isTimeout =
      err.code === "ECONNABORTED" || /timeout/i.test(err.message || "");
    const message = isTimeout
      ? "Connection test timed out"
      : err.message || "Failed to reach Public API";

    await updateMonitoring(doc, {
      lastStatus: isTimeout ? "timeout" : "error",
      lastRequestId: requestId,
      lastResponse: null,
      lastError: message,
    });

    return {
      statusCode: isTimeout ? 504 : 500,
      data: {
        success: false,
        message,
        requestId,
        data: toPublicConfig(await getOrCreateConfig()),
      },
    };
  }
}

module.exports = {
  publishToPublic,
  getConfig,
  updateConfig,
  testConnection,
  toPublicConfig,
  listCreatedMarks,
};
