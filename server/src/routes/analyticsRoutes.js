const express = require('express');
const { overview } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/overview', protect, authorize('admin', 'agent'), overview);

module.exports = router;
