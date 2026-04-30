const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const listDbs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');
    
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map(db => db.name));
    
    // Check current db
    console.log('Current DB:', mongoose.connection.db.databaseName);
    
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

listDbs();
