require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Activity = require('../models/Activity');

const resolveBookId = (id) => {
  if (id == null) return null;
  const n = Number(id);
  return isNaN(n) ? String(id) : n;
};

async function check() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
    
    // Find highest user
    const act = await Activity.findOne().sort('-lastReadAt');
    if (!act) {
        console.log('No activities found.');
    } else {
        const history = await Activity.find({ user: act.user }).sort('-lastReadAt');
        console.log('History count:', history.length);
        
        const bookIds = history.map(h => h.bookId);
        const books = await Book.find({
           $or: [
             { legacyId: { $in: bookIds.map(id => Number(id)).filter(id => !isNaN(id)) } },
             { _id: { $in: bookIds.filter(id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) } }
           ]
        }).lean();

        for(const h of history) {
            const b = books.find(b => String(b.legacyId) === String(h.bookId) || String(b._id) === String(h.bookId));
            if (!b) {
               console.log('ORPHANED ACTIVITY:', h);
            } else {
               console.log('VALID ACTIVITY:', b.title);
            }
        }
    }
    
    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}
check();
