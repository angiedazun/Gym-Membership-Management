const Member     = require('../models/Member');
const Payment    = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Trainer    = require('../models/Trainer');
const Plan       = require('../models/Plan');

// @route   GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parallel queries for speed
    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      totalTrainers,
      todayAttendance,
      monthlyRevenue,
      totalRevenue,
      expiringThisWeek,
      recentMembers,
      planDistribution,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'active' }),
      Member.countDocuments({ status: 'expired' }),
      Trainer.countDocuments({ isActive: true }),
      Attendance.countDocuments({ checkIn: { $gte: today } }),

      // Revenue this month
      Payment.aggregate([
        {
          $match: {
            status: 'paid',
            paymentDate: {
              $gte: new Date(today.getFullYear(), today.getMonth(), 1),
              $lte: new Date(today.getFullYear(), today.getMonth() + 1, 0),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } },
      ]),

      // Total revenue all time
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } },
      ]),

      // Members expiring in 7 days
      Member.countDocuments({
        status: 'active',
        membershipExpiry: {
          $gte: today,
          $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      }),

      // 5 most recent members
      Member.find()
        .populate('plan', 'name color')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name memberId status membershipExpiry'),

      // Members per plan
      Member.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'plans', localField: '_id', foreignField: '_id', as: 'plan',
          },
        },
        { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name:  { $ifNull: ['$plan.name', 'No Plan'] },
            color: { $ifNull: ['$plan.color', '#6b7280'] },
            count: 1,
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalMembers,
        activeMembers,
        expiredMembers,
        totalTrainers,
        todayAttendance,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        totalRevenue:   totalRevenue[0]?.total   || 0,
        expiringThisWeek,
      },
      recentMembers,
      planDistribution,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard };
