const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const checkElibraryMobile = async () => {
  try {
    // Append database name to URI
    const uri = process.env.MONGODB_URI.replace('/?', '/elibrary_mobile?');
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    console.log('✅ Connected to elibrary_mobile');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const coll of collections) {
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(`Collection: ${coll.name}, Count: ${count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkElibraryMobile();
