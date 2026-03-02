const router = require('express').Router();
const { getPlans, getPlan, createPlan, updatePlan, deletePlan } = require('../controllers/planController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getPlans)
  .post(authorize('admin'), createPlan);

router.route('/:id')
  .get(getPlan)
  .put(authorize('admin'), updatePlan)
  .delete(authorize('admin'), deletePlan);

module.exports = router;
