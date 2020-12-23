const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const createError = require('http-errors');
const User = require('../models/User.model');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set Token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exist
  if (!token)
    throw createError.Unauthorized('Not authorized to access this route');

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    console.log(error.message);
    throw createError.Unauthorized(error.message);
  }
});
