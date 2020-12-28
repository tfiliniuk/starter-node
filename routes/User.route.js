const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../utils/multer');

const {
  uploadAvatar,
  deleteAvatar,
  getAllUsers,
} = require('../controllers/user');

router.post('/upload-avatar', protect, upload.single('file'), uploadAvatar);
router.delete('/delete-avatar', protect, deleteAvatar);
router.get('/all-users', getAllUsers);

module.exports = router;
