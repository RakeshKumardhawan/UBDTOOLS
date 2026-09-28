import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# 1. Import necessary icons and React hooks
content = content.replace(
    "import { \n  Settings,",
    "import { \n  Settings,\n  Radio,\n  CheckCircle2,"
)

# 2. Add OTA API state to SettingsView
component_start = "export const SettingsView: React.FC<SettingsViewProps> = ({ "
component_body = """export const SettingsView: React.FC<SettingsViewProps> = ({ 
  selectedProfile, 
  setSelectedProfile, 
  departmentProfiles,
  onClearLogs
}) => {
  const [otaApiUrl, setOtaApiUrl] = useState('https://www.e-vedhika.in/api/version');
  const [isTestingOta, setIsTestingOta] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestOtaConnection = () => {
    setIsTestingOta(true);
    setTestResult(null);
    // Simulate API connection test
    setTimeout(() => {
      setIsTestingOta(false);
      setTestResult('success');
      setTimeout(() => setTestResult(null), 3000);
    }, 1500);
  };
"""
content = content.replace(
    "export const SettingsView: React.FC<SettingsViewProps> = ({\n  selectedProfile,\n  setSelectedProfile,\n  departmentProfiles,\n  onClearLogs\n}) => {",
    component_body
)

# 3. Add 'OTA Gateway Configuration' section
auto_update_end = """              </button>
            </div>
          </div>
        </div>"""

ota_section = """              </button>
            </div>
          </div>
        </div>

        {/* OTA Gateway Configuration */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Radio className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">OTA Gateway Configuration</h3>
          </div>
          <div className="space-y-4 text-xs">
            <p className="text-slate-500 leading-relaxed">
              Configure the remote API URL for central push notifications. This endpoint is used by the central server to push Over-The-Air (OTA) broadcast events to this client.
            </p>
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Remote API URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={otaApiUrl}
                  onChange={(e) => setOtaApiUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/ota-push"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleTestOtaConnection}
                  disabled={isTestingOta || !otaApiUrl}
                  className={`px-4 py-2 rounded-lg font-bold text-white transition-all flex items-center gap-2 shadow-xs ${
                    isTestingOta 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : testResult === 'success'
                      ? 'bg-emerald-500'
                      : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                  }`}
                >
                  {isTestingOta ? (
                    <span>Testing...</span>
                  ) : testResult === 'success' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <span>Test Connection</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>"""

content = content.replace(auto_update_end, ota_section)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
print("SettingsView.tsx patched.")
