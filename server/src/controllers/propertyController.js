const Property = require('../models/Property');
const Lead = require('../models/Lead');
const asyncHandler = require('../middlewares/asyncHandler');

const createProperty = asyncHandler(async (req, res) => {
  const property = await Property.create({
    ...req.body,
    createdBy: req.user._id,
  });

  return res.status(201).json({ success: true, data: property });
});

const getProperties = asyncHandler(async (req, res) => {
  const { location, minPrice, maxPrice, status, page = 1, limit = 10 } = req.query;

  const filters = {};
  if (location) filters.location = { $regex: location, $options: 'i' };
  if (status) filters.status = status;
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Property.find(filters)
      .populate('assignedAgent', 'name email role')
      .populate('createdBy', 'name email role')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Property.countDocuments(filters),
  ]);

  return res.json({
    success: true,
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate('assignedAgent', 'name email role')
    .populate('createdBy', 'name email role');

  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  return res.json({ success: true, data: property });
});

const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  const isAdmin = req.user.role === 'admin';
  const isCreator = property.createdBy.toString() === req.user._id.toString();
  if (!isAdmin && !isCreator) {
    return res.status(403).json({ success: false, message: 'Not allowed to edit this property' });
  }

  const prevStatus = property.status;
  Object.assign(property, req.body);
  await property.save();

  // When a property is sold, close related leads automatically.
  if (prevStatus !== 'sold' && property.status === 'sold') {
    await Lead.updateMany({ interestProperty: property._id, status: { $ne: 'closed' } }, { status: 'closed' });
  }

  return res.json({ success: true, data: property });
});

const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  await property.deleteOne();
  return res.json({ success: true, message: 'Property deleted successfully' });
});

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
