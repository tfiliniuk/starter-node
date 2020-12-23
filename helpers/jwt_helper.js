const JWT = require('jsonwebtoken');
const createError = require('http-errors');

module.exports = {
  // signAccessToken: (userId) => {
  //   return new Promise((resolve, reject) => {
  //     const payload = {
  //       id: userId,
  //     };
  //     const secret = process.env.ACCESS_TOKEN_SECRET;
  //     const options = {
  //       expiresIn: '15s',
  //       issuer: 'pickurpage.com',
  //     };
  //     JWT.sign(payload, secret, options, (err, token) => {
  //       if (err) {
  //         reject(createError.InternalServerError());
  //       }
  //       resolve(token);
  //     });
  //   });
  // },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers['authorization']) return next(createError.Unauthorized());
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        const message =
          err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
        return next(createError.Unauthorized(message));
      }
      req.payload = decoded;
      next();
    });
  },
  // signRefreshToken: (userId) => {
  //   return new Promise((resolve, reject) => {
  //     const payload = {
  //       id: userId,
  //     };
  //     const secret = process.env.REFRESH_TOKEN_SECRET;
  //     const options = {
  //       expiresIn: '1y',
  //       issuer: 'pickurpage.com',
  //     };
  //     JWT.sign(payload, secret, options, (err, token) => {
  //       if (err) {
  //         reject(createError.InternalServerError());
  //       }
  //       resolve(token);
  //     });
  //   });
  // },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (error, payload) => {
          if (error) return reject(createError.Unauthorized());
          const userId = payload.id;
          resolve(userId);
        }
      );
    });
  },
};
