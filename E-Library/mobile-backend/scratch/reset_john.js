const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const resetPassword = async (email, newPassword) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile');
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hash } }
    );

    if (result.matchedCount > 0) {
      console.log(`Successfully updated password for ${email}`);
      console.log(`New password is: ${newPassword}`);
    } else {
      console.log(`User ${email} not found`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetPassword('john@gmail.com', 'John@123');
