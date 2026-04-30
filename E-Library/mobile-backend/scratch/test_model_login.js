const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const testModelLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.db.databaseName);
    
    const email = 'amma@gmail.com';
    const password = 'password123';
    
    console.log('Searching for user:', email);
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found via Model');
      process.exit(1);
    }
    
    console.log('User found! ID:', user._id);
    console.log('Stored Hash:', user.password);
    
    const isMatch = await user.matchPassword(password);
    console.log('Match result:', isMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testModelLogin();
