import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Code, 
  FileText,
  Zap,
  RefreshCw
} from 'lucide-react';
import { DepartmentProfile } from '../types';

interface RegistryViewProps {
  selectedProfile: DepartmentProfile;
  onImportRegistry: () => void;
  isImporting: boolean;
}

export const RegistryView: React.FC<RegistryViewProps> = ({
  selectedProfile,
  onImportRegistry,
  isImporting,
}) => {
  const [copiedReg, setCopiedReg] = useState(false);

  const regContent = `Windows Registry Editor Version 5.00

; ====================================================================
; E-Vedhika Master Internet Security Zones Configuration (Zones 0-4)
; Developer: Rakesh Dhawan | E-Vedhika UBD Tool
; Configured for Telangana UBD (https://ubd.telangana.gov.in/) & AP UBD
; ====================================================================

; 1. Zone Map Domains (Trusted Sites Zone 2)
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in\\ubd]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\ubd.telangana.gov.in]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in\\ubd]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\ubd.telangana.gov.in]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

; 2. Zone 0: My Computer
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\0]
"2001"=dword:00000003
"2004"=dword:00000003
@=""
"DisplayName"="Computer"
"PMDisplayName"="Computer [Protected Mode]"
"Description"="Your computer"
"Icon"="shell32.dll#0016"
"LowIcon"="inetcpl.cpl#005422"
"CurrentLevel"=dword:00000000
"Flags"=dword:00000021
"1200"=dword:00000000
"1400"=dword:00000000

; 3. Zone 1: Local Intranet
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\1]
"2001"=dword:00000000
"2004"=dword:00000000
@=""
"DisplayName"="Local intranet"
"PMDisplayName"="Local intranet [Protected Mode]"
"Description"="This zone contains all Web sites that are on your organization's intranet."
"Icon"="shell32.dll#0018"
"LowIcon"="inetcpl.cpl#005423"
"CurrentLevel"=dword:00000000
"Flags"=dword:000000db
"1200"=dword:00000000
"1400"=dword:00000000
"2500"=dword:00000003
"2402"=dword:00000000
"2400"=dword:00000000
"2401"=dword:00000000
"2007"=dword:00000003
"2702"=dword:00000000
"1208"=dword:00000000
"1209"=dword:00000000
"2201"=dword:00000000
"2000"=dword:00000000
"120A"=dword:00000000
"1001"=dword:00000000
"1004"=dword:00000000
"1201"=dword:00000000
"270C"=dword:00000000
"1405"=dword:00000000
"1803"=dword:00000000
"1604"=dword:00000000
"2600"=dword:00000000
"1406"=dword:00000000
"2709"=dword:00000000
"2708"=dword:00000000
"1608"=dword:00000000
"1206"=dword:00000000
"2102"=dword:00000000
"120C"=dword:00000000
"2300"=dword:00000000
"2104"=dword:00000000
"1609"=dword:00000000
"1A04"=dword:00000000
"1802"=dword:00000000
"2100"=dword:00000000
"160A"=dword:00000000
"1806"=dword:00000000
"1804"=dword:00000000
"1607"=dword:00000000
"270B"=dword:00000000
"1601"=dword:00000000
"1809"=dword:00000000
"2301"=dword:00000000
"1606"=dword:00000000
"2101"=dword:00000000
"1407"=dword:00000000
"2103"=dword:00000000
"2105"=dword:00000000
"1409"=dword:00000000
"1402"=dword:00000000
"1A00"=dword:00020000
"2707"=dword:00000000

; 4. Zone 2: Trusted Sites
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2]
"2001"=dword:00000000
"2004"=dword:00000000
@=""
"DisplayName"="Trusted sites"
"PMDisplayName"="Trusted sites [Protected Mode]"
"Description"="This zone contains Web sites that you trust not to damage your computer or data."
"Icon"="inetcpl.cpl#00004480"
"LowIcon"="inetcpl.cpl#005424"
"CurrentLevel"=dword:00000000
"Flags"=dword:00000047
"1200"=dword:00000000
"1400"=dword:00000000
"1001"=dword:00000000
"1004"=dword:00000000
"1201"=dword:00000000
"1206"=dword:00000003
"1207"=dword:00000000
"1208"=dword:00000000
"1209"=dword:00000000
"120A"=dword:00000003
"120C"=dword:00000000
"1402"=dword:00000000
"1405"=dword:00000000
"1406"=dword:00000000
"1407"=dword:00000001
"1408"=dword:00000000
"1409"=dword:00000000
"140A"=dword:00000000
"140C"=dword:00000000
"140D"=dword:00000000
"1601"=dword:00000000
"1604"=dword:00000000
"1605"=dword:00000000
"1606"=dword:00000000
"1607"=dword:00000003
"1608"=dword:00000000
"1609"=dword:00000000
"160A"=dword:00000000
"160B"=dword:00000000
"1802"=dword:00000000
"1803"=dword:00000000
"1804"=dword:00000001
"1809"=dword:00000000
"1812"=dword:00000000
"1A00"=dword:00020000
"1A02"=dword:00000000
"1A03"=dword:00000000
"1A04"=dword:00000003
"1A05"=dword:00000001
"1A06"=dword:00000000
"1A10"=dword:00000001
"1C00"=dword:00010000
"2000"=dword:00000000
"2005"=dword:00000000
"2007"=dword:00000003
"2100"=dword:00000000
"2101"=dword:00000000
"2102"=dword:00000003
"2103"=dword:00000000
"2104"=dword:00000000
"2105"=dword:00000000
"2106"=dword:00000000
"2107"=dword:00000000
"2108"=dword:00000003
"2200"=dword:00000003
"2201"=dword:00000000
"2300"=dword:00000001
"2301"=dword:00000000
"2302"=dword:00000003
"2400"=dword:00000000
"2401"=dword:00000000
"2402"=dword:00000000
"2600"=dword:00000000
"2700"=dword:00000003
"2701"=dword:00000000
"2702"=dword:00000000
"2703"=dword:00000000
"2704"=dword:00000000
"2708"=dword:00000003
"2709"=dword:00000003
"270B"=dword:00000000
"270C"=dword:00000003
"270D"=dword:00000000
"1806"=dword:00000000
"2500"=dword:00000003
"2707"=dword:00000000
"120B"=dword:00000000
"MinLevel"=dword:00010000

; 5. Zone 3: Internet
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3]
"2001"=dword:00000000
"2004"=dword:00000000
@=""
"DisplayName"="Internet"
"PMDisplayName"="Internet [Protected Mode]"
"Description"="This zone contains all Web sites you haven't placed in other zones"
"Icon"="inetcpl.cpl#001313"
"LowIcon"="inetcpl.cpl#005425"
"CurrentLevel"=dword:00000000
"Flags"=dword:00000001
"1200"=dword:00000000
"1400"=dword:00000000
"1001"=dword:00000001
"1004"=dword:00000003
"1201"=dword:00000003
"1206"=dword:00000003
"1207"=dword:00000003
"1208"=dword:00000000
"1209"=dword:00000003
"120A"=dword:00000003
"120C"=dword:00000003
"1402"=dword:00000000
"1405"=dword:00000000
"1406"=dword:00000000
"1407"=dword:00000001
"1408"=dword:00000003
"1409"=dword:00000000
"140A"=dword:00000000
"140C"=dword:00000003
"140D"=dword:00000000
"1601"=dword:00000000
"1604"=dword:00000000
"1605"=dword:00000000
"1606"=dword:00000000
"1607"=dword:00000003
"1608"=dword:00000000
"1609"=dword:00000001
"160A"=dword:00000003
"160B"=dword:00000000
"1802"=dword:00000000
"1803"=dword:00000000
"1804"=dword:00000001
"1809"=dword:00000000
"1812"=dword:00000001
"1A00"=dword:00020000
"1A02"=dword:00000000
"1A03"=dword:00000000
"1A04"=dword:00000003
"1A05"=dword:00000001
"1A06"=dword:00000000
"1A10"=dword:00000001
"1C00"=dword:00010000
"2000"=dword:00000000
"2005"=dword:00000003
"2007"=dword:00000003
"2100"=dword:00000000
"2101"=dword:00000000
"2102"=dword:00000003
"2103"=dword:00000003
"2104"=dword:00000003
"2105"=dword:00000003
"2106"=dword:00000000
"2107"=dword:00000003
"2200"=dword:00000003
"2201"=dword:00000003
"2300"=dword:00000001
"2301"=dword:00000000
"2302"=dword:00000003
"2400"=dword:00000003
"2401"=dword:00000000
"2402"=dword:00000003
"2600"=dword:00000000
"2700"=dword:00000000
"2701"=dword:00000000
"2702"=dword:00000000
"2703"=dword:00000003
"2704"=dword:00000000
"2708"=dword:00000003
"2709"=dword:00000003
"270B"=dword:00000003
"270C"=dword:00000000
"270D"=dword:00000003
"1806"=dword:00000001
"2500"=dword:00000000
"2707"=dword:00000000
"120B"=dword:00000003

; 6. Zone 4: Restricted Sites
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\4]
"2001"=dword:00000003
"2004"=dword:00000003
@=""
"DisplayName"="Restricted sites"
"PMDisplayName"="Restricted sites [Protected Mode]"
"Description"="This zone contains Web sites that could potentially damage your computer or data."
"Icon"="inetcpl.cpl#00004481"
"LowIcon"="inetcpl.cpl#005426"
"CurrentLevel"=dword:00012000
"Flags"=dword:00000003
"1200"=dword:00000003
"1400"=dword:00000003
"1C00"=dword:00000000
"1001"=dword:00000003
"1004"=dword:00000003
"1201"=dword:00000003
"1206"=dword:00000003
"1207"=dword:00000003
"1208"=dword:00000003
"1209"=dword:00000003
"120A"=dword:00000003
"120C"=dword:00000003
"1402"=dword:00000003
"1405"=dword:00000003
"1406"=dword:00000003
"1407"=dword:00000003
"1408"=dword:00000003
"1409"=dword:00000000
"140A"=dword:00000000
"140C"=dword:00000003
"140D"=dword:00000000
"1601"=dword:00000001
"1604"=dword:00000003
"1605"=dword:00000000
"1606"=dword:00000003
"1607"=dword:00000003
"1608"=dword:00000003
"1609"=dword:00000001
"160A"=dword:00000003
"160B"=dword:00000000
"1802"=dword:00000001
"1803"=dword:00000003
"1804"=dword:00000003
"1809"=dword:00000000
"180B"=dword:00000001
"1812"=dword:00000001
"1A00"=dword:00010000
"1A02"=dword:00000003
"1A03"=dword:00000003
"1A04"=dword:00000003
"1A05"=dword:00000003
"1A06"=dword:00000003
"1A10"=dword:00000003
"2000"=dword:00000003
"2005"=dword:00000003
"2007"=dword:00000003
"2100"=dword:00000003
"2101"=dword:00000003
"2102"=dword:00000003
"2103"=dword:00000003
"2104"=dword:00000003
"2105"=dword:00000003
"2106"=dword:00000003
"2107"=dword:00000003
"2200"=dword:00000003
"2201"=dword:00000003
"2300"=dword:00000003
"2301"=dword:00000000
"2302"=dword:00000003
"2400"=dword:00000003
"2401"=dword:00000003
"2402"=dword:00000003
"2600"=dword:00000003
"2700"=dword:00000000
"2701"=dword:00000003
"2702"=dword:00000000
"2703"=dword:00000003
"2704"=dword:00000003
"2708"=dword:00000003
"2709"=dword:00000003
"270B"=dword:00000003
"270C"=dword:00000000
"270D"=dword:00000003
"2500"=dword:00000000
"2707"=dword:00000000

; 7. Machine Level Mirroring for Enterprise Consistency
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2]
"CurrentLevel"=dword:00000000
"MinLevel"=dword:00010000
"Flags"=dword:00000047
"1200"=dword:00000000
"1400"=dword:00000000
"1001"=dword:00000000
"1004"=dword:00000000
"1201"=dword:00000000
"1803"=dword:00000000
"1806"=dword:00000000
"2200"=dword:00000003
"2201"=dword:00000000

; 8. Microsoft Edge IE Mode Enterprise Site List Policy
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Edge]
"InternetExplorerIntegrationLevel"=dword:00000001
"InternetExplorerIntegrationSiteList"="C:\\\\enterprise_compat\\\\sites.xml"
"InternetExplorerIntegrationReloadInIEModeAllowed"=dword:00000001

[HKEY_CURRENT_USER\\SOFTWARE\\Policies\\Microsoft\\Edge]
"InternetExplorerIntegrationLevel"=dword:00000001
"InternetExplorerIntegrationSiteList"="C:\\\\enterprise_compat\\\\sites.xml"
"InternetExplorerIntegrationReloadInIEModeAllowed"=dword:00000001
`;

  const copyRegToClipboard = () => {
    navigator.clipboard.writeText(regContent);
    setCopiedReg(true);
    setTimeout(() => setCopiedReg(false), 2000);
  };

  const downloadRegFile = () => {
    const blob = new Blob([regContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enterprise_compat_config_${Date.now()}.reg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const regKeyTable = [
    {
      hive: 'HKCU',
      path: '...\\Internet Settings\\ZoneMap\\Domains\\internal.domain.com',
      value: '*=0x00000002',
      purpose: 'Maps *.internal.domain.com to Trusted Sites (Zone 2)',
    },
    {
      hive: 'HKCU',
      path: '...\\Internet Settings\\Zones\\2\\1200',
      value: '1200=0x00000000',
      purpose: 'Allows ActiveX controls to execute without blocking',
    },
    {
      hive: 'HKCU',
      path: '...\\Internet Settings\\Zones\\2\\1201',
      value: '1201=0x00000000',
      purpose: 'Allows unsigned NIC DigiSigner ActiveX initialization',
    },
    {
      hive: 'HKLM',
      path: 'SOFTWARE\\Policies\\Microsoft\\Edge',
      value: 'InternetExplorerIntegrationLevel=1',
      purpose: 'Enables Microsoft Edge Internet Explorer Integration Mode',
    }
  ];

  const [copiedFix, setCopiedFix] = useState(false);
  const quickFixCmd = 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2" /v CurrentLevel /t REG_DWORD /d 0 /f && reg add "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2" /v CurrentLevel /t REG_DWORD /d 0 /f && reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2" /v Flags /t REG_DWORD /d 71 /f && reg add "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2" /v Flags /t REG_DWORD /d 71 /f && reg delete "HKLM\\Software\\Policies\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v Security_options /f 2>nul & reg delete "HKCU\\Software\\Policies\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v Security_options /f 2>nul';

  const copyQuickFix = () => {
    navigator.clipboard.writeText(quickFixCmd);
    setCopiedFix(true);
    setTimeout(() => setCopiedFix(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Quick Fix Alert for Missing Custom Level on other PCs */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>వేరే సిస్టమ్స్‌లో "Custom Level" కనిపించకపోతే 1-క్లిక్ పరిష్కారం (Quick Fix)</span>
            </div>
            <p className="text-xs text-amber-800">
              కొన్ని సిస్టమ్స్‌లో గ్రూప్ పాలసీ లేదా <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">CurrentLevel</code> వాల్యూ వల్ల కస్టమ్ లెవెల్ స్లైడర్ స్థానంలో "Low" గా లేదా దాచబడి ఉండవచ్చు. క్రింది కమాండ్‌ను అడ్మిన్ CMD లో రన్ చేస్తే వెంటనే <strong>Custom Level</strong> కనిపిస్తుంది:
            </p>
          </div>
          <button
            onClick={copyQuickFix}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer transition-all shadow-xs"
          >
            {copiedFix ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedFix ? 'Copied Command!' : 'Copy 1-Click Fix CMD'}</span>
          </button>
        </div>
        <div className="mt-3 bg-amber-950 text-amber-200 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre">
          {quickFixCmd}
        </div>
      </div>
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Windows Registry & Policy Engine</h2>
            <p className="text-xs text-slate-500">
              Automates registry writes for Internet Explorer security zones, ActiveX permissions, and Edge Group Policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="btn-import-reg-now"
            onClick={onImportRegistry}
            disabled={isImporting}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
            <span>{isImporting ? 'Importing Registry...' : 'Import Registry Settings'}</span>
          </button>

          <button
            id="btn-download-reg-file"
            onClick={downloadRegFile}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .REG Script</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Key Table, Right .REG Script Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Registry Key Matrix */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Configured Registry Keys & Policies</h3>

          <div className="space-y-3">
            {regKeyTable.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900 font-mono">{item.hive}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">
                    {item.value}
                  </span>
                </div>
                <div className="text-slate-700 font-mono text-[11px] truncate">{item.path}</div>
                <div className="text-slate-500 text-[11px] pt-1">{item.purpose}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Raw .REG Script Payload Preview */}
        <div className="bg-slate-950 text-emerald-400 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>evedhika_ubd_config.reg Payload</span>
              </div>

              <button
                id="btn-copy-reg-text"
                onClick={copyRegToClipboard}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedReg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReg ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>

            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-3 rounded-lg bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[350px]">
              {regContent}
            </pre>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Executable command: <code className="text-emerald-300">reg import evedhika_ubd_config.reg</code>
          </div>
        </div>
      </div>
    </div>
  );
};
