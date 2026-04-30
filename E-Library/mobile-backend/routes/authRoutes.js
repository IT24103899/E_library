const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getProfile, 
  updateProfile, 
  changePassword,
  updateAvatar
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/avatar', protect, upload.single('avatar'), updateAvatar);

module.exports = router;
