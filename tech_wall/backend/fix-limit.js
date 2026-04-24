const fs = require('fs');
const { globSync } = require('glob');

const files = globSync('src/**/*.service.ts');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('const { page = 1, limit = 10, search } = query;')) {
    content = content.replace(
      /const \{ page = 1, limit = 10, search \} = query;[\s\n]*const skip = \(page - 1\) \* limit;/g,
      'const { start = 0, length = 10, search } = query;\n    const skip = start;\n    const limit = length;'
    );
    changed = true;
  }
  
  if (file.includes('placas.service.ts')) {
    content = content.replace(/page = 1,/g, 'start = 0,');
    content = content.replace(/limit = 10,/g, 'length = 10,');
    content = content.replace(/const skip = \(page - 1\) \* limit;/g, 'const skip = start;\n      const limit = length;');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
  }
});
