const rateLimit = require('express-rate-limit');

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const max = Number(process.env.RATE_LIMIT_MAX || 200);
const authMax = Number(process.env.AUTH_RATE_LIMIT_MAX || 20);

const baseConfig = {
  windowMs,
  standardHeaders: true,
  legacyHeaders: false,
};

const apiLimiter = rateLimit({
  ...baseConfig,
  max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

const authLimiter = rateLimit({
  ...baseConfig,
  max: authMax,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};

