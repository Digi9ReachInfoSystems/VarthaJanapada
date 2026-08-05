const crypto = require("crypto");

/**
 * HMAC-SHA256 signature for Public API (exact body bytes).
 * Message: {requestId}|{sha256Hex(requestBody)}
 */
function generateSignature(clientSecret, requestId, requestBody) {
  const bodyBuffer = Buffer.isBuffer(requestBody)
    ? requestBody
    : Buffer.from(requestBody);
  const bodyHash = crypto.createHash("sha256").update(bodyBuffer).digest("hex");
  const message = `${requestId}|${bodyHash}`;
  return crypto
    .createHmac("sha256", Buffer.from(String(clientSecret || ""), "utf8"))
    .update(Buffer.from(message, "utf8"))
    .digest("hex");
}

module.exports = { generateSignature };
