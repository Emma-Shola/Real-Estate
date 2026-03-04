const express = require('express');
const { body } = require('express-validator');
const { register, login, me, getAgents } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'agent']),
  ],
  validateRequest,
  authLimiter,
  register
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validateRequest, authLimiter, login);
router.get('/me', protect, me);
router.get('/agents', protect, authorize('admin'), getAgents);

module.exports = router;
