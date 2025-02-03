const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/mongoConnect");
const newsRoutes = require("./routes/newsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const commentRoutes = require("./routes/commentRoutes");
const videoRoutes = require("./routes/videoRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
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

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
