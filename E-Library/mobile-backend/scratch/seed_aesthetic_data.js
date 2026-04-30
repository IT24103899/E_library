require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');

const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elibrary_mobile';

const aestheticBooks = [
  {
    legacyId: 10001,
    title: 'The Art of Programming',
    author: 'Donald Knuth',
    description: 'A comprehensive monograph on theoretical computer science and programming.',
    category: 'Technology',
    genre: 'Technology',
    totalPages: 600,
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isDeleted: false,
    isAvailable: true
  },
  {
    legacyId: 10002,
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'A sweeping science fiction epic set on the desert planet Arrakis.',
    category: 'Science',
    genre: 'Science',
    totalPages: 800,
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isDeleted: false,
    isAvailable: true
  },
  {
    legacyId: 10003,
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    description: 'Explores the history of the human species from the Stone Age up to the 21st century.',
    category: 'History',
    genre: 'History',
    totalPages: 500,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isDeleted: false,
    isAvailable: true
  },
  {
    legacyId: 10004,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A story of the phenomenally wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
    category: 'Fiction',
    genre: 'Fiction',
    totalPages: 180,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isDeleted: false,
    isAvailable: true
  },
  {
    legacyId: 10005,
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An easy and proven way to build good habits and break bad ones.',
    category: 'Self-Help',
    genre: 'Self-Help',
    totalPages: 320,
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isDeleted: false,
    isAvailable: true
  },
  {
    legacyId: 10006,
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    description: 'The internationally bateselling book on behavioral economics and cognitive biases.',
    category: 'Business',
    genre: 'Business',
    totalPages: 499,
    coverImage: 'https://images.unsplash.com/photo-1511108690759-009324a5033d?auto=format&fit=crop&q=80&w=400',
    coverUrl: 'https://images.unsplash.com/photo-1511108690759-009324a5033d?auto=format&fit=crop&q=80&w=400',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isDeleted: false,
    isAvailable: true
  }
];


const mockUsers = [
  { name: 'Alice Jenkins', email: 'alice.j@example.com', password: 'Password123', role: 'user', isActive: true },
  { name: 'Marcus Aurelius', email: 'marcus.a@empire.com', password: 'Password123', role: 'user', isActive: true },
  { name: 'Diana Prince', email: 'diana.p@themyscira.gov', password: 'Password123', role: 'admin', isActive: true }
];

async function seed() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to DB');

    // 1. Mark existing books as deleted so only fresh ones show
    await Book.updateMany({}, { isDeleted: true });
    
    // 2. Clear old test books with these IDs if any exist
    await Book.deleteMany({ legacyId: { $in: aestheticBooks.map(b => b.legacyId) } });

    // 3. Insert aesthetic books
    for (let b of aestheticBooks) {
      await Book.create(b);
    }
    console.log(`Inserted ${aestheticBooks.length} aesthetic books!`);

    // 4. Insert 3 cool mock users if they don't exist
    for (let u of mockUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
         await User.create(u);
      }
    }
    console.log('Mock users verified.');

  } catch (e) {
    console.error('Seed Error:', e);
  } finally {
    mongoose.connection.close();
    console.log('Done.');
    process.exit(0);
  }
}

seed();
