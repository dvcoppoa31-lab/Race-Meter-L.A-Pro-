import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const backup = fs.readFileSync('src/App.tsx', 'utf8');
fs.writeFileSync('src/App.tsx.backup', backup);

// We know beforeHero is exactly the first 229793 chars! Let's slice it:
const original_heroStart = 229793;
const beforeHero = code.substring(0, original_heroStart);

// We can just extract everything after original_splitsEnd from newCode. 
// However, exact text of splitsPanel, newHero, etc. is in there.

// It might be easier to use `code.lastIndexOf` or regex to find the components
// Let's just find the closing tag of DashboardView.

const dashboardViewStart = code.lastIndexOf("const DashboardView = React.memo(({", original_heroStart);
console.log("dashboardViewStart", dashboardViewStart);

// To just fix the file, I can read the chunks from the backup that was ruined.
// The string `heroSection` was from original_heroStart (229793) up to original_heroEnd (232863) + 14.
// Let's extract them from the duplicated mess.
// Or wait, `newHero` had the outer div removed, so it's slightly shorter.
// But `beforeHero` is perfectly intact!
// And `afterSplits` is intact! It starts exactly where `splitsPanel` ends.

// What did original `heroSection` look like? 
// It starts with `{/* Hero Section: Speed & Main Metrics */}`.
// What about the real `cardGrid`? It was from real gridStart to gridEnd.
// Where was the real `gridStart`?
// It was right after `heroEnd (232863) + 14`.
// Let's check the original index of real gridStart:
// The original heroEnd was 232863. The string was `        </div>\n\n          <div className=\"grid grid-cols-2 gap-4\">`.
// So the real gridStart was exactly `heroEnd + 10` (or `heroEnd + 11`).
// Let's find it in `newCardGrid`! 
// `newCardGrid` contains the string from 117377 to 236545 of the ORIGINAL file.
// So the original file from 117377 to 236545 is stored in `newCardGrid`.
// Since we have `beforeHero` (0 to 229793), we ALREADY HAVE the exact bytes of 0 to 229793 of original file!
// So from `beforeHero`, we can reconstruct `code` up to 229793.
// Wait, `original_heroStart` is 229793.
// And `newCardGrid` has 117377 to 236545! This overlaps perfectly.
// So original file from 229793 to 236545 is inside `newCardGrid`!
// What is `newCardGrid` ? It's the `cardGrid` but with indentations modified!
// Wait! I did `.replace(/          <div className=\"grid grid-cols-2 gap-4\">/g, '      <div className=\"grid grid-cols-2 gap-4\">')`.
// So I can reverse this replacement!
// Then I have the EXACT original file from 0 to 236545.
// And what about after 236545? That's `original_splitsStart`! NO, the original script said:
// `gridEnd = code.indexOf(gridEndMarker) + 14`, which was 236531 + 14 = 236545.
// `splitsStart = 236546`.
// So they are contiguous!
// And `splitsEnd = 239938`. `afterSplits` is from 239938 to EOF.
// ALL bytes of the original file STILL EXIST!
// Let's reconstruct it EXACTLY!

const origPart1 = beforeHero; // 0 to 229793

// newCardGrid was created like this:
// const cardGrid = code.substring(117377, 236545);
// So the original bytes from 229793 to 236545 are `cardGrid.substring(229793 - 117377)`.
// We don't have `cardGrid` directly, but it's embedded in `newCode`!
// Where is `newCardGrid` in `newCode`?
// newCode = beforeHero + newHero + '\n\n' + splitsPanel + newCardGrid + '\n\n' + afterSplits;
// newHero length:
// heroSection was orig(229793, 232877). Length = 3084.
// replaced `<div className=\"grid grid-cols-1 lg:grid-cols-2 gap-4\">\n` (length 64) -> 3020.
// trimEnd() removed maybe some spaces. Let's say length is ~3020.
// splitsPanel length is 239938 - 236546 = 3392.
// So newCardGrid starts around 229793 + 3020 + 2 + 3392 = 236207.
// Let's just find `newCardGrid` in `newCode`.
// It starts with the string originally at 117377!
// What was at 117377?
// Well, we can just look up `code.substring(117377, 117400)` from `beforeHero`.

const startOfCardGridOriginal = beforeHero.substring(117377, 117400);
console.log("startOfCardGridOriginal", JSON.stringify(startOfCardGridOriginal));

// Let's locate this string in newCode after 229793.
const indexOfNewCardGrid = code.indexOf(startOfCardGridOriginal, 229793);
console.log("indexOfNewCardGrid", indexOfNewCardGrid);

const originalCardGrid = code.substring(indexOfNewCardGrid, code.indexOf(startOfCardGridOriginal, 229793) + (236545 - 117377)); 

// Wait, newCardGrid was modified!
// Its length might not be exactly (236545 - 117377) because of the replacements.
// Let's just restore the file WITHOUT relying on perfect math, because the user wants "split target di menu utama taruh diatas waktu berjalan dan jarak".
// We can just extract everything before DashboardView, and everything after DashboardView, and REWRITE DashboardView manually!
