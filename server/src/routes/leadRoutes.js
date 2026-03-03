const express = require('express');
const { body, param } = require('express-validator');
const { createPublicLead, getLeads, updateLead, deleteLead } = require('../controllers/leadController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');

const router = express.Router();

router.post(
  '/public',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').optional().isString(),
    body('budget').optional().isNumeric(),
    body('preferredLocation').optional().isString(),
    body('message').optional().isString(),
    body('interestProperty').optional().isMongoId(),
  ],
  validateRequest,
  createPublicLead
);

router.get('/', protect, authorize('admin', 'agent'), getLeads);

router.put(
  '/:id',
  protect,
  authorize('admin', 'agent'),
  [
    param('id').isMongoId(),
    body('status').optional().isIn(['new', 'contacted', 'inspection', 'closed']),
    body('assignedAgent').optional().isMongoId(),
  ],
  validateRequest,
  updateLead
);

router.delete('/:id', protect, authorize('admin'), [param('id').isMongoId()], validateRequest, deleteLead);

module.exports = router;
