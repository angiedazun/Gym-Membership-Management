const Attendance = require('../models/Attendance');
const Member     = require('../models/Member');

// @route   POST /api/attendance/checkin
const checkIn = async (req, res) => {
  try {
    const { memberId, method } = req.body;

    // Accept either MongoDB _id or memberId string
    const member = await Member.findOne({
      $or: [{ _id: memberId.length === 24 ? memberId : null }, { memberId }],
    });

    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (member.status !== 'active')
      return res.status(400).json({ success: false, message: `Membership is ${member.status}.` });

    // Check if already checked in today (no checkout)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({
      member:   member._id,
      checkIn:  { $gte: today },
      checkOut: null,
    });
    if (existing) return res.status(400).json({ success: false, message: 'Already checked in.' });

    const record = await Attendance.create({ member: member._id, method: method || 'manual' });
    res.status(201).json({ success: true, message: `Welcome, ${member.name}!`, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   PUT /api/attendance/checkout/:id
const checkOut = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { checkOut: new Date() },
      { new: true }
    ).populate('member', 'name memberId');

    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   GET /api/attendance
const getAttendance = async (req, res) => {
  try {
    const { memberId, date, page = 1, limit = 20 } = req.query;
    const query = {};

    if (memberId) query.member = memberId;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.checkIn = { $gte: start, $lte: end };
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('member', 'name memberId profilePhoto')
      .sort({ checkIn: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   GET /api/attendance/today
const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const records = await Attendance.find({ checkIn: { $gte: today } })
      .populate('member', 'name memberId profilePhoto')
      .sort({ checkIn: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { checkIn, checkOut, getAttendance, getTodayAttendance };
