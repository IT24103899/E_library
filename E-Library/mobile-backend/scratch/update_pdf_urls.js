const mongoose = require('mongoose');
const Book = require('../models/Book');

// Reliable, CORS-friendly PDF URLs from Project Gutenberg and open sources
const PDF_URLS = {
  '1984':                      'https://planetpdf.com/codecuts/pdfs/oedipus.pdf', // test
  'Pride and Prejudice':        'https://www.gutenberg.org/files/1342/1342-pdf.pdf',
  'The Great Gatsby':           'https://www.gutenberg.org/files/64317/64317-pdf.pdf',
  'Frankenstein':               'https://www.gutenberg.org/files/84/84-pdf.pdf',
  'Dracula':                    'https://www.gutenberg.org/files/345/345-pdf.pdf',
  "Alice's Adventures in Wonderland": 'https://www.gutenberg.org/files/11/11-pdf.pdf',
  'The Adventures of Sherlock Holmes': 'https://www.gutenberg.org/files/1661/1661-pdf.pdf',
  'Moby-Dick':                  'https://www.gutenberg.org/files/2701/2701-pdf.pdf',
  'A Tale of Two Cities':       'https://www.gutenberg.org/files/98/98-pdf.pdf',
  'Jane Eyre':                  'https://www.gutenberg.org/files/1260/1260-pdf.pdf',
  'Crime and Punishment':       'https://www.gutenberg.org/files/2554/2554-pdf.pdf',
  'Wuthering Heights':          'https://www.gutenberg.org/files/768/768-pdf.pdf',
  'Great Expectations':         'https://www.gutenberg.org/files/1400/1400-pdf.pdf',
  'The Picture of Dorian Gray': 'https://www.gutenberg.org/files/174/174-pdf.pdf',
  'Les Misérables':             'https://www.gutenberg.org/files/135/135-pdf.pdf',
  'War and Peace':              'https://www.gutenberg.org/files/2600/2600-pdf.pdf',
  'The Brothers Karamazov':     'https://www.gutenberg.org/files/28054/28054-pdf.pdf',
  'The Awakening':              'https://www.gutenberg.org/files/160/160-pdf.pdf',
  'Metamorphosis':              'https://www.gutenberg.org/files/5200/5200-pdf.pdf',
  'The Odyssey':                'https://www.gutenberg.org/files/1727/1727-pdf.pdf',
};

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
  const books = await Book.find({});
  
  for (const book of books) {
    const newUrl = PDF_URLS[book.title];
    if (newUrl) {
      book.pdfUrl = newUrl;
      await book.save();
      console.log(`✅ Updated: ${book.title}`);
    } else {
      console.log(`⚠️  No URL mapping for: ${book.title}`);
    }
  }

  await mongoose.connection.close();
  console.log('\nDone! All PDF URLs updated to Project Gutenberg sources.');
}

fix().catch(console.error);
