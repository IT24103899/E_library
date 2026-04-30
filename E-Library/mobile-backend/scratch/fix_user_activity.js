require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Book = require('../models/Book');

async function fixActivity() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile');
    console.log('Connected to DB');

    const userEmail = 'test@example.com';
    const User = require('../models/User');
    const user = await User.findOne({ email: userEmail });
    if (!user) {
        console.log('User not found');
        return;
    }

    // Delete existing activities for this user to start fresh with aesthetic data
    await Activity.deleteMany({ user: user._id });
    console.log('Cleared old activities.');

    const premiumBooks = await Book.find({ legacyId: { $in: [10001, 10002, 10003, 10004, 10005, 10006] } });
    
    // Create fresh activities for the premium books
    for (const [idx, book] of premiumBooks.entries()) {
        const progress = [150, 400, 25, 90, 210, 30][idx % 6]; // Variety of progress
        await Activity.create({
            user: user._id,
            bookId: book.legacyId,
            pageNumber: progress,
            lastReadAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000) // One per day back
        });
        console.log(`Created activity for ${book.title} at page ${progress}`);
    }

    console.log('Done.');
    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}

fixActivity();
