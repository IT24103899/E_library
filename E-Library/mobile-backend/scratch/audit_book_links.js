require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Book = require('../models/Book');

async function checkMissingBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const acts = await Activity.find();
    const bookIds = [...new Set(acts.map(a => a.bookId))];
    
    const existingBooks = await Book.find({
        $or: [
            { legacyId: { $in: bookIds.filter(id => !isNaN(Number(id))).map(id => Number(id)) } },
            { _id: { $in: bookIds.filter(id => typeof id === 'string' && id.length === 24) } }
        ]
    });

    const existingLegacyIds = new Set(existingBooks.map(b => String(b.legacyId)));
    const existingObjectIds = new Set(existingBooks.map(b => String(b._id)));
    
    const missing = bookIds.filter(id => {
        const s = String(id);
        return !existingLegacyIds.has(s) && !existingObjectIds.has(s);
    });

    console.log('--- DB SYNC STATUS ---');
    console.log('Total Unique Book IDs in History:', bookIds.length);
    console.log('Total Books in Catalog:', await Book.countDocuments());
    console.log('Missing Book IDs referenced in history:', missing.length);
    if (missing.length > 0) {
        console.log('First 10 missing IDs:', missing.slice(0, 10));
    }
    
    mongoose.connection.close();
  } catch (e) { console.error(e); }
}

checkMissingBooks();
