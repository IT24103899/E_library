const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  
  // 1. Lowercase all emails
  let updated = 0;
  for(const u of users) {
    if(u.email !== u.email.toLowerCase()) {
      await db.collection('users').updateOne(
        { _id: u._id },
        { $set: { email: u.email.toLowerCase() } }
      );
      updated++;
    }
  }
  console.log('Fixed', updated, 'emails to lowercase.');

  // 2. Reset Lahiru's password to 'Admin@1234'
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Admin@1234', salt);
  
  const result = await db.collection('users').updateOne(
    { email: 'lahiru@gmail.com' },
    { $set: { password: hash } }
  );
  console.log('Reset Lahiru password to Admin@1234, matched:', result.matchedCount, 'modified:', result.modifiedCount);

  mongoose.disconnect();
});
