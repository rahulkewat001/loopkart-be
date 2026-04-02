const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  filters: {
    query:      { type: String },
    category:   { type: String },
    minPrice:   { type: Number },
    maxPrice:   { type: Number },
    condition:  { type: String },
    location:   { type: String },
    rating:     { type: Number },
  },
  alertEnabled: { type: Boolean, default: true },
  lastNotified: { type: Date },
  matchCount:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
