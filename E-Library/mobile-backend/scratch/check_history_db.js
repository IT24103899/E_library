const mongoose = require('mongoose');
const SearchHistory = require('../models/SearchHistory');
const dotenv = require('dotenv');

dotenv.config();

const checkHistory = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const count = await SearchHistory.countDocuments();
  console.log(`Total history items in DB: ${count}`);
  
  const sample = await SearchHistory.find().limit(5);
  console.log('Sample items:', sample);
  
  await mongoose.disconnect();
};

checkHistory();
