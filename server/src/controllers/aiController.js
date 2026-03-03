const asyncHandler = require('../middlewares/asyncHandler');
const { generatePropertyDescription } = require('../services/aiService');

const createPropertyDescription = asyncHandler(async (req, res) => {
  const { bedrooms, location, price, features } = req.body;

  const result = await generatePropertyDescription({
    bedrooms,
    location,
    price,
    features,
  });

  return res.json({ success: true, data: result });
});

module.exports = {
  createPropertyDescription,
};
