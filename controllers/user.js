const asyncHandler = require('../middleware/async');
const createError = require('http-errors');
const User = require('../models/User.model');
const cloudinary = require('../utils/cloudinary');

// @desc    Upload avatar
// @route   POST /api/v1/user/upload-avatar
// @access  Private

exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id).select('+cloudinaryIid');

  if (user.cloudinaryIid) {
    await cloudinary.uploader.destroy(user.cloudinaryIid);
  }
  const result = await cloudinary.uploader.upload(req.file.path);
  const data = {
    avatar: result.secure_url || user.avatar,
    cloudinaryIid: result.public_id || user.cloudinaryIid,
  };
  user = await User.findByIdAndUpdate(req.user.id, data, {
    new: true,
  });
  res.status(200).json({ success: true, data: user });
});

exports.deleteAvatar = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id).select('+cloudinaryIid');

  if (!user.cloudinaryIid) throw createError.BadRequest(`Missing image`);
  await cloudinary.uploader.destroy(user.cloudinaryIid);

  const data = {
    avatar: '',
    cloudinaryIid: '',
  };
  user = await User.findByIdAndUpdate(req.user.id, data, {
    new: true,
  });
  res.status(200).json({ success: true, data: user });
});
