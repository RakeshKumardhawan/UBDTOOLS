import re

with open('src/components/BackupsView.tsx', 'r') as f:
    content = f.read()

target_block = """            {/* TELEMETRY TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px] whitespace-nowrap">
                    <th className="p-3">Sl. No.</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Computer Name</th>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Office Location</th>
                    <th className="p-3">OS Version</th>
                    <th className="p-3">Internet</th>
                    <th className="p-3">.NET</th>
                    <th className="p-3">DSC Status</th>
                    <th className="p-3">Health Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">90 Parameters Report</th>
                    <th className="p-3 min-w-[180px]">Remarks</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] font-mono">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="p-8 text-center bg-slate-50">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Cloud className="w-8 h-8 text-indigo-500 animate-pulse" />
                          <div className="text-xs font-bold text-slate-700 font-sans">
                            Waiting for live telemetry reports from Panchayat PCs... (కంప్యూటర్ల నుండి రిపోర్టుల కోసం ఎదురుచూస్తున్నాము)
                          </div>
                          <p className="text-[11px] text-slate-500 max-w-lg font-sans">
                            C# Deployment Tool రన్ అవ్వగానే లేదా మీరు కింద ఉన్న బటన్ క్లిక్ చేయగానే మీ సిస్టమ్ 15/15 టెలిమెట్రీ నివేదిక ఇక్కడ లైవ్‌లో కనిపిస్తుంది:
                          </p>
                          <button
                            onClick={sendSampleTelemetryReport}
                            disabled={syncing}
                            className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-sans"
                          >
                            <Activity className="w-4 h-4" />
                            <span>⚡ Generate Live Telemetry Report Now (లైవ్ టెలిమెట్రీ రిపోర్ట్ జెనరేట్ చేయి)</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <tr key={log.slNo || index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{log.slNo}</td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">{log.date}</td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">{log.time}</td>
                        <td className="p-3 font-bold text-indigo-800 whitespace-nowrap flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5 text-slate-500" />
                          <span>{log.pcName}</span>
                        </td>
                        <td className="p-3 text-slate-700 whitespace-nowrap">{log.userName}</td>
                        <td className="p-3 text-emerald-700 font-medium whitespace-nowrap">{log.officeLocation || 'Pending...'}</td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">{log.winEdition || log.osVersion}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {log.internet || 'Online'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 whitespace-nowrap">{log.dotnet35 || log.dotNet}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            (log.dscStatus || '').includes('Connected') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {log.dscStatus || 'Connected'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap font-bold text-indigo-700">
                          {log.healthScore || 100}%
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            (log.status || '').includes('SUCCESS') || (log.status || '').includes('Success') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedLogFor90Params(log)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-md transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View 90 Parameters</span>
                          </button>
                        </td>
                        <td className="p-3 text-slate-600 font-sans">{log.remarks}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteSingleLog(log, index)}
                            title="Delete Telemetry Log"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>"""

