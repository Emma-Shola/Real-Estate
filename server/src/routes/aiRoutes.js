const express = require('express');
const { body } = require('express-validator');
const { createPropertyDescription, chatWithAssistant } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');

const router = express.Router();

router.post(
  '/chatbot-public',
  [body('message').isString().isLength({ min: 2, max: 1200 }), body('propertyContext').optional().isString().isLength({ max: 4000 })],
  validateRequest,
  chatWithAssistant
);

router.post(
  '/generate-description',
  protect,
  authorize('admin', 'agent'),
  [
    body('bedrooms').isNumeric(),
    body('location').notEmpty(),
    body('price').notEmpty(),
    body('features').notEmpty(),
  ],
  validateRequest,
  createPropertyDescription
);

module.exports = router;
