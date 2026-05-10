const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  '  const isOwner = currentUser?.role === "owner" || (currentUser?.username || "").toLowerCase() === "atmin";',
  '  const isMainOwner = (currentUser?.username || "").toLowerCase() === "atmin";\n  const isOwner = currentUser?.role === "owner" || isMainOwner;'
);

code = code.replace(
  'if (targetUser && targetUser.role === "owner" && !isOwner) {',
  'if (targetUser && targetUser.role === "owner" && !isMainOwner) {'
);

code = code.replace(
  '      setAdminMessage("Only owner can delete owners");',
  '      setAdminMessage("Only the main owner can delete owners");'
);

code = code.replace(
  '    if (targetUser && targetUser.role === "admin" && !isOwner) {',
  '    if (targetUser && targetUser.role === "admin" && !isOwner) {'
);

// We need to carefully update `u.role !== "owner"` in the UI to allow isMainOwner to bypass it.
code = code.replace(
  /\{isOwner && u\.role !== "owner" && \(/g,
  '{(isOwner && u.role !== "owner" || isMainOwner) && ('
);

code = code.replace(
  /\{\(isAdminOrOwner\) && u\.role !== "owner" && \(/g,
  '{(isAdminOrOwner) && (u.role !== "owner" || isMainOwner) && ('
);

code = code.replace(
  /\{\(isAdminOrOwner\) && u\.boundDeviceId && u\.role !== "owner" && \(/g,
  '{(isAdminOrOwner) && u.boundDeviceId && (u.role !== "owner" || isMainOwner) && ('
);

// Delete button logic check
code = code.replace(
  /\{\(u\.username \|\| ""\)\.toLowerCase\(\) !== "atmin" && u\.username !== currentUser\?\.username && \(/g,
  '{(u.username || "").toLowerCase() !== "atmin" && u.username !== currentUser?.username && (isMainOwner || u.role !== "owner") && ('
);

// Update demote owner to admin if MainOwner
const targetStr = `                                         ) : u.role === "admin" ? (
                                           <>
                                             <button 
                                               onClick={() => handleUpdateRole(u.username, "customer")}
                                               className="p-1 rounded-md bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white transition-all mr-1"
                                               title="Demote to Member"
                                             ><ArrowDownCircle className="w-3 h-3" /></button>
                                             <button 
                                               onClick={() => handleUpdateRole(u.username, "owner")}
                                               className="p-1 rounded-md bg-amber-600/20 text-amber-500 hover:bg-amber-600 hover:text-white transition-all"
                                               title="Promote to Owner"
                                             ><ShieldAlert className="w-3 h-3" /></button>
                                           </>
                                         ) : null}`;

const insertStr = `                                         ) : u.role === "admin" ? (
                                           <>
                                             <button 
                                               onClick={() => handleUpdateRole(u.username, "customer")}
                                               className="p-1 rounded-md bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white transition-all mr-1"
                                               title="Demote to Member"
                                             ><ArrowDownCircle className="w-3 h-3" /></button>
                                             <button 
                                               onClick={() => handleUpdateRole(u.username, "owner")}
                                               className="p-1 rounded-md bg-amber-600/20 text-amber-500 hover:bg-amber-600 hover:text-white transition-all"
                                               title="Promote to Owner"
                                             ><ShieldAlert className="w-3 h-3" /></button>
                                           </>
                                         ) : (u.role === "owner" && isMainOwner) ? (
                                             <button 
                                               onClick={() => handleUpdateRole(u.username, "admin")}
                                               className="p-1 rounded-md bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white transition-all mr-1"
                                               title="Demote to Admin"
                                             ><ArrowDownCircle className="w-3 h-3" /></button>
                                         ) : null}`;

code = code.replace(targetStr, insertStr);

fs.writeFileSync('src/App.tsx', code);
