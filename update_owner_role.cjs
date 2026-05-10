const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const handleUpdateRole = async \(username: string, newRole: "admin" \| "customer"\) => \{/,
  'const handleUpdateRole = async (username: string, newRole: "admin" | "customer" | "owner") => {'
);

code = code.replace(
  /\(isAdminOrOwner \? \["customer", "admin"\] \: \["customer"\]\)\.map\(\(r\)/,
  '(isOwner ? ["customer", "admin", "owner"] : isAdminOrOwner ? ["customer", "admin"] : ["customer"]).map((r)'
);

fs.writeFileSync('src/App.tsx', code);
