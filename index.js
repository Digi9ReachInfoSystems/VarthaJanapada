const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet"); // ✅ for security headers
const connectDB = require("./src/config/mongoConnect");

const newsRoutes = require("./src/routes/newsRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const tagRoutes = require("./src/routes/tagRoutes");
const userRoutes = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRoutes");
const bannerRoutes = require("./src/routes/bannerRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const videoRoutes = require("./src/routes/videoRoutes");
const magazine = require("./src/routes/magazineRoutes");
const longVideo = require("./src/routes/longVideoRoutes");
const sessionRoutes = require("./src/routes/sessionRoutes");
const visitorRoutes = require("./src/routes/visitorRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const magazineRoutes2 = require("./src/routes/magazineRoutes2");
const wishlistRoutes = require("./src/routes/wishlistRoutes");
const announcement = require("./src/routes/announcementRoutes");
const readingHistoryRoutes = require("./src/routes/readingHistoryRoutes");
const recommendationRoutes = require("./src/routes/recommendationRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const searchContent = require("./src/routes/searchRoutes");
const photoRoutes = require("./src/routes/photosRoutes");
const staticRoutes = require("./src/routes/staticpageRoutes");
const latestNotificationRoutes = require("./src/routes/latestNotificationRoutes");
const playlistRoutes = require("./src/routes/playlistRoutes");

const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 3000;

// ✅ Secure CORS settings
const corsOptions = {
  origin: [
    "https://diprwebapp.gully2global.in",
    "https://dipradmin.gully2global.in",
    "https://dipr.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://frontend-digi9.vercel.app",
    "http://164.164.198.29:8192",
    "https://diprkarnataka.duckdns.org"
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        frameSrc: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), fullscreen=(self)"
  );
  next();
});

connectDB();
app.use(express.json());

app.use("/api/news", newsRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/magazine", magazine);
app.use("/api/longVideo", longVideo);
app.use("/sessions", sessionRoutes);
app.use("/visitors", visitorRoutes);
app.use("/notifications", notificationRoutes);
app.use("/api/magazine2", magazineRoutes2);
app.use("/wishlist", wishlistRoutes);
app.use("/announcement", announcement);
app.use("/api/reading-history", readingHistoryRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/search", searchContent);
app.use("/api/photos", photoRoutes);
app.use("/api/static", staticRoutes);
app.use("/api/latestnotifications", latestNotificationRoutes);
app.use("/api/playlist", playlistRoutes);

app.get("/", (req, res) => {
  res.send("Server running securely!");
});

app.listen(port, () => {
  console.log(` Secure server running on port ${port}`);
});
