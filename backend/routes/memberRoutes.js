const router = require('express').Router();
const {
  getMembers, getMember, createMember, updateMember, deleteMember, getExpiringMembers, uploadPhoto,
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/expiring',     getExpiringMembers);
router.route('/')
  .get(getMembers)
  .post(createMember);

router.route('/:id')
  .get(getMember)
  .put(updateMember)
  .delete(authorize('admin'), deleteMember);

router.post('/:id/photo', upload.single('photo'), uploadPhoto);

module.exports = router;
