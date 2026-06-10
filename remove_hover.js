const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const dirs = ['./app', './components'];
let files = [];
dirs.forEach(d => {
    if (fs.existsSync(d)) {
        files = files.concat(walk(d));
    }
});

let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  const hoverGeneral = /['"]?&:hover['"]?:\s*\{\s*boxShadow:\s*['"][^'"]+['"],\s*transform:\s*['"]translateY\([^)]+\)['"],?\s*\},?/g;
  const transitionOnlyRegex = /transition:\s*['"]all 0\.3s ease['"],?/g;

  if (newContent.match(hoverGeneral)) {
     newContent = newContent.replace(hoverGeneral, '');
     newContent = newContent.replace(transitionOnlyRegex, '');
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${count} files.`);
