const testRoute = async () => {
  const url = 'http://127.0.0.1:4000/api/ai/health';
  console.log(`Testing AI health route through proxy: ${url}`);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
};

testRoute();
