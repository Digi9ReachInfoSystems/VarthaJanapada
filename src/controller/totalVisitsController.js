const totalVistor = require("../models/totalVisitors");

exports.registerVisit = async (req, res) => {
  try {
    // Validate that totalVisits and time are provided
    if (!req.body.totalVisits || !req.body.time) {
      return res
        .status(400)
        .json({ error: "totalVisits and time are required" });
    }

    const visit = new totalVistor({
      totalVisits: req.body.totalVisits,
      time: req.body.time,
    });

    await visit.save();
    res.status(201).json(visit);
  } catch (error) {
    console.error("Error during save:", error);
    res.status(500).json({ error: "Failed to register visit" });
  }
};

exports.getTotalVisitors = async (req, res) => {
  try {
    // Get the total number of documents in the collection
    const totalVisits = await totalVistor.countDocuments();

    res.status(200).json({ totalVisits });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch total visitors" });
  }
};

exports.getPeakTimeAverage = async (req, res) => {
  try {
    // Aggregate by hour (you can change the `$hour` part to any other time unit)
    const peakTime = await totalVistor.aggregate([
      {
        $project: {
          hour: { $hour: "$time" }, // Group by hour
        },
      },
      {
        $group: {
          _id: "$hour", // Group by the hour of the day
          totalVisits: { $sum: 1 }, // Count the number of visits per hour
        },
      },
      {
        $sort: { totalVisits: -1 }, // Sort by total visits in descending order
      },
      { $limit: 1 }, // Get the hour with the most visits
    ]);

    if (peakTime.length > 0) {
      res.status(200).json({
        peakTime: peakTime[0]._id,
        totalVisits: peakTime[0].totalVisits,
      });
    } else {
      res.status(404).json({ message: "No data found for peak time" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch peak time average" });
  }
};
