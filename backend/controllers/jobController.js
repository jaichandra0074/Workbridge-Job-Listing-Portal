const Job = require('../models/Job');

// GET /api/jobs  — list with filters, search, pagination
exports.getJobs = async (req, res, next) => {
  try {
    const { search, type, remote, category, exp, page = 1, limit = 12, open } = req.query;
    const query = {};

    if (search)    query.$text = { $search: search };
    if (type)      query.type = type;
    if (category)  query.category = category;
    if (remote !== undefined) query.remote = remote === 'true';
    if (open !== undefined)   query.open   = open === 'true';
    else query.open = true;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const jobs  = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('postedBy', 'name company');

    res.json({ success: true, count: jobs.length, total, pages: Math.ceil(total / limit), jobs });
  } catch (err) { next(err); }
};

// GET /api/jobs/:id
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name company website');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.views += 1;
    await job.save();
    res.json({ success: true, job });
  } catch (err) { next(err); }
};

// POST /api/jobs  (employer only)
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json({ success: true, job });
  } catch (err) { next(err); }
};

// PUT /api/jobs/:id  (owner only)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized to update this job' });

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, job });
  } catch (err) { next(err); }
};

// DELETE /api/jobs/:id  (owner / admin)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    await job.deleteOne();
    res.json({ success: true, message: 'Job removed' });
  } catch (err) { next(err); }
};

// GET /api/jobs/employer/my-jobs  (employer's own listings)
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) { next(err); }
};
