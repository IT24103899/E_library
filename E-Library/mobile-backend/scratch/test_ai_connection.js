const testConnection = async () => {
  const url = 'http://127.0.0.1:5001/api/mobile/health';
  console.log(`Testing connection to: ${url}`);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
};

testConnection();
