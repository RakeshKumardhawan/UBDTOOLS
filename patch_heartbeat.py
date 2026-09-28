import re

with open("src/components/BackupsView.tsx", "r") as f:
    content = f.read()

# Add polling useEffect
polling_effect = """
  // Heartbeat Polling for Remote Queue
  useEffect(() => {
    if (selectedTab !== 'remote_queue') return;
    const interval = setInterval(() => {
      fetch('/api/remote-queue')
        .then(res => res.json())
        .then(data => {
          if (data.queue) {
            setRemoteQueue(data.queue);
          }
        })
        .catch(err => console.error("Heartbeat sync error:", err));
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedTab]);

  const handleUpdateQueueStatus = async (id: string, newStatus: 'waiting' | 'in_progress' | 'connected' | 'resolved') => {
"""
content = content.replace("  const handleUpdateQueueStatus = async (id: string, newStatus: 'waiting' | 'in_progress' | 'connected' | 'resolved') => {", polling_effect)

# Change map to show offline items again
content = content.replace(
    "{remoteQueue.filter(item => item.isOnline !== false).map((item) => (",
    "{remoteQueue.map((item) => ("
)

# Add online/offline indicator next to ID
card_id = """<span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono font-bold text-[11px] text-slate-800 shadow-2xs">
                      ID: {item.id}
                    </span>"""

card_id_with_badge = """<div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono font-bold text-[11px] text-slate-800 shadow-2xs">
                        ID: {item.id}
                      </span>
                      {item.isOnline !== false ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Offline
                        </span>
                      )}
                    </div>"""

content = content.replace(card_id, card_id_with_badge)

# Update the 'Connect' button (1-Click Remote Control)
old_connect_btn = """<button
                        onClick={() => handleUpdateQueueStatus(item.id, 'connected')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs shadow-indigo-200"
                      >"""

new_connect_btn = """<button
                        onClick={() => handleUpdateQueueStatus(item.id, 'connected')}
                        disabled={item.isOnline === false}
                        title={item.isOnline === false ? 'Cannot connect: PC is Offline' : 'Connect to remote PC'}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                          item.isOnline !== false 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' 
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                        }`}
                      >"""
content = content.replace(old_connect_btn, new_connect_btn)

# Also disable 'Put in Queue' if offline? The prompt specifically asked for 'Join Session' button.
# There is a button with text "1-Click Remote Control", let's make sure it's covered.
# Let's check the text of the button.
# "1-Click Remote Control" -> that's the one.

with open("src/components/BackupsView.tsx", "w") as f:
    f.write(content)
print("Patched BackupsView.tsx")
