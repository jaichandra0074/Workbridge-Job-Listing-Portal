const express    = require('express');
const router     = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyToJob, getMyApplications, getJobApplications, updateStatus, withdrawApplication,
} = require('../controllers/applicationController');

router.post('/:jobId',          protect, authorize('seeker'),           applyToJob);
router.get('/my',               protect, authorize('seeker'),           getMyApplications);
router.get('/job/:jobId',       protect, authorize('employer','admin'), getJobApplications);
router.put('/:id/status',       protect, authorize('employer','admin'), updateStatus);
router.delete('/:id',           protect, authorize('seeker'),           withdrawApplication);

module.exports = router;
