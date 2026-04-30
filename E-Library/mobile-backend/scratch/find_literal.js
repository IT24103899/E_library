require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Book = require('../models/Book');

async function testAll() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
    const b = await Book.find({ title: /Unknown Book/i });
    console.log(b);
    mongoose.connection.close();
  } catch(e) { console.log(e); }
}
testAll();
