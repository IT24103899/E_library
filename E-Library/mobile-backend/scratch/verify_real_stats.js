require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile');
    const user = await User.findOne({ email: 'sriyani@gmail.com' });
    
    // Test helper to normalize ID
    const resolveBookId = (id) => {
        if (id == null) return null;
        const n = Number(id);
        return isNaN(n) ? String(id) : n;
    };

    const history = await Activity.find({ user: user._id });
    
    // Logic from Controller
    const distinctBooksIds = history.map(h => String(resolveBookId(h.bookId)));
    const booksReadCount = new Set(distinctBooksIds).size;
    let totalPagesRead = 0;
    history.forEach(h => { totalPagesRead += (h.pageNumber || 0); });

    const readingDates = [...new Set(history.map(h => h.lastReadAt.toISOString().split('T')[0]))].sort().reverse();
    let streak = 0;
    if (readingDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (readingDates[0] === today || readingDates[0] === yesterday) {
        streak = 1;
        for (let i = 0; i < readingDates.length - 1; i++) {
          const d1 = new Date(readingDates[i]);
          const d2 = new Date(readingDates[i + 1]);
          const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
          if (diff === 1) streak++; else break;
        }
      }
    }

    console.log('Real Stats Verification:');
    console.log('- User:', user.email);
    console.log('- Books Read:', booksReadCount);
    console.log('- Pages Read:', totalPagesRead);
    console.log('- Streak:', streak);
    console.log('- Reading Dates:', readingDates.slice(0, 5));

    mongoose.connection.close();
  } catch (e) { console.error(e); }
}

verify();
