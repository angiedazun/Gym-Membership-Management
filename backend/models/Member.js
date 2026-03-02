const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    memberId:         { type: String, unique: true },   // M-0001
    name:             { type: String, required: true, trim: true },
    email:            { type: String, unique: true, sparse: true, lowercase: true },
    phone:            { type: String, required: true },
    address:          { type: String, default: '' },
    dateOfBirth:      { type: Date },
    gender:           { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    profilePhoto:     { type: String, default: '' },
    
    // Membership
    plan:             { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    trainer:          { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', default: null },
    membershipStart:  { type: Date, default: Date.now },
    membershipExpiry: { type: Date },
    status:           { type: String, enum: ['active', 'expired', 'suspended', 'pending'], default: 'pending' },
    
    // QR Code
    qrCode:           { type: String, default: '' },

    // Emergency
    emergencyContact: { name: String, phone: String, relation: String },
    
    // Notes
    notes:            { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate memberId
memberSchema.pre('save', async function (next) {
  if (!this.memberId) {
    const count = await mongoose.model('Member').countDocuments();
    this.memberId = `M-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);
