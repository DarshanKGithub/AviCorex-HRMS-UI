const fs = require('fs');
const path = require('path');

const replacements = {
  '#7c3aed': '#2563EB',
  '#6d28d9': '#1D4ED8',
  '#a78bfa': '#60A5FA',
  '#8b5cf6': '#3B82F6',
  '#c4b5fd': '#93C5FD',
  'rgba(124, 58, 237': 'rgba(37, 99, 235',
  'rgba(109, 40, 217': 'rgba(29, 78, 216'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
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
  
  for (const [purple, blue] of Object.entries(replacements)) {
    newContent = newContent.replaceAll(purple, blue);
    if (purple.startsWith('#')) {
      newContent = newContent.replaceAll(purple.toUpperCase(), blue);
    }
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${count} files.`);
