import re

with open('src/components/DashboardView.tsx', 'r') as f:
    content = f.read()

# 1. Import necessary icons and React hooks
content = content.replace(
    "import React from 'react';",
    "import React, { useState } from 'react';"
)
content = content.replace(
    "import { \n  PlayCircle,",
    "import { \n  PlayCircle,\n  Wifi,\n  WifiOff,\n  Radio,\n  Filter,"
)

# 2. Add 'Update Broadcast' card and log filter state to DashboardView
component_start = "export const DashboardView: React.FC<DashboardViewProps> = ({ "
component_body = """export const DashboardView: React.FC<DashboardViewProps> = ({ 
  envStatus, 
  setActiveTab, 
  selectedProfile, 
  logs,
  onStartDeployment,
  isDeploying
}) => {
  const [logFilter, setLogFilter] = useState<string>('All');
  
  const filteredLogs = logFilter === 'All' 
    ? logs 
    : logs.filter(log => log.module === logFilter);

  // Mocking OTA broadcast state
  const otaStatus = 'Connected'; // Can be 'Connected' or 'Disconnected'
  const lastOtaSignal = new Date().toLocaleTimeString();
"""
content = content.replace(
    "export const DashboardView: React.FC<DashboardViewProps> = ({\n  envStatus,\n  setActiveTab,\n  selectedProfile,\n  logs,\n  onStartDeployment,\n  isDeploying\n}) => {",
    component_body
)

# 3. Add 'Update Broadcast' card to left column
# Find where to insert it. The left column ends around Ask Gemini AI card.
gemini_card = """          </div>
        </div>

        {/* Right Col: System Event Logs & Developer Info */}"""

broadcast_card = """          </div>
        </div>

        {/* Update Broadcast Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 border border-indigo-500/30 shadow-xl mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400" />
              <span>Update Broadcast (OTA)</span>
            </h4>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              {otaStatus === 'Connected' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-300">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[10px] font-bold text-rose-300">Disconnected</span>
                </>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-indigo-200">Listening for central push notifications.</p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-indigo-800/50 mt-3">
              Last signal received: <span className="text-indigo-300 font-semibold">{lastOtaSignal}</span>
            </div>
          </div>
        </div>

        {/* Right Col: System Event Logs & Developer Info */}"""

content = content.replace(gemini_card, broadcast_card)

# 4. Add filter dropdown to Live System Logs
live_logs_header = """            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live System Logs</h4>
              <span className="text-[10px] font-semibold text-slate-500">Real-time Audit</span>
            </div>"""

live_logs_header_new = """            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live System Logs</h4>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={logFilter} 
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                >
                  <option value="All">All Logs</option>
                  <option value="System">System</option>
                  <option value="Deployment">Deployment</option>
                  <option value="OTA Broadcast">OTA Broadcast</option>
                </select>
              </div>
            </div>"""

content = content.replace(live_logs_header, live_logs_header_new)

# 5. Change log mapping
content = content.replace(
    "{logs.slice(-5).reverse().map((entry) => (",
    "{filteredLogs.slice(-10).reverse().map((entry) => ("
)

with open('src/components/DashboardView.tsx', 'w') as f:
    f.write(content)
print("DashboardView.tsx patched.")
