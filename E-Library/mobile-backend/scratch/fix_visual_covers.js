require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Book = require('../models/Book');

async function fixCovers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const covers = {
      "The Art of Programming": "https://m.media-amazon.com/images/I/41K9K-11W2L._SX331_BO1,204,203,200_.jpg",
      "Dune": "https://m.media-amazon.com/images/I/41OebE-f9mL._SX322_BO1,204,203,200_.jpg",
      "Sapiens: A Brief History of Humankind": "https://m.media-amazon.com/images/I/41yu2qXhXXL._SX324_BO1,204,203,200_.jpg",
      "The Great Gatsby": "https://m.media-amazon.com/images/I/41N667KNp9L._SX311_BO1,204,203,200_.jpg",
      "Atomic Habits": "https://m.media-amazon.com/images/I/513Y5o-DYtL._SX330_BO1,204,203,200_.jpg",
      "Frankenstein": "https://m.media-amazon.com/images/I/51itv-mI94L._SX311_BO1,204,203,200_.jpg"
    };

    for (const [title, url] of Object.entries(covers)) {
      const res = await Book.updateOne(
        { title: new RegExp(title, 'i') }, 
        { $set: { coverUrl: url, coverImage: url } }
      );
      console.log(`Updated "${title}": ${res.modifiedCount} match found.`);
    }

    console.log('Visual manual sync complete.');
    mongoose.connection.close();
  } catch (e) { console.error(e); }
}

fixCovers();
