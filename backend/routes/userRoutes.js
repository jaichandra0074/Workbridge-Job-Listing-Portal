const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getProfile, updateProfile, saveJob, getAllUsers } = require('../controllers/userController');

router.get('/profile',         protect, getProfile);
router.put('/profile',         protect, updateProfile);
router.post('/save/:jobId',    protect, authorize('seeker'), saveJob);
router.get('/',                protect, authorize('admin'),  getAllUsers);

module.exports = router;
