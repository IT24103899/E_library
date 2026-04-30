const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const encryptUserPassword = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile');
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`User ${email} not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name}`);
    console.log(`Current password hash/text: ${user.password}`);

    // If the password doesn't look like a bcrypt hash (starts with $2a$ or $2b$), we should re-save it.
    // Or just re-save it anyway to be sure.
    // Let's set it to a known one if the user wants, or just trigger the save hook.
    
    // Triggering save will hash it if it's not already hashed (assuming the pre-save hook works)
    // Actually, bcrypt hashes always start with $2.
    if (!user.password.startsWith('$2')) {
        console.log('Password appears to be plain text. Encrypting...');
        // We need to re-assign it to trigger isModified('password')
        const plainPassword = user.password;
        user.password = plainPassword; 
        await user.save();
        console.log('Password encrypted successfully');
    } else {
        console.log('Password is already encrypted.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

encryptUserPassword('john@gmail.com');
