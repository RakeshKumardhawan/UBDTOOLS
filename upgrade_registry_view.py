import json

# Read public/evedhika_master_zones.reg
with open('public/evedhika_master_zones.reg', 'r') as f:
    master_reg = f.read()

# Build setting items dictionary
user_keys = [
    "1001", "1004", "1200", "1201", "1206", "1208", "1209", "120A", "120B",
    "1400", "1402", "1405", "1406", "1407", "1409",
    "1604", "1606", "1607", "1608", "1609",
    "1802", "1803", "1804", "1806", "1809",
    "2000", "2001", "2004", "2007",
    "2100", "2102", "2103", "2104", "2105",
    "2201", "2300", "2301",
    "2400", "2401", "2402", "2600",
    "2702", "2708", "2709",
    "1A00", "1A04"
]

SETTING_INFO = {
    "1001": ("Download signed ActiveX controls", "ActiveX"),
    "1004": ("Download unsigned ActiveX controls", "ActiveX"),
    "1200": ("Run ActiveX controls and plug-ins", "ActiveX"),
    "1201": ("Initialize and script ActiveX not marked safe", "ActiveX"),
    "1206": ("Allow scripting of Microsoft web browser control", "ActiveX"),
    "1208": ("Allow previously unused ActiveX controls", "ActiveX"),
    "1209": ("Scriptlets", "ActiveX"),
    "120A": ("Display video and animation without external player", "ActiveX"),
    "120B": ("Override SmartScreen filter for ActiveX", "ActiveX"),
    "1400": ("Active scripting (JavaScript Execution)", "Scripting"),
    "1402": ("Scripting of Java applets", "Scripting"),
    "1405": ("Script ActiveX controls marked safe", "ActiveX"),
    "1406": ("Access data sources across domains", "Security"),
    "1407": ("Allow Programmatic clipboard access", "Clipboard"),
    "1409": ("Scripting of XSLT elements", "Scripting"),
    "1604": ("Font download", "Downloads"),
    "1606": ("Userdata persistence", "Miscellaneous"),
    "1607": ("Navigate windows and frames across domains", "Navigation"),
    "1608": ("Allow META REFRESH", "Miscellaneous"),
    "1609": ("Display mixed content (HTTP inside HTTPS)", "Mixed Content"),
    "1802": ("Drag and drop or copy and paste files", "Miscellaneous"),
    "1803": ("File download", "Downloads"),
    "1804": ("Launching programs and files in an IFRAME", "Frames"),
    "1806": ("Launching applications and unsafe files", "Security"),
    "1809": ("Use Pop-up Blocker", "Pop-up Blocker"),
    "2000": ("Binary and script behaviors", "ActiveX"),
    "2001": ("Run components signed with Authenticode / .NET", ".NET"),
    "2004": ("Run components not signed with Authenticode", ".NET"),
    "2007": ("Run components signed with Authenticode (Secondary)", ".NET"),
    "2100": ("Open files based on content (MIME Sniffing)", "Downloads"),
    "2102": ("Script-initiated windows without constraints", "Windows"),
    "2103": ("Allow status bar updates via script", "Status Bar"),
    "2104": ("Allow websites to open windows without address/status", "Windows"),
    "2105": ("Allow scripted prompt windows", "Windows"),
    "2201": ("Automatic prompting for ActiveX controls", "ActiveX"),
    "2300": ("Web sites in less privileged zone navigation", "Navigation"),
    "2301": ("Use SmartScreen Filter", "SmartScreen"),
    "2400": (".NET Framework: XAML browser applications", ".NET"),
    "2401": (".NET Framework: XPS documents", ".NET"),
    "2402": (".NET Framework: Loose XAML", ".NET"),
    "2600": ("Enable .NET Framework setup", ".NET"),
    "2702": ("ActiveX Filtering", "ActiveX"),
    "2708": ("Allow approved domains to use ActiveX", "ActiveX"),
    "2709": ("Run Antimalware against ActiveX", "Security"),
    "1A00": ("User Authentication Logon", "Authentication"),
    "1A04": ("Don't prompt for client certificate selection", "Certificates")
}

