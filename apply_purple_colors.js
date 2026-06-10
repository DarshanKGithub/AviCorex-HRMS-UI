const fs = require('fs');
const path = require('path');

const replacements = {
  '#2563EB': '#7C3AED',
  '#2563eb': '#7c3aed',
  '#1D4ED8': '#6d28d9',
  '#1d4ed8': '#6d28d9',
  '#60A5FA': '#a855f7',
  '#60a5fa': '#a855f7',
  '#3B82F6': '#8b5cf6',
  '#3b82f6': '#8b5cf6',
  '#93C5FD': '#c4b5fd',
  '#93c5fd': '#c4b5fd',
  'rgba(37, 99, 235': 'rgba(124, 58, 237',
  'rgba(29, 78, 216': 'rgba(109, 40, 217'
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
  
  for (const [blue, purple] of Object.entries(replacements)) {
    newContent = newContent.replaceAll(blue, purple);
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${count} files.`);
