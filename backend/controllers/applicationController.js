const Application = require('../models/Application');
const Job         = require('../models/Job');

// POST /api/applications/:jobId  — seeker applies
exports.applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.open) return res.status(400).json({ message: 'Job not available' });

    const existing = await Application.findOne({ job: job._id, applicant: req.user.id });
    if (existing) return res.status(400).json({ message: 'Already applied to this job' });

    const app = await Application.create({
      job: job._id,
      applicant: req.user.id,
      coverLetter:  req.body.coverLetter,
      portfolioUrl: req.body.portfolioUrl,
    });

    // Increment applicant count
    await Job.findByIdAndUpdate(job._id, { $inc: { applicants: 1 } });

    await app.populate('job', 'title company logo salary');
    res.status(201).json({ success: true, application: app });
  } catch (err) { next(err); }
};

// GET /api/applications/my  — seeker's own applications
exports.getMyApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company logo location salary type remote tags')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: apps.length, applications: apps });
  } catch (err) { next(err); }
};

// GET /api/applications/job/:jobId  — employer sees applicants for a job
exports.getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const apps = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email title skills linkedin resume avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: apps.length, applications: apps });
  } catch (err) { next(err); }
};

// PUT /api/applications/:id/status  — employer updates status
exports.updateStatus = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id).populate('job');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    app.status = req.body.status;
    if (req.body.notes) app.notes = req.body.notes;
    await app.save();
    res.json({ success: true, application: app });
  } catch (err) { next(err); }
};

// DELETE /api/applications/:id  — seeker withdraws
exports.withdrawApplication = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.applicant.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    await app.deleteOne();
    await Job.findByIdAndUpdate(app.job, { $inc: { applicants: -1 } });
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (err) { next(err); }
};
