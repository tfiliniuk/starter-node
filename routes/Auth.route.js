const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  refreshToken,
  updatePassword,
  updateDetails,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth');
// const { verifyAccessToken } = require('../helpers/jwt_helper');

router.post('/register', register);

router.post('/login', login);

router.post('/refresh-token', refreshToken);
router.post('/update-password', protect, updatePassword);
router.put('/update-details', protect, updateDetails);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

router.get('/me', protect, getMe);
module.exports = router;
