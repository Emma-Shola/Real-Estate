const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../middlewares/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, agencyName } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ success: false, message: 'Email already in use' });
  }

  const user = await User.create({ name, email, password, role, agencyName });

  return res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      agencyName: user.agencyName,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  return res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      agencyName: user.agencyName,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  return res.json({ success: true, user: req.user });
});

const getAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({ role: 'agent' }).select('name email role agencyName createdAt');
  return res.json({ success: true, data: agents });
});

module.exports = {
  register,
  login,
  me,
  getAgents,
};
