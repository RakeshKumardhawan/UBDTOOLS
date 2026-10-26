import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Server, 
  Clock, 
  FileSpreadsheet,
  Github
} from 'lucide-react';

export function GithubDashboardView() {
  const [markdownContent, setMarkdownContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/github_dashboard.md')
      .then(res => res.text())
      .then(text => {
        setMarkdownContent(text);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GITHUB_DASHBOARD.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-sky-900 rounded-2xl p-8 text-white shadow-lg border border-blue-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repository Dashboard & README Template</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              🏛️ GitHub Dashboard & Live Telemetry Layout
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              మీ వెబ్‌సైట్ మరియు గిటాబ్ రిపోజిటరీ (<a href="https://github.com/Rakeshkumardhawan/UBDTOOLS" target="_blank" rel="noreferrer" className="text-sky-400 underline">Rakeshkumardhawan/UBDTOOLS</a>) లో నేరుగా అప్‌డేట్ చేసుకోవడానికి ప్రత్యేకంగా డిజైన్ చేయబడిన ప్రొఫెషనల్ మార్క్‌డౌన్ డాష్‌బోర్డ్.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handleDownloadMd}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download .md File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Daily Excel Report Endpoint</span>
          </div>
          <p className="text-xs text-slate-500">
            రోలింగ్ 24 గంటల ఆడిట్ ఎక్సెల్ ఫైల్ డైరెక్ట్ డౌన్‌లోడ్ లింక్.
          </p>
          <a 
            href="/api/reports/download-excel" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-1"
          >
            <span>/api/reports/download-excel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            <span>Monthly Master Report Endpoint</span>
          </div>
          <p className="text-xs text-slate-500">
            నెలవారీ క్యుములేటివ్ మాస్టర్ ఎక్సెల్ రిపోర్ట్ లింక్ (30th/31st).
          </p>
          <a 
            href="/api/reports/monthly-excel" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 pt-1"
          >
            <span>/api/reports/monthly-excel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Server className="w-4 h-4 text-sky-600" />
            <span>Central Live Gateway</span>
          </div>
          <p className="text-xs text-slate-500">
            అన్ని పంచాయతీ PC ల టెలిమెట్రీ అప్‌డేట్ అయ్యే గ్లోబల్ ఎండ్‌పాయింట్.
          </p>
          <a 
            href="https://www.e-vedhika.in" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 pt-1"
          >
            <span>www.e-vedhika.in</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Markdown Preview Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">GITHUB_DASHBOARD.md Preview</span>
          </div>
          <div className="text-xs text-slate-500">
            Ready to paste in GitHub README.md or website
          </div>
        </div>
        <div className="p-6 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed">
          {isLoading ? (
            <div className="text-slate-400 py-12 text-center">Loading dashboard markdown...</div>
          ) : (
            <pre className="whitespace-pre-wrap">{markdownContent}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
