const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');

const router = express.Router();

router.get(
  '/',
  [
    query('minPrice').optional().isNumeric(),
    query('maxPrice').optional().isNumeric(),
    query('status').optional().isIn(['available', 'sold', 'rented']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  getProperties
);

router.get('/:id', [param('id').isMongoId()], validateRequest, getPropertyById);

router.post(
  '/',
  protect,
  authorize('admin', 'agent'),
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('price').isNumeric(),
    body('location').notEmpty(),
    body('type').notEmpty(),
    body('status').optional().isIn(['available', 'sold', 'rented']),
    body('assignedAgent').optional().isMongoId(),
  ],
  validateRequest,
  createProperty
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'agent'),
  [param('id').isMongoId(), body('status').optional().isIn(['available', 'sold', 'rented'])],
  validateRequest,
  updateProperty
);

router.delete('/:id', protect, authorize('admin'), [param('id').isMongoId()], validateRequest, deleteProperty);

module.exports = router;
