const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
  },
  clickedAt: {
    type: Date,
    default: Date.now,
  },
  browser: String,
  os: String,
  deviceType: String,
  country: String,
  city: String,
  referrer: String,
  ip: String,
});

module.exports = mongoose.model('Click', clickSchema);
