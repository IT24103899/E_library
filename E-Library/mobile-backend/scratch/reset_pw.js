const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.db.databaseName);
    
    const User = mongoose.model('User', new mongoose.Schema({ email: String, password: String }), 'users');
    
    const email = 'amma@gmail.com';
    const newPlainPassword = 'password123';
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPlainPassword, salt);
    
    const result = await User.updateOne({ email }, { $set: { password: hashedPassword } });
    
    if (result.matchedCount > 0) {
      console.log(`✅ Password for ${email} reset to "${newPlainPassword}"`);
    } else {
      console.log(`❌ User ${email} not found`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetPassword();
