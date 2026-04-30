const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/elibrary').then(async () => {
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('Total users:', users.length);
  users.forEach(u => {
    console.log(`Email: ${u.email}, Password starts with: ${u.password ? u.password.substring(0, 10) : 'none'}, Hash length: ${u.password ? u.password.length : 0}`);
  });
  mongoose.disconnect();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
