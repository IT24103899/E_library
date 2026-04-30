require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Book = require('../models/Book');

async function testGetHistory() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
    
    // get user ID from the latest activity
    const lastAct = await Activity.findOne().sort('-lastReadAt');
    if (!lastAct) return console.log("No activities.");

    const history = await Activity.find({ user: lastAct.user }).sort('-lastReadAt');
    const bookIds = history.map(h => h.bookId);

    const books = await Book.find({
       $or: [
         { legacyId: { $in: bookIds.map(id => Number(id)).filter(id => !isNaN(id)) } },
         { _id: { $in: bookIds.filter(id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) } }
       ]
    }).lean();

    const enriched = history.map(act => {
        const actObj = act.toObject();
        const bookDetails = books.find(b => 
            String(b.legacyId) === String(act.bookId) || 
            String(b._id) === String(act.bookId)
        );
        
        return {
            ...actObj,
            title: bookDetails?.title || 'Unknown Book',
            author: bookDetails?.author || 'Unknown',
            coverUrl: bookDetails?.coverUrl || bookDetails?.coverImage || ''
        };
    });

    console.log("Returned history payload:");
    console.log(enriched.map(e => ({ title: e.title, author: e.author, url: e.coverUrl })));
    
    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}
testGetHistory();
