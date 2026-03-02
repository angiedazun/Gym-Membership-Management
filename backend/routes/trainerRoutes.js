const router = require('express').Router();
const { getTrainers, getTrainer, createTrainer, updateTrainer, deleteTrainer } = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTrainers)
  .post(createTrainer);

router.route('/:id')
  .get(getTrainer)
  .put(updateTrainer)
  .delete(authorize('admin'), deleteTrainer);

module.exports = router;
