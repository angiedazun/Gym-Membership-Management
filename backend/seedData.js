/**
 * seedData.js – Populate the gym_membership_db with demo data.
 * Run: node seedData.js
 */
const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');
const dotenv    = require('dotenv');
dotenv.config();

const User       = require('./models/User');
const Plan       = require('./models/Plan');
const Trainer    = require('./models/Trainer');
const Member     = require('./models/Member');
const Payment    = require('./models/Payment');
const Attendance = require('./models/Attendance');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB');

  // ── Clear existing data ──────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany(),
    Plan.deleteMany(),
    Trainer.deleteMany(),
    Member.deleteMany(),
    Payment.deleteMany(),
    Attendance.deleteMany(),
  ]);
  console.log('🗑   Cleared existing data');

  // ── Users ────────────────────────────────────────────────────────────────
  const adminUser = await User.create({
    name:     'Admin User',
    email:    'admin@gym.lk',
    password: 'admin123',
    role:     'admin',
  });
  const staffUser = await User.create({
    name:     'Staff User',
    email:    'staff@gym.lk',
    password: 'staff123',
    role:     'staff',
  });
  console.log('👤  Users created  →  admin@gym.lk / admin123');

  // ── Plans ────────────────────────────────────────────────────────────────
  const plans = await Plan.insertMany([
    {
      name:         'Basic',
      description:  'Gym access only',
      durationDays: 30,
      price:        2500,
      features:     ['Gym access', 'Locker'],
      color:        '#6b7280',
    },
    {
      name:         'Silver',
      description:  'Gym + cardio zone',
      durationDays: 30,
      price:        4000,
      features:     ['Gym access', 'Cardio zone', 'Locker', 'Towel service'],
      color:        '#6366f1',
    },
    {
      name:         'Gold',
      description:  'Full access – 3 months',
      durationDays: 90,
      price:        10000,
      features:     ['Full gym access', 'Personal trainer (2/week)', 'Sauna', 'Locker', 'Towel service'],
      color:        '#f59e0b',
    },
    {
      name:         'Platinum',
      description:  'Premium annual plan',
      durationDays: 365,
      price:        35000,
      features:     ['Full gym access', 'Unlimited personal trainer', 'Sauna', 'Spa', 'Nutrition plan', 'Locker'],
      color:        '#8b5cf6',
    },
  ]);
  console.log('💳  Plans created (Basic, Silver, Gold, Platinum)');

  // ── Trainers ─────────────────────────────────────────────────────────────
  const trainers = await Trainer.insertMany([
    {
      trainerId:       'T-0001',
      name:            'Kamal Perera',
      email:           'kamal@gym.lk',
      phone:           '0771234567',
      specialization:  ['Weight Training', 'Bodybuilding'],
      experience:      8,
      salary:          60000,
    },
    {
      trainerId:       'T-0002',
      name:            'Nimal Silva',
      email:           'nimal@gym.lk',
      phone:           '0779876543',
      specialization:  ['Yoga', 'Zumba', 'Cardio'],
      experience:      5,
      salary:          50000,
    },
    {
      trainerId:       'T-0003',
      name:            'Sanduni Fernando',
      email:           'sanduni@gym.lk',
      phone:           '0712345678',
      specialization:  ['Crossfit', 'HIIT'],
      experience:      4,
      salary:          45000,
    },
  ]);
  console.log('🏃  Trainers created');

  // ── Members ──────────────────────────────────────────────────────────────
  const now      = new Date();
  const addDays  = (d, n) => new Date(d.getTime() + n * 86400000);
  const subDays  = (d, n) => new Date(d.getTime() - n * 86400000);

  const membersData = [
    { name: 'Amara Jayasinghe', phone: '0701112222', email: 'amara@email.com', plan: plans[2]._id, trainer: trainers[0]._id, membershipStart: subDays(now, 20), membershipExpiry: addDays(now, 70), status: 'active', gender: 'female' },
    { name: 'Buddhika Rathnayake', phone: '0712223333', email: 'buddhika@email.com', plan: plans[1]._id, membershipStart: subDays(now, 5), membershipExpiry: addDays(now, 25), status: 'active', gender: 'male' },
    { name: 'Chaminda De Silva', phone: '0723334444', email: 'chaminda@email.com', plan: plans[0]._id, membershipStart: subDays(now, 35), membershipExpiry: subDays(now, 5), status: 'expired', gender: 'male' },
    { name: 'Dilini Wickramasinghe', phone: '0734445555', email: 'dilini@email.com', plan: plans[3]._id, trainer: trainers[1]._id, membershipStart: subDays(now, 60), membershipExpiry: addDays(now, 305), status: 'active', gender: 'female' },
    { name: 'Eranga Gunawardena', phone: '0745556666', email: 'eranga@email.com', plan: plans[1]._id, membershipStart: subDays(now, 2), membershipExpiry: addDays(now, 28), status: 'active', gender: 'male' },
    { name: 'Fathima Siddique', phone: '0756667777', plan: plans[2]._id, trainer: trainers[2]._id, membershipStart: subDays(now, 45), membershipExpiry: addDays(now, 45), status: 'active', gender: 'female' },
    { name: 'Gayan Herath', phone: '0767778888', email: 'gayan@email.com', plan: plans[0]._id, membershipStart: subDays(now, 40), membershipExpiry: subDays(now, 10), status: 'expired', gender: 'male' },
    { name: 'Hiruni Kumari', phone: '0778889999', email: 'hiruni@email.com', plan: plans[1]._id, membershipStart: now, membershipExpiry: addDays(now, 30), status: 'active', gender: 'female' },
  ];

  // Add memberIds manually to avoid race condition in seed
  const members = await Member.insertMany(
    membersData.map((m, i) => ({ ...m, memberId: `M-${String(i + 1).padStart(4, '0')}` }))
  );
  console.log('👥  Members created (8 demo members)');

  // ── Payments ─────────────────────────────────────────────────────────────
  const paymentsData = members
    .filter((m) => m.status === 'active')
    .map((m, i) => ({
      paymentId:   `PAY-${String(i + 1).padStart(4, '0')}`,
      member:      m._id,
      plan:        m.plan,
      amount:      plans.find((p) => p._id.equals(m.plan))?.price || 2500,
      discount:    i % 3 === 0 ? 200 : 0,
      finalAmount: (plans.find((p) => p._id.equals(m.plan))?.price || 2500) - (i % 3 === 0 ? 200 : 0),
      method:      ['cash', 'card', 'bank_transfer'][i % 3],
      status:      'paid',
      paymentDate: m.membershipStart,
      validFrom:   m.membershipStart,
      validTo:     m.membershipExpiry,
      collectedBy: adminUser._id,
    }));

  await Payment.insertMany(paymentsData);
  console.log('💰  Payments created');

  // ── Attendance (last 7 days for active members) ───────────────────────────
  const activeMembers = members.filter((m) => m.status === 'active');
  const attendanceData = [];
  for (let day = 6; day >= 0; day--) {
    const date = subDays(now, day);
    date.setHours(8 + Math.floor(Math.random() * 4), 0, 0, 0);
    for (const mem of activeMembers.slice(0, 5)) {
      const checkIn  = new Date(date);
      const checkOut = new Date(date.getTime() + (60 + Math.random() * 60) * 60000);
      attendanceData.push({ member: mem._id, checkIn, checkOut, method: 'manual' });
    }
  }
  await Attendance.insertMany(attendanceData);
  console.log('📋  Attendance records created');

  console.log('\n🎉  Database seeded successfully!\n');
  console.log('   Admin login → admin@gym.lk  /  admin123');
  console.log('   Staff login → staff@gym.lk  /  staff123\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed error:', err);
  process.exit(1);
});
