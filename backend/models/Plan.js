const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },  // e.g. Basic, Gold, Platinum
    description:    { type: String, default: '' },
    durationDays:   { type: Number, required: true },              // 30, 90, 180, 365
    price:          { type: Number, required: true },              // in LKR
    features:       [{ type: String }],                            // ['Gym access', 'Locker', ...]
    isActive:       { type: Boolean, default: true },
    color:          { type: String, default: '#6366f1' },          // for UI badge
    maxMembers:     { type: Number, default: 0 },                  // 0 = unlimited
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
