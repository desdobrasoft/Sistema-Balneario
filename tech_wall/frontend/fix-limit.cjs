const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(file) {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('limit:')) {
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
  }
});
