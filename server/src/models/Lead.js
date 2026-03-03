const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    budget: { type: Number },
    preferredLocation: { type: String, trim: true },
    message: { type: String, trim: true },
    interestProperty: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'inspection', 'closed'],
      default: 'new',
    },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    aiScore: { type: Number, min: 1, max: 10 },
    classification: { type: String },
    reasoning: { type: String },
    aiResponseDraft: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
