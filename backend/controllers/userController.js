const User = require('../models/User');

// @desc  Get all staff/admin users
// @route GET /api/users
// @access Admin only
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['admin', 'staff'] } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Create a staff user
// @route POST /api/users
// @access Admin only
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use.' });

    const user = await User.create({ name, email, password, role: role || 'staff' });
    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete a user
// @route DELETE /api/users/:id
// @access Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUsers, createUser, deleteUser };
