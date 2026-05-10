const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /snapshot\.forEach\(\(doc\) => \{\s*firestoreUsers\.push\(doc\.data\(\) as User\);\s*\}\);/,
  `snapshot.forEach((doc) => {
          const userObj = doc.data() as User;
          if ((userObj.username || doc.id).toLowerCase() === "atmin") {
            userObj.role = "owner";
          }
          firestoreUsers.push(userObj);
        });`
);

fs.writeFileSync('src/App.tsx', code);
