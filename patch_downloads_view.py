import re

with open('src/components/DownloadsView.tsx', 'r') as f:
    content = f.read()

# Replace pre tag and header
old_box = re.search(r'<div className="bg-slate-950 text-emerald-400.*?>.*?</div>\s*</div>', content, re.DOTALL)
if old_box:
    new_box = """<div className="bg-slate-950 text-emerald-400 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 text-slate-300">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveScriptTab('deploy')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeScriptTab === 'deploy'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>⚡ Deploy Script</span>
                </button>
                <button
                  onClick={() => setActiveScriptTab('uninstall')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeScriptTab === 'uninstall'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>🗑️ Uninstall & Revert Script</span>
                </button>
              </div>
              <button
                id="btn-copy-ps1-code"
                onClick={copyScript}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-3 rounded-lg bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[380px]">
              {currentScript}
            </pre>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Run command: <code className="text-emerald-300">Set-ExecutionPolicy Unrestricted -Scope Process; .\\{activeScriptTab === 'deploy' ? 'evedhika_ubd_installer.ps1' : 'Uninstall_EVedhika_UBD.ps1'}</code>
          </div>
        </div>"""
    content = content[:old_box.start()] + new_box + content[old_box.end():]
    with open('src/components/DownloadsView.tsx', 'w') as f:
        f.write(content)
    print("Patched DownloadsView.tsx script box successfully")
else:
    print("Could not match script box in DownloadsView.tsx")
