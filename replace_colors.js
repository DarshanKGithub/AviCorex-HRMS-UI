const fs = require('fs');
const path = require('path');

const replacements = {
  '#3b82f6': '#7c3aed',
  '#2563eb': '#6d28d9',
  '#60a5fa': '#a78bfa',
  '#0ea5e9': '#8b5cf6',
  '#38bdf8': '#a78bfa',
  '#7dd3fc': '#c4b5fd',
  'rgba(59, 130, 246': 'rgba(124, 58, 237',
  'rgba(37, 99, 235': 'rgba(109, 40, 217'
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

const files = walk('./app');

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  for (const [blue, purple] of Object.entries(replacements)) {
    newContent = newContent.replaceAll(blue, purple);
    // Also handle uppercase hex codes
    if (blue.startsWith('#')) {
      newContent = newContent.replaceAll(blue.toUpperCase(), purple);
    }
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${count} files.`);
