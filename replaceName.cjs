const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/DRAG RACE/g, 'RACE METER');
code = code.replace(/DragRace/g, 'RaceMeter');
code = code.replace(/Drag Race/g, 'Race Meter');
fs.writeFileSync('src/App.tsx', code);
