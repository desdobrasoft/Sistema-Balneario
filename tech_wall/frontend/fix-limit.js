const fs = require('fs');
const { globSync } = require('glob');

const files = globSync('src/**/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('limit:')) {
    // Replace "limit: " with "length: " specifically in api calls or data.length passing
    content = content.replace(/limit: data\.length/g, 'length: data.length');
    content = content.replace(/limit: 100/g, 'length: 100');
    content = content.replace(/limit: 500/g, 'length: 500');
    content = content.replace(/limit: 30/g, 'length: 30');
    content = content.replace(/limit: 50/g, 'length: 50');
    content = content.replace(/limit: 1000/g, 'length: 1000');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
  }
});
