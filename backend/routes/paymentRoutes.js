const router = require('express').Router();
const { getPayments, createPayment, getPaymentSummary } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getPaymentSummary);
router.route('/')
  .get(getPayments)
  .post(createPayment);

module.exports = router;
