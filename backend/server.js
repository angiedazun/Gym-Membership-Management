const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');

dotenv.config();

const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ─── Static files (member photos) ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/users',      require('./routes/userRoutes'));
app.use('/api/members',    require('./routes/memberRoutes'));
app.use('/api/plans',      require('./routes/planRoutes'));
app.use('/api/trainers',   require('./routes/trainerRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/payments',   require('./routes/paymentRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

// ─── MongoDB Connection ──────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected → gym_membership_db');
    startCronJobs();
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀  Server running on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

// ─── Cron Jobs ───────────────────────────────────────────────────────────────
function startCronJobs() {
  // Run every day at 8 AM – mark expired memberships + send email reminders
  cron.schedule('0 8 * * *', async () => {
    const Member = require('./models/Member');
    const { sendExpiryReminder } = require('./services/emailService');
    const today = new Date();

    // Mark expired
    const result = await Member.updateMany(
      { membershipExpiry: { $lt: today }, status: 'active' },
      { $set: { status: 'expired' } }
    );
    if (result.modifiedCount > 0)
      console.log(`⏰  Cron: ${result.modifiedCount} membership(s) marked expired.`);

    // Send reminders for 7-day and 3-day expiry
    for (const days of [7, 3, 1]) {
      const from = new Date(); from.setDate(from.getDate() + days - 1);
      const to   = new Date(); to.setDate(to.getDate() + days);
      const expiring = await Member.find({
        status: 'active',
        membershipExpiry: { $gte: from, $lt: to },
        email: { $exists: true, $ne: '' },
      });
      for (const m of expiring) {
        sendExpiryReminder(m, days).catch((e) =>
          console.error(`Email reminder error for ${m.memberId}:`, e.message)
        );
      }
      if (expiring.length) console.log(`📧  Sent ${days}-day reminders to ${expiring.length} member(s).`);
    }

    // Send expired notifications
    const justExpired = await Member.find({
      status: 'expired',
      membershipExpiry: { $gte: new Date(today.getTime() - 86400000), $lt: today },
      email: { $exists: true, $ne: '' },
    });
    for (const m of justExpired) {
      sendExpiryReminder(m, 0).catch((e) =>
        console.error(`Expiry email error for ${m.memberId}:`, e.message)
      );
    }
  });
}

module.exports = app;
