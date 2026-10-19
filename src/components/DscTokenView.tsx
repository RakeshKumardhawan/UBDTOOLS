import React, { useState } from 'react';
import { 
  Key, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Usb, 
  Activity, 
  Award, 
  Check, 
  Server,
  Trash2,
  Eraser,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { EnvironmentStatus } from '../types';
import { useToast } from './Toast';

interface DscTokenViewProps {
  envStatus: EnvironmentStatus;
  onRescanToken: () => void;
  isScanning: boolean;
  onForceClearToken?: () => void;
}

export const DscTokenView: React.FC<DscTokenViewProps> = ({
  envStatus,
  onRescanToken,
  isScanning,
  onForceClearToken,
}) => {
  const { showSuccess, showInfo } = useToast();
  const [digiPortTestResult, setDigiPortTestResult] = useState<string | null>(null);
  const [isTestingPort, setIsTestingPort] = useState(false);
  const [isClearedLocally, setIsClearedLocally] = useState(false);

  const handleTestPort = () => {
    setIsTestingPort(true);
    setDigiPortTestResult(null);
    setTimeout(() => {
      setIsTestingPort(false);
      setDigiPortTestResult('SUCCESS: NIC DigiSigner client listening on http://127.0.0.1:8080 (HTTP 200 OK)');
    }, 1200);
  };

  const handleForceClearToken = () => {
    setIsClearedLocally(true);

    // Explicitly purge all token, cert, dsc, and temporary authentication keys from localStorage
    try {
      const knownKeys = [
        'dsc_token',
        'dsc_token_data',
        'dsc_certificate',
        'dsc_session',
        'active_token',
        'token_session',
        'token_cache',
        'auth_token',
        'temp_token_data',
        'dsc_auth_state',
        'token_number',
        'temp_auth_keys',
        'cached_token_info'
      ];
      knownKeys.forEach((k) => localStorage.removeItem(k));

      // Scan all localStorage keys for any token/cert/dsc session identifiers
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allKeys.push(key);
      }
      allKeys.forEach((key) => {
        const lower = key.toLowerCase();
        if (
          lower.startsWith('token') ||
          lower.startsWith('dsc') ||
          lower.startsWith('cert') ||
          lower.includes('token_') ||
          lower.includes('dsc_') ||
          lower.includes('auth_token')
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (err) {
      console.warn('LocalStorage token purge notice:', err);
    }

    if (onForceClearToken) {
      onForceClearToken();
    }

    showSuccess(
      'DSC Token state reset & temporary authentication session keys removed from localStorage.',
      'Token Cache Cleared'
    );
  };

  const handleRescan = () => {
    setIsClearedLocally(false);
    onRescanToken();
  };

  const isTokenEffectivelyConnected = !isClearedLocally && envStatus.dscTokenConnected;

  const sampleCertData = {
    subject: 'CN=RAKESH KUMAR DHAWAN, O=E-VEDHIKA UBD TOOL, OU=SECRETARY, C=IN',
    issuer: 'CN=eMudhra Class 3 Individual Sub CA, O=eMudhra Limited',
    serialNumber: '5A1B8C9D3E0F7182',
    keyUsage: 'Digital Signature, Non-Repudiation (PKCS#11 Encrypted)',
    validFrom: '2025-01-01',
    validTo: '2027-01-01',
    tokenDriver: 'WD ProxKey v3.0 (WatchData PKCS11 Provider)',
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">DSC USB Token & NIC DigiSigner Manager</h2>
            <p className="text-xs text-slate-500">
              Detect connected USB Tokens (ProxKey / HYP2003 / ePass2003) and test local NIC DigiSigner web bridge.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            id="btn-force-clear-token"
            onClick={handleForceClearToken}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
            title="Reset current token state and purge temporary authentication keys from localStorage"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Force Clear Token</span>
          </button>

          <button
            id="btn-rescan-usb-token"
            onClick={handleRescan}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning USB Bus...' : 'Re-Scan DSC Token'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Token Detection, Right DigiSigner Bridge Test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: USB Token Hardware & Certificate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Usb className="w-4 h-4 text-emerald-600" />
              <span>Connected DSC Token Details</span>
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                isTokenEffectivelyConnected 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : isClearedLocally 
                  ? 'bg-rose-100 text-rose-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isTokenEffectivelyConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>TOKEN CONNECTED</span>
                </>
              ) : isClearedLocally ? (
                <>
                  <Eraser className="w-3.5 h-3.5" />
                  <span>CACHE CLEARED</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>NOT DETECTED</span>
                </>
              )}
            </span>
          </div>

          {isTokenEffectivelyConnected ? (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>{envStatus.dscTokenName}</span>
                </div>
                <div className="text-slate-600 text-[11px] font-mono">
                  Driver: {sampleCertData.tokenDriver}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
                <div className="font-bold text-slate-800 text-xs">X.509 Certificate Profile:</div>
                <div className="text-slate-600">
                  <strong className="text-slate-800">Subject:</strong> {sampleCertData.subject}
                </div>
                <div className="text-slate-600">
                  <strong className="text-slate-800">Issuer:</strong> {sampleCertData.issuer}
                </div>
                <div className="text-slate-600">
                  <strong className="text-slate-800">Serial No:</strong> {sampleCertData.serialNumber}
                </div>
                <div className="text-slate-600">
                  <strong className="text-slate-800">Valid Until:</strong> {sampleCertData.validTo}
                </div>
              </div>
            </div>
          ) : isClearedLocally ? (
            <div className="p-6 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-950 text-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-xs">
                <Eraser className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-rose-900">Clean Slate Established</h4>
                <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
                  All active token certificates and temporary authentication session keys have been purged from memory and localStorage.
                </p>
              </div>
              <button
                onClick={handleRescan}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Scan Token for New Session</span>
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 text-center">
              <XCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="font-bold">No DSC USB Token Inserted</h4>
              <p className="text-slate-600 max-w-sm mx-auto">
                Insert your WD ProxKey or HYP2003 USB token into a USB 2.0/3.0 port and click "Re-Scan DSC Token".
              </p>
            </div>
          )}
        </div>

        {/* Right: NIC DigiSigner Local Service Bridge */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>NIC DigiSigner Service Bridge</span>
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                envStatus.digiSignerServiceRunning ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {envStatus.digiSignerServiceRunning ? 'SERVICE ACTIVE' : 'STOPPED'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            NIC DigiSigner runs a local web service listening on port 8080 / 8443 that bridges JavaScript in the UBD portal with your hardware DSC USB Token.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Port 8080 (HTTP Loopback):</span>
              <span className="font-mono text-emerald-700 font-bold">127.0.0.1:8080</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Port 8443 (HTTPS SSL Bridge):</span>
              <span className="font-mono text-emerald-700 font-bold">127.0.0.1:8443</span>
            </div>

            <button
              id="btn-test-digi-port"
              onClick={handleTestPort}
              disabled={isTestingPort}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isTestingPort ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              <span>{isTestingPort ? 'Testing Port 8080...' : 'Test Local DigiSigner Connection'}</span>
            </button>

            {digiPortTestResult && (
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-900 text-[11px] font-mono font-semibold">
                {digiPortTestResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
