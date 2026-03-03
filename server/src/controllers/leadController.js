const Lead = require('../models/Lead');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const { analyzeLead, generateLeadResponse } = require('../services/aiService');

const createPublicLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create(req.body);

  try {
    const analysis = await analyzeLead({
      budget: lead.budget,
      preferredLocation: lead.preferredLocation,
      message: lead.message,
    });

    const responseDraft = await generateLeadResponse({
      message: lead.message,
      budget: lead.budget,
      preferredLocation: lead.preferredLocation,
    });

    lead.aiScore = analysis.score;
    lead.classification = analysis.classification;
    lead.reasoning = analysis.reasoning;
    lead.aiResponseDraft = responseDraft;
    await lead.save();
  } catch (error) {
    console.error('AI processing failed:', error.message);
  }

  return res.status(201).json({ success: true, data: lead });
});

const getLeads = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.user.role === 'agent') {
    filters.assignedAgent = req.user._id;
  }

  const leads = await Lead.find(filters)
    .populate('interestProperty', 'title location price status')
    .populate('assignedAgent', 'name email role')
    .sort({ createdAt: -1 });

  return res.json({ success: true, data: leads });
});

const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    return res.status(404).json({ success: false, message: 'Lead not found' });
  }

  if (req.user.role === 'agent') {
    const isAssigned = lead.assignedAgent && lead.assignedAgent.toString() === req.user._id.toString();
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'Agents can only update assigned leads' });
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'assignedAgent')) {
      return res.status(403).json({ success: false, message: 'Only admin can assign leads' });
    }
  }

  if (req.user.role === 'admin' && req.body.assignedAgent) {
    const assigned = await User.findById(req.body.assignedAgent);
    if (!assigned || assigned.role !== 'agent') {
      return res.status(400).json({ success: false, message: 'assignedAgent must be a valid agent ID' });
    }
  }

  Object.assign(lead, req.body);
  await lead.save();

  return res.json({ success: true, data: lead });
});

const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    return res.status(404).json({ success: false, message: 'Lead not found' });
  }

  await lead.deleteOne();
  return res.json({ success: true, message: 'Lead deleted successfully' });
});

module.exports = {
  createPublicLead,
  getLeads,
  updateLead,
  deleteLead,
};
