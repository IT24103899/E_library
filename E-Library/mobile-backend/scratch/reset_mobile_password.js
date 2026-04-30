const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to the same DB as the mobile backend
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile').then(async () => {
  const emailToReset = process.argv[2] || 'bharanamihijaya@gmail.com';
  const newPassword = process.argv[3] || 'Admin@1234';
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);
  
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: emailToReset.toLowerCase() },
    { $set: { password: hash } }
  );
  
  if (result.matchedCount > 0) {
    console.log(`Successfully reset password for ${emailToReset} to: ${newPassword}`);
  } else {
    console.log(`User with email ${emailToReset} not found.`);
  }
  
  mongoose.disconnect();
}).catch(console.error);
