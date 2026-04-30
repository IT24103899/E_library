require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function checkApi() {
  try {
    // We need a token or we can call the internal controller method if we had a setup
    // But since I'm on the same machine, I can just query MongoDB directly to see if the seed worked
    const mongoose = require('mongoose');
    const Activity = require('../models/Activity');
    const Book = require('../models/Book');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile');
    console.log('Connected to DB');
    
    const books = await Book.find({ isDeleted: false });
    console.log('Books with totalPages:');
    books.forEach(b => console.log(`- ${b.title}: ${b.totalPages} pages`));
    
    // Check if any activities exist
    const activities = await Activity.find().limit(5);
    console.log(`\nFound ${activities.length} activities.`);
    
    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}

checkApi();
