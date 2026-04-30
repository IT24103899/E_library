require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function go() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
    const u = await mongoose.connection.db.collection('users').findOne({ email: 'user@example.com' }) || 
              await mongoose.connection.db.collection('users').findOne({});
    if (!u) {
        console.log('No user');
        process.exit();
    }
    
    // Create token
    const token = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    console.log("Token generated for:", u.email);
    
    // Fetch History
    const hRes = await fetch('http://127.0.0.1:4000/api/activity', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const hData = await hRes.json();
    console.log("Activity API Response:");
    console.log(JSON.stringify(hData, null, 2));

    // Fetch Bookshelf
    const bRes = await fetch('http://127.0.0.1:4000/api/bookshelf', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const bData = await bRes.json();
    
    console.log("Bookshelf API Response:");
    console.log(JSON.stringify(bData, null, 2));

    process.exit();
  } catch (e) { console.error(e); process.exit(); }
}
go();
