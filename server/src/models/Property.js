const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    images: [{ type: String }],
    status: { type: String, enum: ['available', 'sold', 'rented'], default: 'available' },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

propertySchema.index({ location: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ status: 1 });

module.exports = mongoose.model('Property', propertySchema);
