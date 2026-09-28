import React, { useState } from 'react';
import { 
  Globe, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  FileCode,
  RefreshCw
} from 'lucide-react';
import { DepartmentProfile } from '../types';

interface BrowserViewProps {
  selectedProfile: DepartmentProfile;
  onApplyEdgePolicy: () => void;
  isApplyingPolicy: boolean;
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  selectedProfile,
  onApplyEdgePolicy,
  isApplyingPolicy,
}) => {
  const [siteList, setSiteList] = useState<string[]>(selectedProfile.siteList);
  const [newUrl, setNewUrl] = useState('');
  const [copiedXml, setCopiedXml] = useState(false);

  const [selectedCompatMode, setSelectedCompatMode] = useState<'IE5' | 'IE8Enterprise' | 'IE11'>('IE5');
  const [injectedStatus, setInjectedStatus] = useState<string | null>(null);

  const handleAddDomain = () => {
    if (newUrl.trim() && !siteList.includes(newUrl.trim())) {
      setSiteList([...siteList, newUrl.trim()]);
      setNewUrl('');
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setSiteList(siteList.filter(s => s !== domain));
  };

  const siteListXml = `<site-list version="2">
  <!-- E-Vedhika Enterprise IE Mode Force Injector -->
  <!-- Enforces IE5 Quirks & Legacy ActiveX Support Regardless of Edge Version -->
${siteList.map(site => `  <site url="${site}">
    <compat-mode>${selectedCompatMode}</compat-mode>
    <open-in>IE11</open-in>
  </site>`).join('\n')}
</site-list>`;

  const copyXmlToClipboard = () => {
    navigator.clipboard.writeText(siteListXml);
    setCopiedXml(true);
    setTimeout(() => setCopiedXml(false), 2000);
  };

  const handleInjectIe5SiteList = () => {
    onApplyEdgePolicy();
    setInjectedStatus(`యుఆర్‌ఎల్ (ubd.telangana.gov.in) సక్సెస్‌ఫుల్‌గా IE5 Enterprise Mode సైట్ లిస్ట్‌లోకి ఇంజెక్ట్ అయ్యింది! Edge v90-v125+ లో IE5 Quirks Mode తోనే ఓపెన్ అవుతుంది.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Microsoft Edge IE Mode & Enterprise Site List Configuration</h2>
            <p className="text-xs text-slate-500">
              Microsoft Edge ఏ వెర్షన్ అయినా సరే, UBD (ubd.telangana.gov.in) పోర్టల్‌ను తప్పనిసరిగా IE5 Quirks Mode లో ఓపెన్ అయ్యేలా Enterprise Site List XML జెనరేట్ చేసి పాలసీలోకి ఇన్జెక్ట్ చేస్తుంది.
            </p>
          </div>
        </div>

        <button
          id="btn-apply-edge-policy"
          onClick={handleInjectIe5SiteList}
          disabled={isApplyingPolicy}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          {isApplyingPolicy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{isApplyingPolicy ? 'Pushing Policy...' : 'Force Inject IE5 Site List XML'}</span>
        </button>
      </div>

      {/* IE Mode Compatibility Configuration Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 border border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold tracking-wide text-emerald-300">
              IE Mode Configuration & Site List XML Injector
            </h3>
          </div>
          <div className="text-xs text-slate-300 font-mono bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
            Target Compat Mode: <span className="text-emerald-400 font-bold">&lt;compat-mode&gt;{selectedCompatMode}&lt;/compat-mode&gt;</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Mode Selector */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Select Document Compat Mode</label>
            <select
              value={selectedCompatMode}
              onChange={(e) => setSelectedCompatMode(e.target.value as 'IE5' | 'IE8Enterprise' | 'IE11')}
              className="w-full bg-slate-800 text-slate-100 font-semibold text-xs rounded-lg px-2.5 py-2 border border-slate-600 focus:outline-hidden focus:border-emerald-400"
            >
              <option value="IE5">IE5 (Quirks Mode) - UBD Portal Recommended</option>
              <option value="IE8Enterprise">IE8 Enterprise Mode</option>
              <option value="IE11">IE11 Strict Mode</option>
            </select>
            <p className="text-[10px] text-slate-400">
              Edge ఏ వర్షన్ అయినా సరే, UBD కోసం IE5 పాత డిజిటల్ సిగ్నేచర్ అండ్ ActiveX మోడ్ రన్ అవుతుంది.
            </p>
          </div>

          {/* XML File Path Info */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Target SiteList XML Location</div>
            <div className="font-mono text-emerald-300 font-bold truncate text-[11px]">
              C:\ProgramData\EVedhika\sites.xml
            </div>
            <p className="text-[10px] text-slate-400">
              Windows registry policy <code>InternetExplorerIntegrationSiteList</code> కి బైండ్ చేయబడుతుంది.
            </p>
          </div>

          {/* Action Inject Button */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 space-y-2 flex flex-col justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Registry & Group Policy Status</div>
            <button
              onClick={handleInjectIe5SiteList}
              disabled={isApplyingPolicy}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              {isApplyingPolicy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Generate & Force Inject XML</span>
            </button>
          </div>
        </div>

        {injectedStatus && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{injectedStatus}</span>
            </div>
            <button onClick={() => setInjectedStatus(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}
      </div>

      {/* Grid: Left Site List Domain Manager, Right XML Output Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Domain Site List Manager */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enterprise Mode Allowed Domains</h3>
            <p className="text-xs text-slate-500">
              Domains listed here will automatically reload in IE Mode with ActiveX & DSC support.
            </p>
          </div>

          {/* Add New Domain Input */}
          <div className="flex items-center gap-2">
            <input
              id="input-add-site-domain"
              type="text"
              placeholder="e.g. ubd.internal.domain.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
            />
            <button
              id="btn-add-domain"
              onClick={handleAddDomain}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Site List Domains */}
          <div className="space-y-2">
            {siteList.map((site, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-800">{site}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    {selectedProfile.compatibilityMode}
                  </span>
                </div>

                <button
                  id={`btn-remove-site-${idx}`}
                  onClick={() => handleRemoveDomain(site)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove Domain"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Generated XML Preview */}
        <div className="bg-slate-950 text-emerald-400 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300">
              <div className="flex items-center gap-2 font-bold text-xs">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Enterprise Site List XML (C:\EVedhika_UBD\sites.xml)</span>
              </div>

              <button
                id="btn-copy-sites-xml"
                onClick={copyXmlToClipboard}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedXml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedXml ? 'Copied XML' : 'Copy XML'}</span>
              </button>
            </div>

            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-3 rounded-lg bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar">
              {siteListXml}
            </pre>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Registry Policy Target: <code className="text-emerald-300">HKLM\SOFTWARE\Policies\Microsoft\Edge\InternetExplorerIntegrationSiteList</code>
          </div>
        </div>
      </div>
    </div>
  );
};
