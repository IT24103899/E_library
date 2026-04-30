require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Book = require('../models/Book');

async function fixLahiru() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile');
    console.log('Connected to DB');

    const user = await User.findOne({ email: 'lahiru@gmail.com' });
    if (!user) return console.log('User not found');

    // Get 3 real books
    const books = await Book.find().limit(3);
    if (books.length < 3) return console.log('Need more books to link');

    const activities = await Activity.find({ user: user._id });
    
    // Update his activities to point to real books with some progress
    // Frankenstein (658) -> 45 pages
    await Activity.findByIdAndUpdate(activities[0]._id, {
        bookId: books[0].legacyId,
        pageNumber: 45,
        totalPages: 240,
        lastReadAt: new Date()
    });

    // Dune (657) -> 20 pages
    await Activity.findByIdAndUpdate(activities[1]._id, {
        bookId: books[1].legacyId,
        pageNumber: 20,
        totalPages: 180,
        lastReadAt: new Date(Date.now() - 3600000)
    });

    // Sapiens (659) -> 0 pages
    await Activity.findByIdAndUpdate(activities[2]._id, {
        bookId: books[2].legacyId,
        pageNumber: 0,
        totalPages: 450,
        lastReadAt: new Date(Date.now() - 7200000)
    });

    console.log('Lahiru context synced with real books.');
    mongoose.connection.close();
  } catch (e) { console.error(e); }
}

fixLahiru();
