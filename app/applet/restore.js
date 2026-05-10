const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
const original_heroStart = 229793;
const beforeHero = code.substring(0, original_heroStart);
const dashboardViewStart = code.lastIndexOf("const DashboardView = React.memo(({", original_heroStart);
console.log("dashboardViewStart", dashboardViewStart);
const startOfCardGridOriginal = beforeHero.substring(117377, 117400);
console.log("startOfCardGridOriginal", JSON.stringify(startOfCardGridOriginal));
const indexOfNewCardGrid = code.indexOf(startOfCardGridOriginal, 229793);
console.log("indexOfNewCardGrid", indexOfNewCardGrid);
