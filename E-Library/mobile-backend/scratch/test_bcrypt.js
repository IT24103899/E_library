const bcrypt = require('bcryptjs');

const testCompare = async () => {
  const pw = 'password123';
  const hash = '$2b$10$EAfJHapk.0PcY.lVjtV/wupxvzgnJBvWt79dAejOWQnzaI3kKMIaq';
  
  const match = await bcrypt.compare(pw, hash);
  console.log(`Password: ${pw}`);
  console.log(`Hash: ${hash}`);
  console.log(`Match: ${match}`);
};

testCompare();
