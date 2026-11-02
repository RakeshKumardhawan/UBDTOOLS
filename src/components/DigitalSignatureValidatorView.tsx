import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Search,
  Key,
  KeyRound,
  FileCheck,
  Server,
  Lock,
  Cpu,
  Info,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useToast } from './Toast';

interface WhitelistedCert {
  id: string;
  thumbprint: string;
  issuer: string;
  subject: string;
  serialNumber: string;
  certType: string;
  validFrom: string;
  validTo: string;
  status: string;
  provider: string;
  isRootCa?: boolean;
}

interface DigiSignerStatus {
  serviceName: string;
  version: string;
  buildDate: string;
  status: string;
  listeningPorts: number[];
  webSocketBridge: string;
  pkcs11DriversDetected: string[];
  activeCertificatesCount: number;
  lastHealthCheck: string;
}

export const DigitalSignatureValidatorView: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [serviceStatus, setServiceStatus] = useState<DigiSignerStatus | null>(null);
  const [whitelist, setWhitelist] = useState<WhitelistedCert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Validation form state
  const [inputThumbprint, setInputThumbprint] = useState<string>('');
  const [inputSerial, setInputSerial] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{
    tested: boolean;
    isValid: boolean;
    message: string;
    cert?: WhitelistedCert;
  } | null>(null);

  // Add Cert Modal Form
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newThumbprint, setNewThumbprint] = useState<string>('');
  const [newIssuer, setNewIssuer] = useState<string>('CCA India Approved CA');
  const [newSubject, setNewSubject] = useState<string>('Panchayat Secretary Digital Signer');
  const [newSerial, setNewSerial] = useState<string>('');
  const [newCertType, setNewCertType] = useState<string>('Class 3 Digital Signature (DSC)');
  const [newProvider, setNewProvider] = useState<string>('eMudhra / ProxKey / VSign');

  const fetchDigiSignerData = async () => {
    setIsScanning(true);
    try {
      // 1. Fetch DigiSigner Service Status
      const statusRes = await fetch('/api/digisigner/status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.success) {
          setServiceStatus(statusData);
        }
      }

      // 2. Fetch Whitelist
      const whitelistRes = await fetch('/api/digisigner/whitelist');
      if (whitelistRes.ok) {
        const wlData = await whitelistRes.json();
        if (wlData.success) {
          setWhitelist(wlData.whitelist || []);
        }
      }
    } catch (err) {
      console.warn('DigiSigner API fetch warning:', err);
    } finally {
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchDigiSignerData();
  }, []);

  const handleValidateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputThumbprint.trim() && !inputSerial.trim()) {
      showError('దయచేసి Certificate Thumbprint లేదా Serial Number ఎంటర్ చేయండి.', 'వీక్షణ లోపం');
      return;
    }

    try {
      const res = await fetch('/api/digisigner/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thumbprint: inputThumbprint.trim(),
          serialNumber: inputSerial.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setValidationResult({
          tested: true,
          isValid: data.isValid,
          message: data.message,
          cert: data.cert
        });

        if (data.isValid) {
          showSuccess('డిజిటల్ సర్టిఫికెట్ వైట్‌లిస్ట్ చేయబడింది & ప్రామాణీకరించబడింది!', 'ప్రామాణికం (TRUSTED)');
        } else {
          showError('సర్టిఫికెట్ వైట్‌లిస్ట్‌లో లేదు. ఇది చెల్లని లేదా అపపరిచిత సర్టిఫికెట్.', 'అపపరిచితం (UNTRUSTED)');
        }
      }
    } catch (err: any) {
      showError('వైలిడేషన్ విఫలమైంది: ' + err.message, 'లోపం');
    }
  };

  const handleAddCertToWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThumbprint.trim()) {
      showError('దయచేసి Certificate Thumbprint ఎంటర్ చేయండి.', 'ఇన్‌పుట్ లోపం');
      return;
    }

    try {
      const res = await fetch('/api/digisigner/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thumbprint: newThumbprint.trim(),
          issuer: newIssuer.trim(),
          subject: newSubject.trim(),
          serialNumber: newSerial.trim(),
          certType: newCertType,
          provider: newProvider
        })
      });

      const data = await res.json();
      if (data.success) {
        showSuccess('కొత్త సర్టిఫికెట్ వైట్‌లిస్ట్‌కి విజయవంతంగా జోడించబడింది!', 'వైట్‌లిస్ట్ అప్‌డేట్');
        setNewThumbprint('');
        setNewSerial('');
        setShowAddModal(false);
        fetchDigiSignerData();
      }
    } catch (err: any) {
      showError('వైట్‌లిస్ట్ అప్‌డేట్ విఫలమైంది: ' + err.message, 'లోపం');
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8 text-white">
      {/* 1. Top Title & Live DigiSigner Status Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-2xl p-5 sm:p-6 border border-slate-800 text-white shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  డిజిటల్ సిగ్నేచర్ వాలిడేటర్ (Digital Signature & DigiSigner Validator)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                  {serviceStatus?.version || 'v2.0.4.1'} Active
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                NIC DigiSigner సర్వీస్ వెరిఫికేషన్ మరియు డిజిటల్ సర్టిఫికెట్ల వైట్‌లిస్ట్ ప్రామాణీకరణ సాధనం
              </p>
            </div>
          </div>

          <button
            onClick={fetchDigiSignerData}
            disabled={isScanning}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'పరిశీలిస్తోంది...' : 'DigiSigner రీస్కాన్'}</span>
          </button>
        </div>

        {/* Live Service Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[10px]">DigiSigner సర్వీస్ స్టేటస్:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{serviceStatus?.status || 'RUNNING'}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[10px]">WebSocket & Local Ports:</span>
            <span className="font-bold text-cyan-300">
              Ports: {serviceStatus?.listeningPorts ? serviceStatus.listeningPorts.join(', ') : '2626, 2627, 8080'}
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[10px]">PKCS#11 Token Drivers:</span>
            <span className="font-bold text-amber-300">ProxKey, HYP2003, eMudhra</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[10px]">వైట్‌లిస్ట్ సర్టిఫికెట్లు:</span>
            <span className="font-bold text-indigo-300">{whitelist.length} Trusted Certs</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Digital Certificate Validation Tool */}
      <div className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            సర్టిఫికెట్ వాలిడేటర్ సాధనం (Cert Validator & Whitelist Checker)
          </h3>
        </div>

        <form onSubmit={handleValidateCert} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-mono font-bold block">
                Certificate Thumbprint (SHA1/SHA256 Fingerprint):
              </label>
              <input
                type="text"
                value={inputThumbprint}
                onChange={e => setInputThumbprint(e.target.value)}
                placeholder="e.g. 4A8B9C1D2E3F405162738495A6B7C8D9E0F1A2B3"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-mono font-bold block">
                Certificate Serial Number (లేదా USB Token ID):
              </label>
              <input
                type="text"
                value={inputSerial}
                onChange={e => setInputSerial(e.target.value)}
                placeholder="e.g. 53A0F29D112C48"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500 placeholder-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 font-mono">
              నోట్: యుబిడి పోర్టల్‌లో సంతకం చేయడానికి CCA ఇండియా ఆమోదించిన సర్టిఫికెట్‌లు మాత్రమే వైట్‌లిస్ట్‌లో ఉంటాయి.
            </span>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Key className="w-4 h-4" />
              <span>సర్టిఫికెట్ వ్యాలిడేట్ చేయండి</span>
            </button>
          </div>
        </form>

        {/* Validation Output Box */}
        {validationResult?.tested && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono space-y-2 animate-fadeIn ${
              validationResult.isValid
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span>{validationResult.message}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-current">
                {validationResult.isValid ? 'TRUSTED / WHITELISTED' : 'UNTRUSTED / UNKNOWN'}
              </span>
            </div>

            {validationResult.cert && (
              <div className="pt-2 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>Issuer: <strong className="text-white">{validationResult.cert.issuer}</strong></div>
                <div>Subject: <strong className="text-white">{validationResult.cert.subject}</strong></div>
                <div>Provider: <strong className="text-cyan-300">{validationResult.cert.provider}</strong></div>
                <div>Valid Period: <strong className="text-emerald-300">{validationResult.cert.validFrom} to {validationResult.cert.validTo}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Local Certificate Whitelist Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              ఆమోదించబడిన వైట్‌లిస్ట్ సర్టిఫికెట్లు (Trusted Certificate Whitelist)
            </h3>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all border border-indigo-500 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>కొత్త సర్టిఫికెట్ వైట్‌లిస్ట్ చేయండి</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">స్టేటస్</th>
                <th className="py-3 px-4">Thumbprint (SHA1/SHA256)</th>
                <th className="py-3 px-4">Issuer / Subject</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">ప్రావైడర్</th>
                <th className="py-3 px-4">చెల్లుబాటు గడువు</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {whitelist.map(cert => (
                <tr key={cert.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{cert.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-cyan-300 font-mono truncate max-w-[180px]" title={cert.thumbprint}>
                      {cert.thumbprint}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-white font-bold">{cert.subject}</div>
                    <div className="text-[10px] text-slate-400">{cert.issuer}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-amber-300 font-bold">
                    {cert.serialNumber}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                    {cert.provider}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                    {cert.validFrom} ➔ {cert.validTo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay for Adding Custom Cert */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>కొత్త డిజిటల్ సర్టిఫికెట్‌ను వైట్‌లిస్ట్ చేయండి</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCertToWhitelist} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Certificate Thumbprint (SHA1/SHA256):</label>
                <input
                  type="text"
                  required
                  value={newThumbprint}
                  onChange={e => setNewThumbprint(e.target.value)}
                  placeholder="e.g. 4A8B9C1D2E3F405162738495A6B7C8D9E0F1A2B3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Serial Number / USB Token ID:</label>
                <input
                  type="text"
                  value={newSerial}
                  onChange={e => setNewSerial(e.target.value)}
                  placeholder="e.g. SN-884210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Issuer Authority:</label>
                <input
                  type="text"
                  value={newIssuer}
                  onChange={e => setNewIssuer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Provider / Token Model:</label>
                <input
                  type="text"
                  value={newProvider}
                  onChange={e => setNewProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  రద్దు చేయి
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  వైట్‌లిస్ట్ చేయి
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
