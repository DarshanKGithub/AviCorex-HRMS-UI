const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    });
    return results;
}

const frontendDir = '/home/darshan-kshetri/Desktop/Client_Works/HRMS/Frontend';
const dirsToScan = [
    path.join(frontendDir, 'app'),
    path.join(frontendDir, 'components')
];

let files = [];
dirsToScan.forEach(d => {
    if (fs.existsSync(d)) {
        files = files.concat(walk(d));
    }
});

let modifiedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // 1. Replace bgcolor: 'text.primary' with bgcolor: '#0f172a' when it is meant to be a dark card.
    // Actually, it's safer to just replace all `bgcolor: 'text.primary'` with `bgcolor: '#0f172a'`
    if (content.includes("bgcolor: 'text.primary'")) {
        content = content.replace(/bgcolor:\s*'text\.primary'/g, "bgcolor: '#0f172a'");
        modified = true;
    }

    // 2. Replace bgcolor: '#fff' and bgcolor: '#ffffff' with bgcolor: 'background.paper'
    if (content.match(/bgcolor:\s*'#(fff|ffffff)'/i)) {
        content = content.replace(/bgcolor:\s*'#(fff|ffffff)'/ig, "bgcolor: 'background.paper'");
        modified = true;
    }

    // 3. Replace bgcolor: '#f8fafc' with bgcolor: 'background.default'
    if (content.includes("bgcolor: '#f8fafc'")) {
        content = content.replace(/bgcolor:\s*'#f8fafc'/g, "bgcolor: 'background.default'");
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedFiles++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Successfully updated ${modifiedFiles} files.`);
