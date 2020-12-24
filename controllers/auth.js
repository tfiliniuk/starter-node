const asyncHandler = require('../middleware/async');
const createError = require('http-errors');
const sendEmail = require('../utils/sendEmail');

const User = require('../models/User.model');

const { authSchema, loginSchema } = require('../helpers/validation_schema');
const {
  // signAccessToken,
  // signRefreshToken,
  verifyRefreshToken,
} = require('../helpers/jwt_helper');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const doesExist = await User.findOne({ email: result.email });
    if (doesExist)
      throw createError.Conflict(`${result.email} is already been registered`);

    const user = await User.create({
      name: result.name,
      email: result.email,
      password: result.password,
      role: result.role,
    });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await loginSchema.validateAsync(req.body);

    const user = await User.findOne({ email: result.email }).select(
      '+password'
    );

    if (!user) throw createError.NotFound('User not registered');

    const isMatch = await user.isValidPassword(result.password);

    if (!isMatch) throw createError.Unauthorized('Username/Password not valid');
    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest('Invalid Username or Password'));
    next(error);
  }
};

exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw createError.BadRequest();

  const userId = await verifyRefreshToken(refreshToken);
  const user = await User.findById(userId);
  sendTokenResponse(user, 201, res);
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.isValidPassword(req.body.currentPassword))) {
    throw createError.Unauthorized('Password is incorrect');
  }

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({ success: true, data: user });
});

// @desc    Update user detail
// @route   PUT /api/v1/auth/update-details
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Forgot password
// @route   GET /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    '+resetPasswordToken',
    '+resetPasswordExpire'
  );

  if (!user) throw createError.NotFound('There is no user with that email');

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/auth/reset-password/${resetToken}`;

  const message = `You are receiving email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw createError.BadRequest('Email could not be sent');
  }

  // res.status(200).json({
  //   success: true,
  //   data: user,
  // });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const accessToken = user.getSignedJwtToken();
  const refreshToken = user.getSignedRefreshJwtToken();

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
  });
};
