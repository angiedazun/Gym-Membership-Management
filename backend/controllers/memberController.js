const Member  = require('../models/Member');
const Plan    = require('../models/Plan');
const QRCode  = require('qrcode');

// @route   GET /api/members
const getMembers = async (req, res) => {
  try {
    const { search, status, plan, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { phone:    { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
        { email:    { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (plan)   query.plan   = plan;

    const total   = await Member.countDocuments(query);
    const members = await Member.find(query)
      .populate('plan', 'name price color durationDays')
      .populate('trainer', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   GET /api/members/:id
const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('plan')
      .populate('trainer');
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   POST /api/members
const createMember = async (req, res) => {
  try {
    const plan = await Plan.findById(req.body.plan);
    if (!plan) return res.status(400).json({ success: false, message: 'Plan not found.' });

    const start   = new Date(req.body.membershipStart || Date.now());
    const expiry  = new Date(start);
    expiry.setDate(expiry.getDate() + plan.durationDays);

    // Convert empty-string ObjectId fields to undefined so Mongoose doesn't fail casting
    const body = { ...req.body };
    if (!body.trainer) delete body.trainer;

    const member = await Member.create({
      ...body,
      membershipStart:  start,
      membershipExpiry: expiry,
      status:           'active',
    });

    // Generate QR code (data = memberId)
    const qr = await QRCode.toDataURL(member._id.toString());
    member.qrCode = qr;
    await member.save();

    res.status(201).json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   PUT /api/members/:id
const updateMember = async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.trainer) body.trainer = null;

    const member = await Member.findByIdAndUpdate(req.params.id, body, {
      new: true, runValidators: true,
    }).populate('plan').populate('trainer');

    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   DELETE /api/members/:id
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.json({ success: true, message: 'Member deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   GET /api/members/expiring
const getExpiringMembers = async (req, res) => {
  try {
    const days  = parseInt(req.query.days) || 7;
    const today = new Date();
    const limit = new Date(today);
    limit.setDate(limit.getDate() + days);

    const members = await Member.find({
      status:           'active',
      membershipExpiry: { $gte: today, $lte: limit },
    }).populate('plan', 'name');

    res.json({ success: true, count: members.length, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   POST /api/members/:id/photo
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const photoUrl = `/uploads/members/${req.file.filename}`;
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { profilePhoto: photoUrl },
      { new: true }
    );
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.json({ success: true, profilePhoto: photoUrl, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMembers, getMember, createMember, updateMember, deleteMember, getExpiringMembers, uploadPhoto };
