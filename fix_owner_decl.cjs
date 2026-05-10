const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const isOwner = isOwner \|\| \(currentUser\?\.username \|\| ""\)\.toLowerCase\(\) === "atmin";/,
  `const isOwner = currentUser?.role === "owner" || (currentUser?.username || "").toLowerCase() === "atmin";`
);

fs.writeFileSync('src/App.tsx', code);
