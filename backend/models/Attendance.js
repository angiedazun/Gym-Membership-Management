const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    member:     { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    checkIn:    { type: Date, default: Date.now },
    checkOut:   { type: Date, default: null },
    method:     { type: String, enum: ['qr', 'manual', 'card'], default: 'manual' },
    notes:      { type: String, default: '' },
  },
  { timestamps: true }
);

// Virtual: duration in minutes
attendanceSchema.virtual('duration').get(function () {
  if (this.checkOut) {
    return Math.round((this.checkOut - this.checkIn) / 60000);
  }
  return null;
});

attendanceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
