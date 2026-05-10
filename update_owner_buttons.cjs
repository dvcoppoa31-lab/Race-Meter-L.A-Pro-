const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `                                         {u.role === "customer" ? (
                                           <button 
                                             onClick={() => handleUpdateRole(u.username, "admin")}
                                             className="p-1 rounded-md bg-violet-600/10 text-violet-500 hover:bg-violet-600 hover:text-white transition-all"
                                             title="Promote to Admin"
                                           ><ArrowUpCircle className="w-3 h-3" /></button>
                                         ) : (
                                           <button 
                                             onClick={() => handleUpdateRole(u.username, "customer")}
                                             className="p-1 rounded-md bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white transition-all"
                                             title="Demote to Member"
                                           ><ArrowDownCircle className="w-3 h-3" /></button>
                                         )}`;

const replacementStr = `                                         {u.role === "customer" ? (
                                           <button 
                                             onClick={() => handleUpdateRole(u.username, "admin")}
                                             className="p-1 rounded-md bg-violet-600/10 text-violet-500 hover:bg-violet-600 hover:text-white transition-all"
                                             title="Promote to Admin"
                                           ><ArrowUpCircle className="w-3 h-3" /></button>
                                         ) : u.role === "admin" ? (
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
                                             ><Star className="w-3 h-3" /></button>
                                           </>
                                         ) : null}`;

code = code.replace(targetStr, replacementStr);

fs.writeFileSync('src/App.tsx', code);
