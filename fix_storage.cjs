const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /if \(localStorage\.getItem\("race_logged_in"\) === "true"\) \{\s*localStorage\.setItem\("race_current_user", JSON\.stringify\(updatedUser\)\);\s*\}/,
  `if (localStorage.getItem("race_logged_in") === "true") {
            localStorage.setItem("race_current_user", JSON.stringify(updatedUser));
          }
          if (sessionStorage.getItem("race_logged_in") === "true") {
            sessionStorage.setItem("race_current_user", JSON.stringify(updatedUser));
          }`
);

fs.writeFileSync('src/App.tsx', code);
