const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
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
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: "https://dipr.vercel.app", // Allow only requests from this origin
  credentials: true, // Allow credentials (cookies, headers)
};

app.use(cors(corsOptions));
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

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
