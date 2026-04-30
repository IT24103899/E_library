const mongoose = require('mongoose');
const Book = require('../models/Book');

// Restore original planetebook.com URLs — works fine with Google Docs Viewer
const PDF_URLS = {
  '1984':                             'https://www.planetebook.com/free-ebooks/1984.pdf',
  'The Great Gatsby':                 'https://www.planetebook.com/free-ebooks/the-great-gatsby.pdf',
  'Pride and Prejudice':              'https://www.planetebook.com/free-ebooks/pride-and-prejudice.pdf',
  'Frankenstein':                     'https://www.planetebook.com/free-ebooks/frankenstein.pdf',
  'Dracula':                          'https://www.planetebook.com/free-ebooks/dracula.pdf',
  "Alice's Adventures in Wonderland": 'https://www.planetebook.com/free-ebooks/alices-adventures-in-wonderland.pdf',
  'The Adventures of Sherlock Holmes':'https://www.planetebook.com/free-ebooks/the-adventures-of-sherlock-holmes.pdf',
  'Moby-Dick':                        'https://www.planetebook.com/free-ebooks/moby-dick.pdf',
  'A Tale of Two Cities':             'https://www.planetebook.com/free-ebooks/a-tale-of-two-cities.pdf',
  'Jane Eyre':                        'https://www.planetebook.com/free-ebooks/jane-eyre.pdf',
  'Crime and Punishment':             'https://www.planetebook.com/free-ebooks/crime-and-punishment.pdf',
  'Wuthering Heights':                'https://www.planetebook.com/free-ebooks/wuthering-heights.pdf',
  'Great Expectations':               'https://www.planetebook.com/free-ebooks/great-expectations.pdf',
  'The Picture of Dorian Gray':       'https://www.planetebook.com/free-ebooks/the-picture-of-dorian-gray.pdf',
  'Les Misérables':                   'https://www.planetebook.com/free-ebooks/les-miserables.pdf',
  'War and Peace':                    'https://www.planetebook.com/free-ebooks/war-and-peace.pdf',
  'The Brothers Karamazov':           'https://www.planetebook.com/free-ebooks/the-brothers-karamazov.pdf',
  'The Awakening':                    'https://www.planetebook.com/free-ebooks/the-awakening.pdf',
  'Metamorphosis':                    'https://www.planetebook.com/free-ebooks/metamorphosis.pdf',
  'The Odyssey':                      'https://www.planetebook.com/free-ebooks/the-odyssey.pdf',
};

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
  const books = await Book.find({});
  for (const book of books) {
    const url = PDF_URLS[book.title];
    if (url) {
      book.pdfUrl = url;
      await book.save();
      console.log(`✅ Restored: ${book.title}`);
    }
  }
  await mongoose.connection.close();
  console.log('Done!');
}
fix().catch(console.error);
