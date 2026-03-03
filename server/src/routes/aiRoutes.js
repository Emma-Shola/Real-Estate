const express = require('express');
const { body } = require('express-validator');
const { createPropertyDescription } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');

const router = express.Router();

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
