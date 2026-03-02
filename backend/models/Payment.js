const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId:    { type: String, unique: true },  // PAY-0001
    member:       { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    plan:         { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    amount:       { type: Number, required: true },
    discount:     { type: Number, default: 0 },
    finalAmount:  { type: Number, required: true },
    method:       { type: String, enum: ['cash', 'card', 'bank_transfer', 'online'], default: 'cash' },
    status:       { type: String, enum: ['paid', 'pending', 'failed', 'refunded'], default: 'paid' },
    paymentDate:  { type: Date, default: Date.now },
    validFrom:    { type: Date, required: true },
    validTo:      { type: Date, required: true },
    reference:    { type: String, default: '' },  // receipt / transaction ref
    notes:        { type: String, default: '' },
    collectedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate paymentId
paymentSchema.pre('save', async function (next) {
  if (!this.paymentId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentId = `PAY-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
