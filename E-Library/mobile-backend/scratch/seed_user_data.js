require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
const Bookshelf = require('../models/Bookshelf');
const Activity = require('../models/Activity');

const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile';

async function seedUserInteractions() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to DB');

    // 1. Get Alice
    const user = await User.findOne({ email: 'alice.j@example.com' });
    if (!user) {
      console.log('User not found!');
      return;
    }

    // 2. Get some books
    const books = await Book.find({ title: { $in: ['The Art of Programming', 'Dune', 'Atomic Habits'] } });
    if (books.length < 3) {
      console.log('Aesthetic books not found');
      return;
    }

    // Clear old data for clarity
    await Bookshelf.deleteMany({ user: user._id });
    await Activity.deleteMany({ user: user._id });

    // 3. Add to Bookshelf
    // "Dune" - Currently Reading
    await Bookshelf.create({
      user: user._id,
      bookId: books.find(b => b.title === 'Dune')._id,
      listType: 'reading',
      status: 'currently-reading'
    });
    // "Atomic Habits" - Favourites
    await Bookshelf.create({
      user: user._id,
      bookId: books.find(b => b.title === 'Atomic Habits')._id,
      listType: 'favourites',
      status: 'completed'
    });
    // "The Art of Programming" - Wishlist
    await Bookshelf.create({
      user: user._id,
      bookId: books.find(b => b.title === 'The Art of Programming')._id,
      listType: 'wishlist',
      status: 'want-to-read'
    });

    console.log('Added 3 books to Bookshelf for Alice.');

    // 4. Add to Activity
    // Simulating Alice reading Dune on page 142
    await Activity.create({
      user: user._id,
      bookId: books.find(b => b.title === 'Dune')._id,
      pageNumber: 142,
      totalPages: 800,
      lastReadAt: Date.now()
    });

    // Simulating Alice finishing Atomic Habits
    await Activity.create({
      user: user._id,
      bookId: books.find(b => b.title === 'Atomic Habits')._id,
      pageNumber: 320,
      totalPages: 320,
      lastReadAt: new Date(Date.now() - 86400000) // 1 day ago
    });

    console.log('Activity seeded successfully.');

  } catch (e) {
    console.error('Error:', e);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedUserInteractions();
