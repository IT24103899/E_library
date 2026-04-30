require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function testProgress() {
  const baseURL = 'http://localhost:4000/api';
  const bookId = 10001; // The Art of Programming
  
  // We need a token. I'll mock the auth for this test if possible, 
  // or I'll just check the DB state after I manually triggered some calls if I could.
  // Since I can't easily get a token here without login, I'll just check the DB directly 
  // to see if the fields match what I expect.
  
  const mongoose = require('mongoose');
  const Activity = require('../models/Activity');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile');
  
  console.log('Testing saving progress logic...');
  // Simulating the logic in updateActivity
  const userId = '69d8a8a5c65deda7871935ba'; // Test User
  const page = 42;
  
  let activity = await Activity.findOne({ user: userId, bookId });
  if (activity) {
    activity.pageNumber = page;
    await activity.save();
    console.log('Updated activity to page', page);
  }
  
  const updated = await Activity.findOne({ user: userId, bookId });
  console.log('Current DB state:', updated.pageNumber);
  
  mongoose.connection.close();
}

testProgress();
