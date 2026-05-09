const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/bg-white\/5 backdrop-blur-2xl shadow-\[0_8px_32px_0_rgba\(0,0,0,0\.3\)\]/g, 'bg-gray-900/60');
code = code.replace(/bg-white\/5 backdrop-blur-xl shadow-\[0_8px_32px_0_rgba\(0,0,0,0\.2\)\]/g, 'bg-gray-900/40');
code = code.replace(/bg-black\/20 backdrop-blur-3xl shadow-\[0_8px_32px_0_rgba\(0,0,0,0\.4\)\]/g, 'bg-gray-900/80');
code = code.replace(/bg-white\/10 backdrop-blur-2xl shadow-\[0_8px_32px_0_rgba\(0,0,0,0\.3\)\]/g, 'bg-gray-900');
code = code.replace(/bg-white\/5 backdrop-blur-lg/g, 'bg-gray-950/50');
code = code.replace(/bg-black\/20 backdrop-blur-md/g, 'bg-gray-950/80');
code = code.replace(/bg-white\/5 backdrop-blur-xl/g, 'bg-gray-950');
code = code.replace(/bg-white\/10/g, 'bg-gray-800');
code = code.replace(/bg-white\/5 backdrop-blur-3xl shadow-\[0_8px_32px_0_rgba\(0,0,0,0\.3\)\]/g, 'bg-[#050505]');
code = code.replace(/border-white\/10/g, 'border-gray-800');
code = code.replace(/border-white\/20/g, 'border-gray-700');

// Restore wrapper
code = code.replace(
  /<div className="min-h-screen bg-\[linear-gradient\(to_bottom_right,\#000000,\#0f0c29,\#302b63,\#000000\)\] text-gray-100 font-sans selection:bg-violet-500\/30 overflow-x-hidden relative">\s*<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">\s*<div className="absolute top-\[-10%\] left-\[-10%\] w-\[50vw\] h-\[50vw\] rounded-full bg-violet-600\/20 blur-\[120px\]" \/>\s*<div className="absolute top-\[20%\] right-\[-10%\] w-\[40vw\] h-\[60vw\] rounded-full bg-cyan-600\/10 blur-\[120px\]" \/>\s*<div className="absolute bottom-\[-10%\] left-\[20%\] w-\[60vw\] h-\[50vw\] rounded-full bg-fuchsia-600\/10 blur-\[120px\]" \/>\s*<\/div>\s*<div className="relative z-10 flex flex-col min-h-screen">/,
  '<div className="min-h-screen bg-[#111111] text-gray-100 font-sans selection:bg-violet-500/30 overflow-x-hidden">'
);

code = code.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*\);\s*}\s*export default App;/g,
  `</div>\n    </div>\n  );\n}\n\nexport default App;`
);

fs.writeFileSync('src/App.tsx', code);
