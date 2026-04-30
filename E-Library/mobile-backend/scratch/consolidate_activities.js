require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Activity = require('../models/Activity');

async function consolidate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile');
    console.log('Connected to DB');

    const userEmail = 'sriyani@gmail.com';
    const User = require('../models/User');
    const user = await User.findOne({ email: userEmail });
    if (!user) {
        console.log('User not found');
        return;
    }

    const allActivities = await Activity.find({ user: user._id });
    console.log(`Found ${allActivities.length} total activities for ${user.email}`);

    // Groups activities by normalized bookId
    const groups = {};
    const resolveBookId = (id) => {
        if (id == null) return null;
        const n = Number(id);
        return isNaN(n) ? String(id) : n;
    };

    allActivities.forEach(act => {
        const bid = resolveBookId(act.bookId);
        if (!groups[bid]) groups[bid] = [];
        groups[bid].push(act);
    });

    for (const bid in groups) {
        const acts = groups[bid];
        if (acts.length > 1) {
            console.log(`Consolidating ${acts.length} records for book ${bid}...`);
            // Sort by most recently updated or highest page number
            acts.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            
            const keep = acts[0];
            const toDelete = acts.slice(1).map(a => a._id);
            
            await Activity.deleteMany({ _id: { $in: toDelete } });
            console.log(`  Kept record ${keep._id}, deleted ${toDelete.length} duplicates.`);
        }
    }

    console.log('Consolidation complete.');
    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}

consolidate();
