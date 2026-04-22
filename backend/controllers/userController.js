const User = require('../models/User');

// GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedJobs', 'title company logo salary type remote');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  const allowed = ['name', 'title', 'skills', 'bio', 'linkedin', 'location', 'company', 'website', 'avatar'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  try {
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// POST /api/users/save-job/:jobId
exports.saveJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const jid  = req.params.jobId;
    const idx  = user.savedJobs.indexOf(jid);

    if (idx === -1) user.savedJobs.push(jid);
    else            user.savedJobs.splice(idx, 1);

    await user.save();
    res.json({ success: true, saved: idx === -1, savedJobs: user.savedJobs });
  } catch (err) { next(err); }
};

// GET /api/users  (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) { next(err); }
};