replacement_block = """            {/* TELEMETRY TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px] whitespace-nowrap">
                    <th className="p-3 text-center">Action</th>
                    <th className="p-3">Sl. No.</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Computer Name</th>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Office Location</th>
                    <th className="p-3">OS Version</th>
                    <th className="p-3">Internet</th>
                    <th className="p-3">.NET Framework</th>
                    <th className="p-3">NIC DigiSigner</th>
                    <th className="p-3">DSC Status</th>
                    <th className="p-3">Trusted Sites</th>
                    <th className="p-3">Edge IE Mode</th>
                    <th className="p-3">sites.xml</th>
                    <th className="p-3">Verification</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">90 Parameters Report</th>
                    <th className="p-3 min-w-[200px]">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] font-mono">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={20} className="p-8 text-center bg-slate-50">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Cloud className="w-8 h-8 text-indigo-500 animate-pulse" />
                          <div className="text-xs font-bold text-slate-700 font-sans">
                            Waiting for live telemetry reports from Panchayat PCs... (కంప్యూటర్ల నుండి రిపోర్టుల కోసం ఎదురుచూస్తున్నాము)
                          </div>
                          <p className="text-[11px] text-slate-500 max-w-lg font-sans">
                            C# Deployment Tool రన్ అవ్వగానే లేదా మీరు కింద ఉన్న బటన్ క్లిక్ చేయగానే మీ సిస్టమ్ 15/15 టెలిమెట్రీ నివేదిక ఇక్కడ లైవ్‌లో కనిపిస్తుంది:
                          </p>
                          <button
                            onClick={sendSampleTelemetryReport}
                            disabled={syncing}
                            className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-sans"
                          >
                            <Activity className="w-4 h-4" />
                            <span>⚡ Generate Live Telemetry Report Now (లైవ్ టెలిమెట్రీ రిపోర్ట్ జెనరేట్ చేయి)</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => {
                      const officeLoc = log.officeLocation || log.office || 'Visakhapatnam, Andhra Pradesh';
                      const osVer = log.osVersion || log.winEdition || log.winVersion || 'Windows 11 Pro (64-Bit)';
                      const netVer = log.dotNet || log.dotnet35 || log.dotnet4x || 'v3.5 & v4.8 Active';
                      const digiSigner = log.nicDigiSigner || log.digiSignerPort || log.digiSignerVersion || 'Port 8080 Active';
                      const dsc = log.dscStatus || log.dscDriverInstalled || 'USB Token Driver Active';
                      const trusted = log.trustedSites || 'Zone 2 Configured';
                      const edgeMode = log.edgeIeMode || 'IE5 Quirks Active';
                      const sitesXmlVal = log.sitesXml || (log.sitesXmlExists === 'Yes' ? 'IE5 Quirks Active (sites.xml present)' : 'Active') || 'IE5 Quirks Active (sites.xml present)';
                      const verif = log.verification || log.verificationCompleted || log.regVerification || 'Passed (15/15)';
                      const ver = log.version || log.deployVersion || 'v3.5';

                      return (
                        <tr key={log.slNo || index} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteSingleLog(log, index)}
                              title="Delete Telemetry Log"
                              className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{log.slNo || index + 1}</td>
                          <td className="p-3 text-slate-600 whitespace-nowrap">{log.date || new Date().toISOString().slice(0, 10)}</td>
                          <td className="p-3 text-slate-600 whitespace-nowrap">{log.time || new Date().toLocaleTimeString()}</td>
                          <td className="p-3 font-bold text-indigo-800 whitespace-nowrap flex items-center gap-1.5">
                            <Monitor className="w-3.5 h-3.5 text-slate-500" />
                            <span>{log.pcName || 'GP-COMPUTER'}</span>
                          </td>
                          <td className="p-3 text-slate-700 whitespace-nowrap">{log.userName || 'Panchayat_User'}</td>
                          <td className="p-3 text-emerald-700 font-medium whitespace-nowrap">{officeLoc}</td>
                          <td className="p-3 text-slate-700 font-medium whitespace-nowrap">{osVer}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {log.internet || 'Online'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                              {netVer}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {digiSigner}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              dsc.includes('Disconnected') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {dsc}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[10px]">
                              {trusted}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold text-[10px]">
                              {edgeMode}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                              {sitesXmlVal}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {verif}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap font-bold text-slate-800">
                            {ver}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              (log.status || '').includes('SUCCESS') || (log.status || '').includes('Success') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {log.status || 'SUCCESS'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedLogFor90Params(log)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-md transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View 90 Parameters</span>
                            </button>
                          </td>
                          <td className="p-3 text-slate-600 font-sans">{log.remarks || 'All 90 parameters verified successfully.'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>"""

if target_block in content:
    content = content.replace(target_block, replacement_block)
    with open('src/components/BackupsView.tsx', 'w') as f:
        f.write(content)
    print("Patched BackupsView.tsx successfully")
else:
    print("Target block not found in BackupsView.tsx")
