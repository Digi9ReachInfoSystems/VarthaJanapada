const mongoose = require("mongoose");

const totalVisitSchema = new mongoose.Schema({
  totalVisits: {
    type: Number,
    default: 0,
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

const TotalVisitor = mongoose.model("TotalVisitor", totalVisitSchema);

module.exports = TotalVisitor;
