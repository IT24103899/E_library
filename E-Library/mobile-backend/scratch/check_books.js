const mongoose = require('mongoose');
const Book = require('../models/Book');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');

  const books = await Book.find({}).lean();
  console.log(`Total books: ${books.length}\n`);
  books.forEach(b => {
    console.log(`Title: ${b.title}`);
    console.log(`  coverUrl: ${b.coverUrl || 'MISSING'}`);
    console.log(`  pdfUrl:   ${b.pdfUrl || 'MISSING'}`);
    console.log(`  totalPages: ${b.totalPages || 'MISSING'}`);
    console.log('');
  });

  await mongoose.connection.close();
}
check().catch(console.error);
