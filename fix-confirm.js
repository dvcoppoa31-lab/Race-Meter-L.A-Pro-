const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'const [userToDelete, setUserToDelete] = useState<string | null>(null);',
  `const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const requireConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setConfirmState(null);
        onConfirm();
      }
    });
  };`
);

let parts = content.split('{/* Delete User Confirmation Modal */}');
parts[0] = parts[0] + `{/* Generic Confirm Dialog */}
            <AnimatePresence>
              {confirmState?.isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-gray-900 border border-red-500/30 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl shadow-red-500/10 text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                      <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-black italic text-white mb-4 tracking-tighter uppercase">
                      {confirmState.title}
                    </h2>
                    <p className="text-sm text-gray-400 leading-relaxed mb-8 font-medium italic">
                      {confirmState.message}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmState(null)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest italic"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => confirmState.onConfirm()}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-600/20 transition-all text-xs uppercase tracking-widest italic"
                      >
                        Confirm
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Delete User Confirmation Modal */}`;

content = parts.join('');

fs.writeFileSync('src/App.tsx', content);