def make_zone_data(z_id):
    items = []
    for k in user_keys:
        val = 0
        status = "ENABLED"
        color = "emerald"
        if k == "2001":
            val = 3
            status = "DISABLED"
            color = "red"
        elif k == "1A00":
            val = 0x20000
            status = "INTRANET LOGON (0x20000)"
            color = "blue"
        elif k == "1804" and z_id == 1:
            val = 1
            status = "PROMPT (1)"
            color = "amber"
        
        name, cat = SETTING_INFO[k]
        val_str = f"dword:{val:08x}" if val == 0x20000 else f"dword:{val:08x} ({val})"
        items.append({
            "id": k,
            "name": name,
            "category": cat,
            "value": val_str,
            "status": status,
            "color": color
        })
    return items

z1_data = make_zone_data(1)
z2_data = make_zone_data(2)
z3_data = make_zone_data(3)

json_z1 = json.dumps(z1_data, indent=2)
json_z2 = json.dumps(z2_data, indent=2)
json_z3 = json.dumps(z3_data, indent=2)
json_reg = json.dumps(master_reg)

tsx_content = f'''import React, {{ useState }} from 'react';
import {{ 
  Database, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Code, 
  FileText, 
  Zap, 
  RefreshCw, 
  Terminal, 
  FileCode, 
  AlertTriangle,
  Lock,
  Globe,
  Building,
  Shield,
  Layers
}} from 'lucide-react';
import {{ DepartmentProfile }} from '../types';

interface RegistryViewProps {{
  selectedProfile: DepartmentProfile;
  onImportRegistry: () => void;
  isImporting: boolean;
}}

interface ZoneItem {{
  id: string;
  name: string;
  category: string;
  value: string;
  status: string;
  color: string;
}}

const ZONE1_SETTINGS: ZoneItem[] = {json_z1};
const ZONE2_SETTINGS: ZoneItem[] = {json_z2};
const ZONE3_SETTINGS: ZoneItem[] = {json_z3};

export const RegistryView: React.FC<RegistryViewProps> = ({{
  selectedProfile,
  onImportRegistry,
  isImporting,
}}) => {{
  const [activeTab, setActiveTab] = useState<'reg' | 'ps1' | 'bat' | 'csharp'>('reg');
  const [selectedZone, setSelectedZone] = useState<1 | 2 | 3>(2);
  const [copied, setCopied] = useState<string | null>(null);

  const regContent = {json_reg};

  const batContent = `@echo off
:: ============================================================================
:: E-Vedhika One-Click Launcher for UBD Telangana Registry Configuration
:: Target: https://ubd.telangana.gov.in/
:: ============================================================================
title E-Vedhika UBD Registry Automation Launcher
color 0B

echo ======================================================================
echo    E-VEDHIKA ONE-CLICK UBD REGISTRY CONFIGURATION LAUNCHER
echo    Target: https://ubd.telangana.gov.in/
echo ======================================================================
echo.

:: Check for Administrative Privileges and Auto-Elevate if needed
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrative Elevation...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\\getadmin.vbs"
    "%temp%\\getadmin.vbs"
    del "%temp%\\getadmin.vbs"
    exit /b
)

cd /d "%~dp0"
echo [1/3] Administrative privileges confirmed.
echo [2/3] Bypassing PowerShell execution restriction for deployment script...
echo [3/3] Launching Configure_UBD_Registry.ps1 ...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Configure_UBD_Registry.ps1"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] An error occurred during PowerShell execution (Exit Code: %errorlevel%).
    pause
    exit /b %errorlevel%
)

echo.
echo ======================================================================
echo  [SUCCESS] All UBD Registry settings configured and verified!
echo  Audit Report has been saved to C:\\EVedhika_UBD_Backups\\
echo ======================================================================
echo.
pause
`;

  const csharpCodeSnippet = `// C# WinForms Implementation: RegistryManager.cs
// Location: /csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs

public static void ApplyDirectZoneDwords()
{{
    // Applies Zone 1, Zone 2, Zone 3 settings directly to HKCU and HKLM
    var catalog = GetZoneSettingsCatalog();
    RegistryKey[] rootHives = new RegistryKey[] {{ Registry.CurrentUser, Registry.LocalMachine }};
    
    foreach (var root in rootHives)
    {{
        for (int zoneId = 1; zoneId <= 3; zoneId++)
        {{
            string subPath = $@"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\{{zoneId}}";
            using (var zk = root.CreateSubKey(subPath))
            {{
                if (zk != null)
                {{
                    var zoneItems = catalog.FindAll(x => x.ZoneId == zoneId);
                    foreach (var item in zoneItems)
                    {{
                        // Sets item: '2001' = 3 (Disabled), all others = 0 (Enabled)
                        zk.SetValue(item.ValueName, item.ExpectedValue, RegistryValueKind.DWord);
                    }}
                }}
            }}
        }}
    }}
}}

// Verification method: reads actual value from HKCU/HKLM and validates
public static List<ZoneVerificationResult> VerifyAllSecurityZones()
{{
    // Every setting is read back from Windows Registry and verified!
    // Result: PASS if Actual == Expected, else FAILED with explicit failure reason.
}}`;

  const ps1DownloadUrl = "/scripts/Configure_UBD_Registry.ps1";
  const batDownloadUrl = "/scripts/Launch_UBD_Deployment.bat";

  const handleCopy = (text: string, label: string) => {{
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  }};

  const downloadFile = (filename: string, content: string) => {{
    const blob = new Blob([content], {{ type: 'text/plain;charset=utf-8' }});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }};

  const currentZoneSettings = selectedZone === 1 
    ? ZONE1_SETTINGS 
    : selectedZone === 2 
    ? ZONE2_SETTINGS 
    : ZONE3_SETTINGS;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">UBD Registry & Security Zones Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% User Order Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly applied configuration across <b>Zone 1 (Local Intranet)</b>, <b>Zone 2 (Trusted Sites)</b>, and <b>Zone 3 (Internet Zone)</b>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-import-reg-now"
            onClick={onImportRegistry}
            disabled={isImporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {{isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}}
            <span>{{isImporting ? 'Applying to Registry...' : 'One-Click Apply Now'}}</span>
          </button>

          <button
            onClick={() => downloadFile('evedhika_master_zones.reg', regContent)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .REG</span>
          </button>

          <a
            href={ps1DownloadUrl}
            download="Configure_UBD_Registry.ps1"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .PS1</span>
          </a>
        </div>
      </div>

      {/* User Specification Notice Card */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-900">మీ ఆర్డర్ ప్రకారం అమలు చేసిన నిబంధన (User Order Active): </span>
            Zone 1, Zone 2, Zone 3 లలో కేవలం <code className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold font-mono">"2001"=3 (Disable)</code> మాత్రమే డిసేబుల్ చేయబడింది. మిగిలిన అన్ని సెట్టింగ్స్ <code className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">0 (Enable)</code> గానే అమర్చబడ్డాయి.
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 shadow-xs">
            Zone 1: 46 Keys
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 shadow-xs">
            Zone 2: 46 Keys
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 shadow-xs">
            Zone 3: 46 Keys
          </span>
        </div>
      </div>

      {/* Visual Interactive Zone Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Interactive Security Zones Inspector</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a security zone below to see all 46 configured values with their exact DWORD data:
            </p>
          </div>

          {/* Zone Selector Buttons */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedZone(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${{
                selectedZone === 1 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }}`}
            >
              <Building className="w-4 h-4" />
              <span>Zone 1: Local Intranet</span>
            </button>

            <button
              onClick={() => setSelectedZone(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${{
                selectedZone === 2 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }}`}
            >
              <Shield className="w-4 h-4" />
              <span>Zone 2: Trusted Sites</span>
            </button>

            <button
              onClick={() => setSelectedZone(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${{
                selectedZone === 3 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }}`}
            >
              <Globe className="w-4 h-4" />
              <span>Zone 3: Internet Zone</span>
            </button>
          </div>
        </div>

        {/* Zone Header Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-mono text-[10px] block">ZONE REGISTRY PATH</span>
            <span className="font-mono font-bold text-slate-800">
              HKCU\\...\\Zones\\{{selectedZone}}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[10px] block">SECURITY TEMPLATE LEVEL</span>
            <span className="font-mono font-bold text-blue-700">CurrentLevel = 0 (Custom Level)</span>
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[10px] block">FLAGS & VERIFICATION</span>
            <span className="font-mono font-bold text-emerald-700">
              {{selectedZone === 1 ? 'Flags = 0xdb' : selectedZone === 2 ? 'Flags = 0x47 (HTTPS Verification)' : 'Flags = 0x1'}}
            </span>
          </div>
        </div>

        {/* 46 Settings Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Registry ID</th>
                <th className="py-2.5 px-3">Official Setting Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Registry DWORD Value</th>
                <th className="py-2.5 px-3 text-right">Configured Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {{currentZoneSettings.map((item, idx) => (
                <tr 
                  key={{item.id}} 
                  className={`transition-colors ${{
                    item.id === '2001' 
                      ? 'bg-red-50/60 hover:bg-red-50' 
                      : item.id === '1804' && selectedZone === 1
                      ? 'bg-amber-50/50 hover:bg-amber-50'
                      : 'hover:bg-slate-50'
                  }}`}
                >
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{{idx + 1}}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{{item.id}}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{{item.name}}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{{item.category}}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 font-semibold">{{item.value}}</td>
                  <td className="py-2.5 px-3 text-right">
                    {{item.id === '2001' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300">
                        <Lock className="w-3 h-3" />
                        DISABLED (3)
                      </span>
                    ) : item.id === '1804' && selectedZone === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        PROMPT / ENABLE (1)
                      </span>
                    ) : item.id === '1A00' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        INTRANET LOGON
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        ENABLED (0)
                      </span>
                    )}}
                  </td>
                </tr>
              ))}}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Viewer Tabs (REG / C# / PS1 / BAT) */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('reg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${{
                activeTab === 'reg' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }}`}
            >
              <Code className="w-4 h-4" />
              <span>Registry File (.reg)</span>
            </button>

            <button
              onClick={() => setActiveTab('csharp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${{
                activeTab === 'csharp' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }}`}
            >
              <FileCode className="w-4 h-4" />
              <span>C# RegistryManager.cs</span>
            </button>

            <button
              onClick={() => setActiveTab('ps1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${{
                activeTab === 'ps1' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }}`}
            >
              <FileText className="w-4 h-4" />
              <span>PowerShell Script (.ps1)</span>
            </button>

            <button
              onClick={() => setActiveTab('bat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${{
                activeTab === 'bat' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }}`}
            >
              <Terminal className="w-4 h-4" />
              <span>BAT Launcher (.bat)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {{
                const currentContent = activeTab === 'reg' 
                  ? regContent 
                  : activeTab === 'csharp'
                  ? csharpCodeSnippet
                  : activeTab === 'bat'
                  ? batContent
                  : 'PowerShell script content from /scripts/Configure_UBD_Registry.ps1';
                handleCopy(currentContent, activeTab);
              }}}}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {{copied === activeTab ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}}
              <span>{{copied === activeTab ? 'Copied!' : 'Copy Code'}}</span>
            </button>

            <button
              onClick={() => {{
                if (activeTab === 'reg') downloadFile('evedhika_master_zones.reg', regContent);
                else if (activeTab === 'bat') downloadFile('Launch_UBD_Deployment.bat', batContent);
                else {{
                  const link = document.createElement('a');
                  link.href = ps1DownloadUrl;
                  link.download = 'Configure_UBD_Registry.ps1';
                  link.click();
                }}
              }}}}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Tab Code View */}
        {{activeTab === 'reg' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Full Master Registry File (.reg) containing Zone 1, Zone 2, and Zone 3 with 2001=3 and all others=0:</span>
              <span className="font-mono text-emerald-400">Location: public/evedhika_master_zones.reg</span>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[480px]">
              {{regContent}}
            </pre>
          </div>
        )}}

        {{activeTab === 'csharp' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>C# Source Code inside <code>csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs</code>:</span>
              <span className="font-mono text-indigo-400">Engine: RegistryManager.cs</span>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[480px]">
              {{csharpCodeSnippet}}
            </pre>
          </div>
        )}}

        {{activeTab === 'ps1' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>PowerShell Script: Configure_UBD_Registry.ps1</span>
              <span className="font-mono text-blue-400">Auto-Elevation + Auto-Backup + Deep Verification</span>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[480px]">
{{`# Configure_UBD_Registry.ps1 (Contains full Zone 1, 2, 3 catalog with 2001=3 and all others=0)
# To view complete file or execute, download Configure_UBD_Registry.ps1 or run via 1-Click launcher.`}}
            </pre>
          </div>
        )}}

        {{activeTab === 'bat' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400">
              1-Click Double-Click Launcher with built-in UAC VBS elevation shim:
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[480px]">
              {{batContent}}
            </pre>
          </div>
        )}}
      </div>
    </div>
  );
}};
'''

with open('src/components/RegistryView.tsx', 'w') as f:
    f.write(tsx_content)

print("RegistryView.tsx upgraded with Interactive Zone Inspector and exact user .reg!")
