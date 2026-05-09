const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/bg-gray-900\/60/g, 'bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]');
code = code.replace(/bg-gray-900\/40/g, 'bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]');
code = code.replace(/bg-gray-900\/80/g, 'bg-black/20 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]');
code = code.replace(/bg-gray-900/g, 'bg-white/10 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]');
code = code.replace(/bg-gray-950\/50/g, 'bg-white/5 backdrop-blur-lg');
code = code.replace(/bg-gray-950\/80/g, 'bg-black/20 backdrop-blur-md');
code = code.replace(/bg-gray-950/g, 'bg-white/5 backdrop-blur-xl');
code = code.replace(/bg-gray-800/g, 'bg-white/10');
code = code.replace(/bg-\[\#050505\]/g, 'bg-white/5 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]');
code = code.replace(/border-gray-800/g, 'border-white/10');
code = code.replace(/border-gray-700/g, 'border-white/20');
code = code.replace(/bg-\[\#111111\]/g, 'bg-black');

// Let's add some background orbs to the main wrapper
code = code.replace(
  '<div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-violet-500/30 overflow-x-hidden">',
  `<div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-violet-500/30 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px]" />
      </div>
      <div className="relative z-10">`
);

// We need to close the extra div at the end if we added one. Actually it's easier to just append the blobs instead of wrapping.
// Wait, I can just insert the orbs right after <div className="min-h-screen ...">
code = code.replace(
  /<div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-violet-500\/30 overflow-x-hidden relative">([\s\S]*?)<div className="relative z-10">/,
  '<div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-violet-500/30 overflow-x-hidden relative">'
);

code = code.replace(
  '<div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-violet-500/30 overflow-x-hidden">',
  `<div className="min-h-screen bg-[linear-gradient(to_bottom_right,#000000,#0f0c29,#302b63,#000000)] text-gray-100 font-sans selection:bg-violet-500/30 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[60vw] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[50vw] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">`
);

// Replace the end tag of the app root
code = code.replace(
  /<\/div>\n    <\/div>\n  \);\n}\n\nexport default App;$/,
  `</div>\n    </div>\n    </div>\n  );\n}\n\nexport default App;`
);

fs.writeFileSync('src/App.tsx', code);
