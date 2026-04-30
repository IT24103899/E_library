const testPost = async () => {
  const url = 'http://127.0.0.1:4000/api/ai/recommend/idea';
  console.log(`Testing AI recommend route through proxy: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: 'Detective book in love' })
    });
    
    // Note: This might return 401 because it's not protected in this script
    // but it should NOT be 404.
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', data);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
};

testPost();
