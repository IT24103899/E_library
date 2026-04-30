require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile');
    console.log('Connected to DB');

    const user = await User.findOne({ email: 'sriyani@gmail.com' });
    if (!user) {
        console.log('User not found');
        return;
    }
    console.log('User ID:', user._id);

    const activities = await Activity.find({ user: user._id });
    console.log(`Found ${activities.length} activities.`);
    activities.forEach(a => console.log(`- Book ID: ${a.bookId}, Page: ${a.pageNumber}`));

    // Check stats logic
    const distinctBooks = new Set(activities.map(h => String(h.bookId)));
    const booksReadCount = distinctBooks.size;
    let totalPagesRead = 0;
    activities.forEach(h => { totalPagesRead += (h.pageNumber || 0); });

    console.log('Calculated Stats:');
    console.log('- Books Read:', booksReadCount);
    console.log('- Total Pages:', totalPagesRead);

    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}

checkData();
