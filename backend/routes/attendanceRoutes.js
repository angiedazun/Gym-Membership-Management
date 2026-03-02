const router = require('express').Router();
const { checkIn, checkOut, getAttendance, getTodayAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/checkin',         checkIn);
router.put('/checkout/:id',     checkOut);
router.get('/today',            getTodayAttendance);
router.get('/',                 getAttendance);

module.exports = router;
