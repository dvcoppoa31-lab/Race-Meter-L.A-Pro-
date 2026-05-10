const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /localStorage\.setItem\("race_current_user", JSON\.stringify\(newData\)\);/,
  `saveAuthToStorage(newData);`
);

code = code.replace(
  /localStorage\.setItem\("race_current_user", JSON\.stringify\(editForm\)\);/,
  `saveAuthToStorage(editForm);`
);

fs.writeFileSync('src/App.tsx', code);
