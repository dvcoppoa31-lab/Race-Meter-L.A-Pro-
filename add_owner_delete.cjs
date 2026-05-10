const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr1 = `  const purgeAllGlobalHistory = async () => {`;
const insertStr1 = `  const deleteGlobalRun = async (username: string, runId: string) => {
    if (!window.confirm("Delete this run?")) return;
    try {
      await deleteDoc(doc(db, "users", (username || "").toLowerCase(), "runs", runId));
      logAction("DELETE_RUN", \`Deleted run \${runId} from \${username}\`);
      setAdminMessage("Run deleted");
    } catch (err) {
      console.error(err);
      setAdminMessage("Error deleting run");
    }
  };

  const purgeAllGlobalHistory = async () => {`;

code = code.replace(targetStr1, insertStr1);

const targetStr2 = `                          <div className="border-t border-gray-800 pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[9px] text-gray-500 font-black uppercase flex items-center gap-2">
                                <ListRestart className="w-3 h-3" /> Global Audit Logs`;

const insertStr2 = `                          <div className="border-t border-gray-800 pt-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-4">
                              <Trophy className="w-3 h-3 text-red-500" /> Global Run Moderation
                            </h4>
                            <div className="space-y-1.5 max-h-48 overflow-auto pr-2 custom-scrollbar mb-8">
                              {globalRuns.map((run) => (
                                <div key={run.id} className="bg-black/40 p-3 rounded-lg border border-gray-900 flex justify-between items-center gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-[10px] font-black text-violet-400 uppercase tracking-tighter leading-none">{run.username}</p>
                                      <span className="text-[8px] text-gray-500 font-bold bg-gray-900 rounded px-1 py-0.5">{run.totalDistance}m</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono tracking-tight">{(run.totalTime / 1000).toFixed(3)}s | {(run.maxSpeed || 0).toFixed(1)} km/h peak</p>
                                  </div>
                                  <button
                                    onClick={() => deleteGlobalRun(run.username, run.id)}
                                    className="p-2 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                                    title="Delete Run"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {globalRuns.length === 0 && <p className="text-[10px] text-gray-600">No runs found</p>}
                            </div>
                          </div>

                          <div className="border-t border-gray-800 pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[9px] text-gray-500 font-black uppercase flex items-center gap-2">
                                <ListRestart className="w-3 h-3" /> Global Audit Logs`;

code = code.replace(targetStr2, insertStr2);

fs.writeFileSync('src/App.tsx', code);
