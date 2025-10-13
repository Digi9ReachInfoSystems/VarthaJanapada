// src/config/azureService.js
const { BlobServiceClient } = require("@azure/storage-blob");

function getContentType(ext) {
  const t = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    mp4: "video/mp4",
    mov: "video/quicktime",
  };
  return t[ext] || "application/octet-stream";
}

exports.uploadToAzure = async (req, res) => {
  try {
    // console.log("🟢 /api/photos/upload hit");
    // console.log("body:", req.body);
    // console.log("has file:", !!req.file);
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded. Field must be 'file'." });
    }

    // 1) Read & validate connection string
    const conn = (process.env.AZURE_STORAGE_CONNECTION_STRING || "").trim();
    console.log("Connectioonn",conn);
    if (!conn) {
      return res.status(500).json({ success: false, message: "AZURE_STORAGE_CONNECTION_STRING missing" });
    }
    const looksValid =
      conn.startsWith("DefaultEndpointsProtocol=") &&
      conn.includes("AccountName=") &&
      conn.includes("AccountKey=") &&
      conn.includes("EndpointSuffix=");
    if (!looksValid) {
      return res.status(500).json({
        success: false,
        message: "AZURE_STORAGE_CONNECTION_STRING is malformed. It must include DefaultEndpointsProtocol, AccountName, AccountKey, EndpointSuffix."
      });
    }
    // console.log("🔐 Using connection string. Preview:", conn.slice(0, 60));

    // 2) Build client and prove connectivity (helps distinguish auth vs network issues)
    const blobServiceClient = BlobServiceClient.fromConnectionString(conn);
    try {
      const acct = await blobServiceClient.getAccountInfo();
    //   console.log("✅ Account reachable. SKU:", acct?.skuName, "Blob public access:", acct?.blobPublicAccess);
    } catch (probeErr) {
      console.error("❌ getAccountInfo() failed:", probeErr?.message || probeErr);
      return res.status(500).json({
        success: false,
        message: "Cannot reach Azure Blob service (check network/DNS/proxy or credentials).",
        error: probeErr?.message || String(probeErr),
      });
    }

    // 3) Validate container name
    const containerName = String(req.body.containerName || "photos").trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(containerName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid containerName. Use lowercase letters, numbers or dashes only."
      });
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "container" });

    // 4) Build blob name & headers
    const ext = (req.file.originalname.split(".").pop() || "").toLowerCase();
    const contentType = getContentType(ext);
    const safeName = req.file.originalname.replace(/[^\w.\-()]/g, "_");
    const blobName = `${Date.now()}-${safeName}`;

    // 5) Upload
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    const blobUrl = blockBlobClient.url;
    // console.log("✅ Uploaded:", blobUrl);

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      blobUrl,
      fileName: req.file.originalname,
      contentType,
      containerName,
    });
  } catch (error) {
    console.error("❌ Azure upload error:", error?.message || error, error?.stack || "");
    return res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: error?.message || String(error),
    });
  }
};
