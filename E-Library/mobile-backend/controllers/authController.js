const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_super_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Reject fields gracefully
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔓 [LOGIN] Attempt for email:', email);

    // Find the user specifically by their unique email, case insensitive
    const user = await User.findOne({ email: email ? email.toLowerCase() : '' });
    
    if (!user) {
      console.log('❌ [LOGIN] User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const passwordMatch = await user.matchPassword(password);
    if (!passwordMatch) {
      console.log('❌ [LOGIN] Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tok = generateToken(user._id);
    console.log('✅ [LOGIN] Success for:', email, 'token length:', tok.length);
    
    return res.json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: tok
    });
  } catch (error) {
    console.error('❌ [LOGIN] Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        // Optional stats for profile compatibility
        booksRead: user.booksRead || 0,
        pagesRead: user.pagesRead || 0,
        streak: user.streak || 0
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.email) {
        user.email = req.body.email.toLowerCase();
      }
      
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user avatar
// @route   PUT /api/auth/avatar
// @access  Private
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const user = await User.findById(req.user._id);
    if (user) {
      // Store relative path. Frontend will prepend the server URL.
      const filePath = `/uploads/profiles/${req.file.filename}`;
      user.profileImage = filePath;
      await user.save();
      
      res.json({
        message: 'Avatar updated',
        profileImage: filePath
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getProfile, 
  updateProfile, 
  changePassword,
  updateAvatar 
};
