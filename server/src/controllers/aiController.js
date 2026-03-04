const asyncHandler = require('../middlewares/asyncHandler');
const { generatePropertyDescription, generateChatbotReply } = require('../services/aiService');

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

const chatWithAssistant = asyncHandler(async (req, res) => {
  const { message, propertyContext } = req.body;
  const reply = await generateChatbotReply({ message, propertyContext });
  return res.json({ success: true, data: { reply } });
});

module.exports = {
  createPropertyDescription,
  chatWithAssistant,
};
