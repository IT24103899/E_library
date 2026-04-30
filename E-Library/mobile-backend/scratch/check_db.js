const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config();

const checkDb = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Use connection to list collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    const User = mongoose.model('User', new mongoose.Schema({}), 'users');
    const Book = mongoose.model('Book', new mongoose.Schema({}), 'books');

    const userCount = await User.countDocuments();
    const bookCount = await Book.countDocuments();

    console.log(`Users: ${userCount}`);
    console.log(`Books: ${bookCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

checkDb();
