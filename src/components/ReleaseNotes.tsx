import React, { useState, useEffect } from 'react';
import { 
  History, 
  Github, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Tag,
  Code
} from 'lucide-react';

interface ReleaseNotesData {
  latestVersion: string;
  releaseDate: string;
  releaseNotes: string;
  githubRepo: string;
  downloadUrl: string;
}

export const ReleaseNotes: React.FC = () => {
  const [data, setData] = useState<ReleaseNotesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReleaseNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try the local API which might have synced with GitHub
      const response = await fetch('/api/version');
      if (!response.ok) throw new Error('Failed to fetch version metadata');
      
      const result = await response.json();
      if (result.success) {
        setData({
          latestVersion: result.latestVersion || 'v1.0.0',
          releaseDate: result.releaseDate || new Date().toLocaleDateString(),
          releaseNotes: result.releaseNotes || 'No release notes provided.',
          githubRepo: result.githubRepo || 'https://github.com/RakeshKumardhawan/UBDTOOLS',
          downloadUrl: result.downloadUrl || '#'
        });
      } else {
        throw new Error('Server returned unsuccessful version data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleaseNotes();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500 italic">Fetching latest release notes from GitHub...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 rounded-2xl p-8 border border-rose-100 shadow-sm flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <p className="text-sm font-bold text-rose-700">Failed to load release notes</p>
        <button 
          onClick={fetchReleaseNotes}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  const notesList = data.releaseNotes.split('. ').filter(n => n.trim().length > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Official Release Notes</h3>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Version History & Changelog</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
            LATEST STABLE
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Version Summary */}
          <div className="w-full md:w-64 space-y-4 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Tag className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase">Current Version</span>
              </div>
              <div className="text-3xl font-black text-slate-900">{data.latestVersion}</div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Released on {data.releaseDate}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Github className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase">Source Code</span>
              </div>
              <a 
                href={data.githubRepo} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] font-mono font-bold text-indigo-700 hover:underline flex items-center gap-1"
              >
                GitHub Repository <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right: Changelog */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Code className="w-4 h-4 text-indigo-600" />
              <span>What's New in this Build?</span>
            </div>

            <div className="space-y-3">
              {notesList.map((note, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 group hover:border-indigo-200 transition-colors">
                  <div className="mt-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {note.trim()}{!note.endsWith('.') && '.'}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-3">
              <a 
                href={data.downloadUrl}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl text-center shadow-md transition-all active:scale-95"
              >
                Download Stable EXE ({data.latestVersion})
              </a>
              <button 
                onClick={fetchReleaseNotes}
                className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                title="Refresh Release Notes"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900">Update Notice</h4>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Version **v1.0.2** includes a critical fix for the "Automation server can't create object" error. If you are using v1.0.1 or older, please update immediately to ensure DSC token compatibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
