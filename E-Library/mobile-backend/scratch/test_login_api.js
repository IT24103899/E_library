const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login for amma@gmail.com...');
    const response = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'amma@gmail.com',
      password: 'password123'
    });
    console.log('✅ Login successful!');
    console.log('User:', response.data.name);
    console.log('Token:', response.data.token.substring(0, 20) + '...');
  } catch (error) {
    console.error('❌ Login failed:', error.response ? error.response.data : error.message);
  }
};

testLogin();
