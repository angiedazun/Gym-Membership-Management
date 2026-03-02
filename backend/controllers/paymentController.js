const Payment      = require('../models/Payment');
const Member       = require('../models/Member');
const Plan         = require('../models/Plan');
const emailService = require('../services/emailService');

// @route   GET /api/payments
const getPayments = async (req, res) => {
  try {
    const { memberId, status, method, page = 1, limit = 10 } = req.query;
    const query = {};
    if (memberId) query.member = memberId;
    if (status)   query.status = status;
    if (method)   query.method = method;

    const total    = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('member', 'name memberId phone')
      .populate('plan',   'name price')
      .populate('collectedBy', 'name')
      .sort({ paymentDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   POST /api/payments
const createPayment = async (req, res) => {
  try {
    const { memberId, planId, amount, discount = 0, method, notes } = req.body;

    const member = await Member.findById(memberId);
    const plan   = await Plan.findById(planId);

    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (!plan)   return res.status(404).json({ success: false, message: 'Plan not found.' });

    const finalAmount = amount - discount;
    const validFrom   = new Date();
    const validTo     = new Date();
    validTo.setDate(validTo.getDate() + plan.durationDays);

    const payment = await Payment.create({
      member:       memberId,
      plan:         planId,
      amount,
      discount,
      finalAmount,
      method:       method || 'cash',
      status:       'paid',
      paymentDate:  new Date(),
      validFrom,
      validTo,
      notes,
      collectedBy:  req.user._id,
    });

    // Update member plan & expiry
    member.plan             = planId;
    member.membershipStart  = validFrom;
    member.membershipExpiry = validTo;
    member.status           = 'active';
    await member.save();

    const populated = await Payment.findById(payment._id)
      .populate('member', 'name memberId email')
      .populate('plan', 'name');

    // Send receipt email (non-blocking)
    emailService.sendPaymentReceipt(populated.member, populated, populated.plan)
      .catch((e) => console.error('Email receipt error:', e.message));

    res.status(201).json({ success: true, payment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   GET /api/payments/summary
const getPaymentSummary = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthly = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          paymentDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id:         { $month: '$paymentDate' },
          revenue:     { $sum: '$finalAmount' },
          count:       { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing months with 0
    const months = Array.from({ length: 12 }, (_, i) => {
      const found = monthly.find((m) => m._id === i + 1);
      return { month: i + 1, revenue: found ? found.revenue : 0, count: found ? found.count : 0 };
    });

    const totalRevenue = months.reduce((acc, m) => acc + m.revenue, 0);

    res.json({ success: true, year: Number(year), totalRevenue, months });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPayments, createPayment, getPaymentSummary };
