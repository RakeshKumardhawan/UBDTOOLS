import React, { useState } from 'react';
import { 
  Key, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Calendar, 
  User, 
  Award,
  RefreshCw,
  Send,
  ShieldAlert
} from 'lucide-react';
import { useToast } from './Toast';

export interface OfficerCertRecord {
  id: string;
  officerName: string;
  designation: string;
  officeLocation: string;
  certSerialNumber: string;
  validToDate: string; // YYYY-MM-DD
  tokenType: string;
  registeredPhone?: string;
}

export const DscExpiryMonitorCard: React.FC = () => {
  const { showSuccess, showInfo, showError } = useToast();

  const [officerCerts, setOfficerCerts] = useState<OfficerCertRecord[]>([
    {
      id: 'CERT-001',
      officerName: 'Rakesh Kumar Dhawan',
      designation: 'Panchayat Secretary / MPDO',
      officeLocation: 'Grama Panchayat, Mancherial (MNCL)',
      certSerialNumber: '5A1B8C9D3E0F7182',
      validToDate: '2026-11-25', // ~26 days from current date (Expiring Soon!)
      tokenType: 'WD ProxKey v3.0 (WatchData)',
      registeredPhone: '9985402310'
    },
    {
      id: 'CERT-002',
      officerName: 'G. Suresh Goud',
      designation: 'Grama Panchayat Secretary',
      officeLocation: 'Grama Panchayat, Suryapet (SRPT)',
      certSerialNumber: '7F8E9D0C1B2A3456',
      validToDate: '2027-08-15',
      tokenType: 'HYP2003 Token Middleware',
      registeredPhone: '9848022334'
    },
    {
      id: 'CERT-003',
      officerName: 'K. Venkateswarlu',
      designation: 'District Panchayat Officer (DPO)',
      officeLocation: 'District Office, Khammam (KMM)',
      certSerialNumber: '1A2B3C4D5E6F7890',
      validToDate: '2026-10-15', // Already Expired
      tokenType: 'ePass2003 Auto Token',
      registeredPhone: '9440123456'
    }
  ]);

  // Form for adding custom certificate to monitor
  const [newName, setNewName] = useState('');
  const [newDesignation, setNewDesignation] = useState('Panchayat Secretary');
  const [newOffice, setNewOffice] = useState('Grama Panchayat Office');
  const [newExpiryDate, setNewExpiryDate] = useState('2026-11-30');
  const [newTokenType, setNewTokenType] = useState('WD ProxKey v3.0');
  const [isAdding, setIsAdding] = useState(false);

  const calculateDaysRemaining = (validToStr: string): number => {
    try {
      const today = new Date();
      const expiry = new Date(validToStr);
      const diffMs = expiry.getTime() - today.getTime();
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newExpiryDate) {
      showError('Please enter Officer Name and Expiry Date.', 'Input Required');
      return;
    }

    const newRecord: OfficerCertRecord = {
      id: `CERT-${Date.now()}`,
      officerName: newName.trim(),
      designation: newDesignation,
      officeLocation: newOffice.trim() || 'Grama Panchayat',
      certSerialNumber: Math.random().toString(16).substring(2, 10).toUpperCase(),
      validToDate: newExpiryDate,
      tokenType: newTokenType
    };

    setOfficerCerts(prev => [newRecord, ...prev]);
    setNewName('');
    setIsAdding(false);
    showSuccess(`Registered DSC Token expiry monitor for ${newRecord.officerName}`, 'Cert Registered');
  };

  const sendExpiryTelegramAlert = async (cert: OfficerCertRecord, daysLeft: number) => {
    try {
      const payload = {
        chatId: '431228008',
        message: `⚠️ *DSC TOKEN EXPIRY WARNING (గడువు ముగింపు హెచ్చరిక)*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Officer:* ${cert.officerName} (${cert.designation})
🏢 *Office:* ${cert.officeLocation}
🔑 *Token Type:* ${cert.tokenType}
📅 *Valid Until:* ${cert.validToDate}
⌛ *Status:* ${daysLeft <= 0 ? '❌ EXPIRED' : `⚠️ EXPIRING IN ${daysLeft} DAYS`}

*Action Required:* Please renew your Digital Signature Certificate (Class 3) before it blocks UBD Portal billing & vouchers.`
      };

      const res = await fetch('/api/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showSuccess(`Expiry alert dispatched to Telegram for ${cert.officerName}!`, 'Alert Dispatched');
      } else {
        showError('Failed to dispatch alert to Telegram.', 'Alert Error');
      }
    } catch (e: any) {
      showError('Network error dispatching alert: ' + e.message, 'Network Error');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                DSC TOKEN CERTIFICATE EXPIRY MONITOR (30-DAY ADVANCE WARNING)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                Feature #2 (30-Day Prior Alerts)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              గ్రామ పంచాయతీ సెక్రటరీలు మరియు అధికారుల DSC డిజిటల్ సంతకం వ్యాలిడిటీని పర్యవేక్షించి, <strong className="text-slate-800">గడువు ముగియడానికి 30 రోజుల ముందే</strong> ఆటోమేటిక్ హెచ్చరికలు పంపుతుంది.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(prev => !prev)}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Calendar className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : '+ Add Officer Token'}</span>
        </button>
      </div>

      {/* Add New Token Form */}
      {isAdding && (
        <form onSubmit={handleAddCert} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3 text-xs animate-in fade-in">
          <div className="font-bold text-amber-900 flex items-center gap-1.5 border-b border-amber-200 pb-2">
            <Key className="w-4 h-4 text-amber-700" /> Register Officer DSC Certificate for Expiry Alerts
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Officer Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Secretary Name"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Designation</label>
              <select
                value={newDesignation}
                onChange={e => setNewDesignation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500"
              >
                <option value="Panchayat Secretary">Panchayat Secretary</option>
                <option value="Mandal Parishad Development Officer (MPDO)">MPDO</option>
                <option value="District Panchayat Officer (DPO)">DPO</option>
                <option value="Sarpanch / Administrator">Sarpanch / Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Office / GP Location</label>
              <input
                type="text"
                value={newOffice}
                onChange={e => setNewOffice(e.target.value)}
                placeholder="e.g. GP Nalgonda"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Certificate Expiry Date</label>
              <input
                type="date"
                value={newExpiryDate}
                onChange={e => setNewExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-black text-white font-bold transition cursor-pointer"
            >
              Save Expiry Monitor
            </button>
          </div>
        </form>
      )}

      {/* Monitored Certificates List */}
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
        <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Officer & Certificate Details</span>
          <div className="flex items-center gap-12 pr-2">
            <span className="hidden md:inline">Valid Until</span>
            <span>Validity Status & Alert</span>
          </div>
        </div>

        {officerCerts.map((cert) => {
          const daysLeft = calculateDaysRemaining(cert.validToDate);
          const isExpired = daysLeft <= 0;
          const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;

          return (
            <div key={cert.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                    {cert.designation}
                  </span>
                  <span className="font-bold text-slate-900">{cert.officerName}</span>
                </div>
                <p className="text-slate-500 text-[11px] flex items-center gap-1">
                  <span>🏢 {cert.officeLocation}</span> | <span>🔑 {cert.tokenType}</span> | <span className="font-mono">SN: {cert.certSerialNumber}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                <div className="text-right hidden md:block">
                  <div className="font-mono font-bold text-slate-800">{cert.validToDate}</div>
                  <div className="text-[10px] text-slate-400">Class 3 DSC Certificate</div>
                </div>

                <div className="flex items-center gap-2">
                  {isExpired ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold border border-rose-300">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> EXPIRED (0 Days)
                    </span>
                  ) : isExpiringSoon ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold border border-amber-300 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> EXPIRING IN {daysLeft} DAYS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> VALID ({daysLeft} Days)
                    </span>
                  )}

                  {(isExpiringSoon || isExpired) && (
                    <button
                      onClick={() => sendExpiryTelegramAlert(cert, daysLeft)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="Send Expiry Warning Alert via Telegram"
                    >
                      <Send className="w-3.5 h-3.5 text-indigo-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
