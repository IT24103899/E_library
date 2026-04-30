const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const inspectUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const email = 'amma@gmail.com';
    
    console.log('Searching for exactly:', `"${email}"`);
    const users = await db.collection('users').find({ email: email }).toArray();
    console.log(`Found ${users.length} users with this exact email.`);
    
    if (users.length > 0) {
      const u = users[0];
      console.log('User ID:', u._id);
      console.log('Email in DB:', `"${u.email}"`);
      console.log('Password Hash in DB:', u.password);
    } else {
      console.log('No exact match. Trying regex...');
      const allAmmas = await db.collection('users').find({ email: /amma/i }).toArray();
      allAmmas.forEach(u => {
        console.log(`Found: "${u.email}" (ID: ${u._id})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

inspectUser();
