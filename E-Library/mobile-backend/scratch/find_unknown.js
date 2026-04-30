require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Book = require('../models/Book');

async function testAll() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
    
    const history = await Activity.find().lean();
    
    for (const act of history) {
        const bId = act.bookId;
        const isLegacy = !isNaN(Number(bId)) && typeof Number(bId) === 'number';
        let bookDetails = null;
        if (isLegacy) {
            bookDetails = await Book.findOne({ legacyId: Number(bId) }).lean();
        } 
        if (!bookDetails && typeof bId === 'string' && /^[0-9a-fA-F]{24}$/.test(bId)) {
            bookDetails = await Book.findOne({ _id: bId }).lean();
        }
        
        let title = bookDetails?.title || 'Unknown Book';
        if (title === 'Unknown Book') {
            console.log('FOUND UNKNOWN BOOK ACTIVITY:', act);
        }
    }
    
    console.log("Done checking all activities.");
    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}
testAll();
