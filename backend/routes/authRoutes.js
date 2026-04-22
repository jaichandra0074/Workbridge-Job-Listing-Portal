const express = require('express');
const { body }  = require('express-validator');
const router    = express.Router();
const { register, login, getMe, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
  body('role').isIn(['seeker','employer']).withMessage('Role must be seeker or employer'),
], register);

router.post('/login', login);
router.get('/me',              protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;
