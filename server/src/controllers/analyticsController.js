const Lead = require('../models/Lead');
const Property = require('../models/Property');
const asyncHandler = require('../middlewares/asyncHandler');

const overview = asyncHandler(async (req, res) => {
  const [totalLeads, hotLeads, closedLeads, totalProperties, soldProperties, closeStats] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ $or: [{ aiScore: { $gte: 8 } }, { classification: /^hot$/i }] }),
    Lead.countDocuments({ status: 'closed' }),
    Property.countDocuments(),
    Property.countDocuments({ status: 'sold' }),
    Lead.aggregate([
      { $match: { status: 'closed' } },
      {
        $project: {
          closingDays: {
            $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60 * 24],
          },
        },
      },
      { $group: { _id: null, avgDays: { $avg: '$closingDays' } } },
    ]),
  ]);

  const conversionRate = totalLeads ? (closedLeads / totalLeads) * 100 : 0;
  const averageClosingTime = closeStats[0]?.avgDays || 0;

  return res.json({
    success: true,
    data: {
      totalLeads,
      hotLeads,
      conversionRate: Number(conversionRate.toFixed(2)),
      totalProperties,
      soldProperties,
      averageClosingTime: Number(averageClosingTime.toFixed(2)),
    },
  });
});

module.exports = { overview };
