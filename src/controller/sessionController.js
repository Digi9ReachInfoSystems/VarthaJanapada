const Session = require("../models/sessionDuration"); // Assuming the Session model is in models/session.js

// Start a new session
exports.startSession = async (req, res) => {
  try {
    const { userId, platform } = req.body; // Get userId and platform (web/mobile) from the request body

    // Ensure the platform is either web or mobile
    if (!["web", "mobile"].includes(platform)) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    // Create a new session
    const session = new Session({
      userId,
      platform,
      startTime: new Date(),
    });

    await session.save();
    return res
      .status(201)
      .json({ message: "Session started", sessionId: session._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// End an existing session
exports.endSession = async (req, res) => {
  try {
    const { userId } = req.body; // Get userId from the request body

    // Find the active session of the user
    const session = await Session.findOne({ userId, endTime: null }).sort({
      startTime: -1,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // End the session by setting the end time and calculating the duration
    session.endTime = new Date();
    session.duration = (session.endTime - session.startTime) / 1000; // Duration in seconds
    await session.save();

    return res
      .status(200)
      .json({ message: "Session ended", sessionId: session._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Calculate average time spent on the app (Web + Mobile combined)
exports.calculateAverageTimeSpent = async (req, res) => {
  try {
    // Get all sessions that have an end time and calculate total duration
    const sessions = await Session.find({ endTime: { $ne: null } }); // Find sessions that have ended
    const totalDuration = sessions.reduce(
      (acc, session) => acc + session.duration,
      0
    );
    const averageTime = totalDuration / sessions.length; // Average time in seconds

    return res.status(200).json({
      message: "Average time calculated",
      averageTime: `${Math.round(averageTime)} seconds`, // You can convert this to minutes if needed
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Calculate average time spent on the app separately for web and mobile
exports.calculateAverageTimeByPlatform = async (req, res) => {
  try {
    const { platform } = req.query; // Get the platform from the query (web/mobile)

    if (!["web", "mobile"].includes(platform)) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    // Get sessions based on platform and calculate total duration
    const sessions = await Session.find({ platform, endTime: { $ne: null } });
    const totalDuration = sessions.reduce(
      (acc, session) => acc + session.duration,
      0
    );
    const averageTime = totalDuration / sessions.length; // Average time in seconds

    return res.status(200).json({
      message: `Average time spent on ${platform} calculated`,
      averageTime: `${Math.round(averageTime)} seconds`, // You can convert this to minutes if needed
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
