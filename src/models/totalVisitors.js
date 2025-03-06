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

// Create the model for 'totalVistor' (ensure proper naming convention for the model)
const TotalVisitor = mongoose.model("TotalVisitor", totalVisitSchema);

module.exports = TotalVisitor;
