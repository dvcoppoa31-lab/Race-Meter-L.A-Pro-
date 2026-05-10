const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix 1: onSnapshot inside useEffect "Real-time User Role/Data Sync"
code = code.replace(
  /const unsub = onSnapshot\(userRef, \(doc\) => {\s*if \(doc\.exists\(\)\) {\s*const updatedUser = doc\.data\(\) as User;/g,
  'const unsub = onSnapshot(userRef, (docSnap) => {\n        if (docSnap.exists()) {\n          const updatedUser = { ...docSnap.data(), username: docSnap.id || docSnap.data().username } as User;'
);

// Fix 2: same for handleLogin
code = code.replace(
  /const user = userDoc\.data\(\) as User;/g,
  'const user = { ...userDoc.data(), username: userDoc.id || userDoc.data().username } as User;'
);

// Fix 3: race_user -> race_current_user
code = code.replace(
  /localStorage\.setItem\("race_user", JSON\.stringify\(newData\)\);/g,
  'localStorage.setItem("race_current_user", JSON.stringify(newData));'
);
code = code.replace(
  /localStorage\.setItem\("race_user", JSON\.stringify\(editForm\)\);/g,
  'localStorage.setItem("race_current_user", JSON.stringify(editForm));'
);

fs.writeFileSync('src/App.tsx', code);
