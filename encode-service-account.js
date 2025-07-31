const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "serviceAccount.json");
try {
  const json = fs.readFileSync(filePath, "utf-8");
  const base64 = Buffer.from(json).toString("base64");
  console.log("\n✅ Copy this into your .env file as:\n");
  console.log("FIREBASE_SERVICE_ACCOUNT_BASE64=" + base64);
} catch (err) {
  console.error("❌ Error:", err.message);
}
