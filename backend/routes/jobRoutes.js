const express    = require('express');
const router     = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs,
} = require('../controllers/jobController');

router.get('/',              getJobs);
router.get('/employer/my',   protect, authorize('employer','admin'), getMyJobs);
router.get('/:id',           getJob);
router.post('/',             protect, authorize('employer','admin'), createJob);
router.put('/:id',           protect, authorize('employer','admin'), updateJob);
router.delete('/:id',        protect, authorize('employer','admin'), deleteJob);

module.exports = router;
