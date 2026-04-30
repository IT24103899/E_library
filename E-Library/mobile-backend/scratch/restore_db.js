require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Book = require('../models/Book');

const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile';

async function restoreBooks() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to DB');

    // 1. Restore all books that were previously hidden
    const result = await Book.updateMany({ isDeleted: true }, { $set: { isDeleted: false } });
    console.log(`Restored ${result.modifiedCount} original books.`);

    // 2. Delete the aesthetic dummy books if they want the pure original database
    const delResult = await Book.deleteMany({ legacyId: { $in: [10001, 10002, 10003, 10004, 10005, 10006] } });
    console.log(`Removed ${delResult.deletedCount} mockup dummy books.`);

  } catch (e) {
    console.error('Error:', e);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

restoreBooks();
