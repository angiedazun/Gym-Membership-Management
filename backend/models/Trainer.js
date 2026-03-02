const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
  {
    trainerId:    { type: String, unique: true },   // T-0001
    name:         { type: String, required: true, trim: true },
    email:        { type: String, unique: true, sparse: true, lowercase: true },
    phone:        { type: String, required: true },
    specialization: [{ type: String }],             // ['Weight Training', 'Yoga', ...]
    experience:   { type: Number, default: 0 },     // years
    salary:       { type: Number, default: 0 },
    profilePhoto: { type: String, default: '' },
    bio:          { type: String, default: '' },
    schedule:     [
      {
        day:       { type: String },                // 'Monday'
        startTime: { type: String },                // '08:00'
        endTime:   { type: String },                // '17:00'
      },
    ],
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate trainerId
trainerSchema.pre('save', async function (next) {
  if (!this.trainerId) {
    const count = await mongoose.model('Trainer').countDocuments();
    this.trainerId = `T-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Trainer', trainerSchema);
