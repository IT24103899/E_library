require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Activity = require('../models/Activity');

async function fix() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
    
    // 1. Fix 1984 book cover image
    const book1984 = await Book.findOne({ title: /1984/i });
    if (book1984) {
      // Set to a known good Wikipedia image which will definitely load
      book1984.coverUrl = 'https://upload.wikimedia.org/wikipedia/en/c/c3/1984firstcover.jpg';
      await book1984.save();
      console.log('✅ Fixed 1984 book cover URL');
    }

    // 2. Remove orphaned activities where bookId does not exist in Book collection
    const activities = await Activity.find();
    let deletedCount = 0;
    
    for (const act of activities) {
      const bId = act.bookId;
      const isLegacy = !isNaN(Number(bId));
      let book;
      
      if (isLegacy) {
        book = await Book.findOne({ legacyId: Number(bId) });
      } else if (typeof bId === 'string' && /^[0-9a-fA-F]{24}$/.test(bId)) {
        book = await Book.findOne({ _id: bId });
      }

      if (!book) {
        console.log(`🗑 Deleting orphaned activity with missing book (bookId: ${bId}) => caused 'Unknown Book'`);
        await Activity.deleteOne({ _id: act._id });
        deletedCount++;
      }
    }
    
    console.log(`\n🎉 Finished fixing DB! Deleted ${deletedCount} orphaned activities.`);

    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}

fix();
