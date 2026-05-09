const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/AtminRaceMeter27/g, 'AtminDragRace27');
fs.writeFileSync('src/App.tsx', code);
