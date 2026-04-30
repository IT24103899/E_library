const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({ email: String, password: String }), 'users');
    
    const accounts = [
      { email: 'diana.p@themyscira.gov', pw: 'admin123' },
      { email: 'chathu@gmail.com', pw: 'password123' }
    ];
    
    for (const acc of accounts) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(acc.pw, salt);
      const result = await User.updateOne({ email: acc.email }, { $set: { password: hashedPassword } });
      if (result.matchedCount > 0) {
        console.log(`✅ Password for ${acc.email} reset to "${acc.pw}"`);
      } else {
        console.log(`❌ User ${acc.email} not found`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();
