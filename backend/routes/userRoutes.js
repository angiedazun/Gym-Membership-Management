const router = require('express').Router();
const { getUsers, createUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',       protect, authorize('admin'), getUsers);
router.post('/',      protect, authorize('admin'), createUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
