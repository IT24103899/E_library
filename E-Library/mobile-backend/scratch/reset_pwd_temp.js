const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetPwd() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
    const user = await mongoose.connection.db.collection('users').findOne({ email: { $regex: /lahiru@gmail.com/i } });
    
    if (!user) {
      console.log('User not found.');
      process.exit(0);
    }
    
    console.log('Found user:', user.email);
    console.log('Is Admin:', user.isAdmin);
    
    // We can't reverse the hash, but we can reset it to "Admin@1234"
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin@1234', salt);
    
    await mongoose.connection.db.collection('users').updateOne(
      { _id: user._id },
      { $set: { password: hash } }
    );
    
    console.log('Successfully reset password to: Admin@1234');
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
resetPwd();
