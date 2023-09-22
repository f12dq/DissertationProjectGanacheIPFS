const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'upload_file.js');
try {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(content);
} catch (error) {
  console.error('Error reading file:', error);
}
