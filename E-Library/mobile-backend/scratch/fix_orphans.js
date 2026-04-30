const mongoose = require('mongoose');
const Book = require('../models/Book');
const Activity = require('../models/Activity');

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');

  // 1. Find all activities
  const activities = await Activity.find({});
  console.log('Total activities:', activities.length);

  const orphaned = [];
  for (const act of activities) {
    const id = act.bookId;
    const numId = Number(id);
    const book = await Book.findOne({
      $or: [
        { legacyId: !isNaN(numId) ? numId : -1 },
        { _id: typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id) ? id : new mongoose.Types.ObjectId() }
      ]
    }).catch(() => null);

    if (!book) {
      orphaned.push(act);
      console.log('ORPHANED activity:', act._id, '| bookId:', act.bookId, '| page:', act.pageNumber);
    }
  }

  if (orphaned.length > 0) {
    const ids = orphaned.map(a => a._id);
    await Activity.deleteMany({ _id: { $in: ids } });
    console.log(`✅ Deleted ${orphaned.length} orphaned activity records.`);
  } else {
    console.log('No orphaned activities found.');
  }

  // 2. Fix 1984 cover URL
  const book1984 = await Book.findOne({ title: /1984/i });
  if (book1984) {
    console.log('\n1984 book current coverUrl:', book1984.coverUrl);
    if (!book1984.coverUrl || book1984.coverUrl.trim() === '') {
      book1984.coverUrl = 'https://covers.openlibrary.org/b/id/7222246-L.jpg';
      await book1984.save();
      console.log('✅ Fixed 1984 cover URL.');
    } else {
      console.log('1984 cover URL looks OK, might be a broken link. Updating to reliable one...');
      book1984.coverUrl = 'https://covers.openlibrary.org/b/id/7222246-L.jpg';
      await book1984.save();
      console.log('✅ Updated 1984 cover URL to reliable Open Library source.');
    }
  } else {
    console.log('1984 book not found in DB.');
  }

  await mongoose.connection.close();
  console.log('\nDone!');
}

fix().catch(console.error);
