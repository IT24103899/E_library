require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Book = require('../models/Book');

async function check() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
    const gatsby = await Book.findOne({ _id: '69e220f1ab127dff56fcbc5e' });
    console.log('Gatsby Book Cover:', gatsby ? gatsby.coverUrl : null);
    
    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}
check();
