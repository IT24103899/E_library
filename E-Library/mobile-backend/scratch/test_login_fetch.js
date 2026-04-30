async function testLogin() {
  try {
    console.log('Testing login for amma@gmail.com...');
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'amma@gmail.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', data.name);
      console.log('Token:', data.token.substring(0, 20) + '...');
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
