const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({ email: String, password: String }), 'users');
    const user = await User.findOne({ email: 'admin@elibrary.com' });
    if (user) {
      console.log('User found:', user.email);
      console.log('Password start:', user.password.substring(0, 10));
      if (user.password.startsWith('$2')) {
        console.log('✅ Password looks hashed');
      } else {
        console.log('❌ Password looks PLAIN TEXT');
      }
    } else {
      console.log('User not found');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
