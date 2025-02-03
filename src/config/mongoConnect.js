const mongoose = require("mongoose");
const dotenv = require("dotenv");


dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
    });
    console.log("MongoDB connected successfully!LET'S GO");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
