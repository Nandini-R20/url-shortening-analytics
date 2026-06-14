const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Url",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  browser: String,
  os: String,
  device: String,
  ip: String,
});

module.exports = mongoose.model("Visit", visitSchema);

