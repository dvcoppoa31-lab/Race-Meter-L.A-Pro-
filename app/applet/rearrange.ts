import * as fs from "fs";

const code = fs.readFileSync("src/App.tsx", "utf8");

const heroStart = code.indexOf("{/* Hero Section: Speed & Main Metrics */}");
const heroEndMarker = "        </div>\n\n          <div className=\"grid grid-cols-2 gap-4\">";
const heroEnd = code.indexOf(heroEndMarker);

const gridStart = code.indexOf("          <div className=\"grid grid-cols-2 gap-4\">");
const gridEndMarker = "        </div>\n      </div>\n\n      {/* Main Splits Panel */}";
const gridEnd = code.indexOf(gridEndMarker) + 14; 

const splitsStart = code.indexOf("      {/* Main Splits Panel */}");
const splitsEndMarker = "      {/* GPS Status & Calibration Bar */}";
const splitsEnd = code.indexOf(splitsEndMarker);

console.log({heroStart, heroEnd, gridStart, gridEnd, splitsStart, splitsEnd});

if (heroStart === -1 || heroEnd === -1 || gridStart === -1 || gridEnd === -1 || splitsStart === -1 || splitsEnd === -1) {
  process.exit(1);
}

const beforeHero = code.substring(0, heroStart);
const heroSection = code.substring(heroStart, heroEnd + 14); 
const cardGrid = code.substring(gridStart, gridEnd);
const splitsPanel = code.substring(splitsStart, splitsEnd);
const afterSplits = code.substring(splitsEnd);

let newHero = heroSection.replace("<div className=\"grid grid-cols-1 lg:grid-cols-2 gap-4\">\n", "");
newHero = newHero.trimEnd();

// Adjust indentations for card grid
let newCardGrid = cardGrid.replace(/          <div className=\"grid grid-cols-2 gap-4\">/g, '      <div className=\"grid grid-cols-2 gap-4\">');
// Find the last </div> of cardGrid and indent it
if (newCardGrid.endsWith('        </div>\n      </div>')) {
   newCardGrid = newCardGrid.substring(0, newCardGrid.length - 29) + '      </div>';
}

const newCode = beforeHero + 
                newHero + '\n\n' + 
                splitsPanel + 
                newCardGrid + '\n\n' + 
                afterSplits;

fs.writeFileSync("src/App.tsx", newCode);
console.log("Done rearranging.");
