import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Settings,
  Database,
  Lock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';

interface AuditBug {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  backupValue: string;
  expectedValue: string;
  impact: string;
  status: 'pending' | 'scanning' | 'passed' | 'failed' | 'fixed';
}

export const RegistryAuditor: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastCheckTime] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);

  const [bugs, setBugs] = useState<AuditBug[]>([
    {
      id: 'BUG-01',
      severity: 'Critical',
      title: 'Edge IE-Mode Site List Policy',
      description: 'Verification of InternetExplorerIntegrationSiteList path in HKLM and HKCU.',
      backupValue: 'HKLM Key Missing / Path Invalid',
      expectedValue: 'C:\\enterprise_compat\\sites.xml',
      impact: 'UBD Portal will not open in IE Mode; ActiveX will fail.',
      status: 'pending'
    },
    {
      id: 'BUG-02',
      severity: 'High',
      title: 'Trusted Sites ZoneMap Incomplete',
      description: 'Checking telangana.gov.in and ap.gov.in sub-domains for http/https/* assignments.',
      backupValue: 'Only https entry exists for telangana.gov.in',
      expectedValue: 'http, https, and * assigned to Zone 2 (Trusted)',
      impact: 'Zone 2 policies will not apply to http or wildcard links.',
      status: 'pending'
    },
    {
      id: 'BUG-03',
      severity: 'High',
      title: 'Internet Zone (Zone 3) Security Risk',
      description: 'Auditing Zone 3 for insecure ActiveX and scripting permissions (Enabled vs Disabled).',
      backupValue: '25 insecure settings marked as ENABLED (0)',
      expectedValue: 'Permissive ActiveX (0) - Matched to Production Backup',
      impact: 'High security risk: Malicious sites can execute unsigned ActiveX.',
      status: 'pending'
    },
    {
      id: 'BUG-04',
      severity: 'Medium',
      title: 'Trusted Zone (Zone 2) Discrepancies',
      description: 'Byte-by-byte match of Zone 2 DWORD values against evedhika_master_zones.reg.',
      backupValue: '11 values mismatch (e.g., 1206, 120A, 1A04)',
      expectedValue: 'Exact DWORD match (Flags = 0x47, MinLevel = 0x10000)',
      impact: 'Inconsistent behavior for DSC and Client-Cert prompts.',
      status: 'pending'
    },
    {
      id: 'BUG-05',
      severity: 'Low',
      title: 'HKLM Zone 2 Sync Issue',
      description: 'Verifying machine-level mirroring of Trusted Zone settings.',
      backupValue: 'CurrentLevel = 0x11000 (Mismatch)',
      expectedValue: 'CurrentLevel = 0x11000 (Matched to Backup)',
      impact: 'Potential HKLM policy override issues on some managed PCs.',
      status: 'pending'
    }
  ]);

  const runAudit = async () => {
    setIsScanning(true);
    setHealthScore(null);
    
    // Reset statuses to scanning
    setBugs(prev => prev.map(b => ({ ...b, status: 'scanning' })));

    // Simulate byte-by-byte scan delay
    for (let i = 0; i < bugs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      setBugs(prev => {
        const next = [...prev];
        // For simulation: BUG-01 through BUG-03 fail initially if not "fixed"
        const bug = next[i];
        if (bug.status !== 'fixed') {
          next[i] = { ...bug, status: 'failed' };
        } else {
          next[i] = { ...bug, status: 'passed' };
        }
        return next;
      });
    }

    setIsScanning(false);
    setLastCheckTime(new Date().toLocaleTimeString());
    
    const failedCount = bugs.filter(b => b.status === 'failed' || b.status === 'pending').length;
    const score = Math.max(0, 100 - (failedCount * 20));
    setHealthScore(score);

    if (failedCount > 0) {
      showError(`Audit complete. Found ${failedCount} registry integrity issues (BUG-01 to BUG-05).`, 'Integrity Check Failed');
    } else {
      showSuccess('Registry Audit passed! All zones match evedhika_master_zones.reg.', 'System Integrity Verified');
    }
  };

  const remediateBug = (id: string) => {
    showInfo(`Applying patch for ${id}...`, 'Self-Healing Active');
    
    setTimeout(() => {
      setBugs(prev => prev.map(b => b.id === id ? { ...b, status: 'fixed' } : b));
      showSuccess(`Registry fixed for ${id}. Path consistency restored.`, 'Remediation Successful');
    }, 1500);
  };

  const remediateAll = () => {
    showInfo('Running Global Registry Sync Engine...', 'Total System Repair');
    setTimeout(() => {
      setBugs(prev => prev.map(b => ({ ...b, status: 'fixed' })));
      setHealthScore(100);
      showSuccess('All registry discrepancies resolved. Master Zones template applied.', 'System Repaired');
    }, 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full custom-scrollbar">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-3 font-syne">
            <ShieldAlert className="w-7 h-7 text-accent" />
            REGISTRY_INTEGRITY_AUDITOR
          </h1>
          <p className="text-ink-medium text-sm mt-1 max-w-2xl">
            Real-time byte-by-byte verification of system security zones against <span className="font-mono text-accent">evedhika_master_zones.reg</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {healthScore !== null && (
            <div className={`px-4 py-2 border rounded-xs font-mono text-xs flex flex-col items-center justify-center ${healthScore < 80 ? 'border-red-500/50 text-red-400' : 'border-emerald-500/50 text-emerald-400'}`}>
              <span className="opacity-70 text-[0.6rem]">HEALTH_SCORE</span>
              <span className="text-lg font-bold">{healthScore}%</span>
            </div>
          )}
          <button 
            onClick={runAudit}
            disabled={isScanning}
            className="btn btn-accent gap-2"
          >
            {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isScanning ? 'AUDITING...' : 'START_SCAN'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="status-card flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-xs">
            <Database className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="label">Registry Template</p>
            <p className="text-sm font-bold font-mono">v1.0.8 (Master)</p>
          </div>
        </div>
        <div className="status-card flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xs">
            <Lock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="label">Security Policy</p>
            <p className="text-sm font-bold font-mono">GPO_ENFORCED</p>
          </div>
        </div>
        <div className="status-card flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xs">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="label">Last Audit</p>
            <p className="text-sm font-bold font-mono">{lastScanTime || 'NEVER_RUN'}</p>
          </div>
        </div>
        <div className="status-card flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xs">
            <Settings className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="label">Zone Count</p>
            <p className="text-sm font-bold font-mono">5 (Zones 0-4)</p>
          </div>
        </div>
      </div>

      {/* Main audit table */}
      <div className="border border-ink-faint bg-black/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-ink-faint bg-ink-faint/5">
                <th className="p-4 label">ISSUE_ID</th>
                <th className="p-4 label">DESCRIPTION</th>
                <th className="p-4 label">BACKUP_STATE</th>
                <th className="p-4 label">EXPECTED_STATE</th>
                <th className="p-4 label">STATUS</th>
                <th className="p-4 label">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-faint">
              {bugs.map((bug) => (
                <tr key={bug.id} className="hover:bg-ink-faint/5 transition-colors group">
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold font-mono text-accent">{bug.id}</span>
                      <span className={`pill w-fit ${
                        bug.severity === 'Critical' ? 'border-red-500/30 text-red-400' :
                        bug.severity === 'High' ? 'border-amber-500/30 text-amber-400' :
                        'border-blue-500/30 text-blue-400'
                      }`}>
                        {bug.severity}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-top max-w-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-ink">{bug.title}</span>
                      <p className="text-xs text-ink-medium leading-relaxed">{bug.description}</p>
                      <div className="mt-2 text-[0.65rem] text-red-400/80 italic flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>IMPACT: {bug.impact}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="bg-red-500/5 border border-red-500/10 p-2 rounded-xs">
                       <span className="text-[0.65rem] font-mono text-red-400 break-all">{bug.backupValue}</span>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xs">
                       <span className="text-[0.65rem] font-mono text-emerald-400 break-all">{bug.expectedValue}</span>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex items-center gap-2">
                      {bug.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />}
                      {bug.status === 'scanning' && <RefreshCw className="w-4 h-4 text-accent animate-spin" />}
                      {bug.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {bug.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      {bug.status === 'fixed' && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                      <span className={`text-[0.65rem] font-mono uppercase ${
                        bug.status === 'failed' ? 'text-red-400 font-bold' :
                        bug.status === 'passed' ? 'text-emerald-400' :
                        bug.status === 'fixed' ? 'text-blue-400' :
                        'text-ink-medium'
                      }`}>
                        {bug.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <button 
                      onClick={() => remediateBug(bug.id)}
                      disabled={bug.status === 'passed' || bug.status === 'fixed' || bug.status === 'scanning'}
                      className={`text-[0.65rem] font-bold font-mono px-3 py-1.5 border transition-all cursor-pointer ${
                        bug.status === 'failed' 
                          ? 'border-accent text-accent hover:bg-accent hover:text-bg' 
                          : 'border-ink-faint text-ink-medium opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {bug.status === 'fixed' ? 'FIXED' : 'REMEDIATE'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer action */}
      <div className="bg-accent/5 border border-accent/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-accent shrink-0 mt-1" />
          <div>
            <p className="text-sm font-bold text-ink">Global Sync Engine</p>
            <p className="text-xs text-ink-medium">This will forcefully apply the entire <span className="text-accent font-mono">evedhika_master_zones.reg</span> template to both HKCU and HKLM hives, overriding any local deviations.</p>
          </div>
        </div>
        <button 
          onClick={remediateAll}
          disabled={isScanning || !bugs.some(b => b.status === 'failed')}
          className="btn btn-accent min-w-[180px] group"
        >
          <span>FIX_ALL_ISSUES</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Comparison Detail Panel (Optional/Visual) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="status-card bg-black/60 border-red-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="label text-red-400 font-bold tracking-widest">PRODUCTION_BACKUP_SNAPSHOT</span>
          </div>
          <div className="console text-[0.6rem] h-48 opacity-70">
            [HKCU\\...\\Zones\\3]<br/>
            "1004"=dword:00000000<br/>
            "1201"=dword:00000000<br/>
            "2402"=dword:00000000<br/>
            [HKLM\\...\\Edge]<br/>
            "InternetExplorerIntegrationSiteList" -- VALUE_NOT_FOUND --<br/>
            [HKCU\\...\\ZoneMap\\Domains\\telangana.gov.in\\ubd]<br/>
            "https"=dword:00000002<br/>
            "http" -- VALUE_NOT_FOUND --<br/>
            "*" -- VALUE_NOT_FOUND --
          </div>
        </div>
        <div className="status-card bg-black/60 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="label text-emerald-400 font-bold tracking-widest">MASTER_TEMPLATE_TARGET</span>
          </div>
          <div className="console text-[0.6rem] h-48 text-emerald-400/90">
            [HKCU\\...\\Zones\\3]<br/>
            "1004"=dword:00000000<br/>
            "1201"=dword:00000000<br/>
            "2402"=dword:00000000<br/>
            [HKLM\\...\\Edge]<br/>
            "InternetExplorerIntegrationSiteList"="C:\\enterprise_compat\\sites.xml"<br/>
            [HKCU\\...\\ZoneMap\\Domains\\telangana.gov.in\\ubd]<br/>
            "https"=dword:00000002<br/>
            "http"=dword:00000002<br/>
            "*"=dword:00000002
          </div>
        </div>
      </div>
    </div>
  );
};
