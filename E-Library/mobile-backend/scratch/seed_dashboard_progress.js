require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');

async function seedProgress() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile');
    console.log('Connected to DB');

    const user = await User.findOne({ email: 'sriyani@gmail.com' });
    if (!user) return console.log('User not found');

    // Update Frankenstein (658) to page 120 / 393
    await Activity.findOneAndUpdate(
        { user: user._id, bookId: 658 },
        { pageNumber: 120, totalPages: 393, lastReadAt: new Date() },
        { upsert: true }
    );

    // Update The Great Gatsby (657) to page 45 / 180
    await Activity.findOneAndUpdate(
        { user: user._id, bookId: 657 },
        { pageNumber: 45, totalPages: 180, lastReadAt: new Date(Date.now() - 3600000) },
        { upsert: true }
    );

    console.log('Seed complete for sriyani@gmail.com');
    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}

seedProgress();
