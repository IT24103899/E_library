require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Bookshelf = require('../models/Bookshelf');

async function check() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
    
    // Ensure Books schema is registered first by requiring it above
    const items = await Bookshelf.find().populate('bookId');
    console.log(`Found ${items.length} Bookshelf items.`);
    
    for (const item of items) {
        if (!item.bookId) {
            console.log('ORPHANED BOOKSHELF:', item);
        } else {
            console.log('VALID BOOKSHELF:', item.bookId.title, 'in list', item.listType);
        }
    }
    
    let deleted = await Bookshelf.deleteMany({ bookId: null });
    console.log('Deleted orphaned bookshelf items:', deleted.deletedCount);
    
    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}
check();
