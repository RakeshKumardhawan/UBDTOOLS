import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Globe, 
  Monitor, 
  Bell, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Megaphone, 
  RefreshCw, 
  Radio, 
  ShieldAlert, 
  MessageSquare,
  Clock,
  Layers,
  Share2,
  Eye,
  BookOpen
} from 'lucide-react';
import { useToast } from './Toast';

export interface PostItem {
  id: number | string;
  slug?: string;
  title: string;
  content: string;
  date: string;
  importance: 'High' | 'Normal' | 'Low';
  category?: string;
  author?: string;
  sendTelegram?: boolean;
}

interface AdminPostPublisherViewProps {
  onOpenPost?: (slug: string) => void;
}

export const AdminPostPublisherView: React.FC<AdminPostPublisherViewProps> = ({ onOpenPost }) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [importance, setImportance] = useState<'High' | 'Normal' | 'Low'>('High');
  const [category, setCategory] = useState('Software Update');
  const [sendTelegram, setSendTelegram] = useState(true);

  const directLinkUrl = `${window.location.origin}/?tab=admin/post`;
  const directFeedUrl = `${window.location.origin}/api/v1/posts/feed`;

  // Fetch live posts from backend feed
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/posts/feed');
      if (res.ok) {
        const data = await res.json();
        const list = data.posts || data.feed || data.announcements || data.news || [];
        if (Array.isArray(list)) {
          setPosts(list);
        }
      }
    } catch (err) {
      console.error('Failed to fetch announcements feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showError('దయచేసి శీర్షిక (Title) మరియు వివరాలు (Content) రెండింటినీ పూర్తి చేయండి.', 'Validation Error');
      return;
    }

    setIsPublishing(true);
    showInfo('వెబ్‌సైట్ మరియు C# అప్లికేషన్‌కి పోస్ట్ ప్రచురించబడుతోంది...', 'Publishing Post');

    try {
      const res = await fetch('/api/v1/posts/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          importance,
          category,
          date: new Date().toISOString().slice(0, 10),
          author: 'Rakesh Dhawan (Admin)',
          sendTelegram
        })
      });

      if (res.ok) {
        showSuccess('పోస్ట్ విజయవంతంగా ప్రచురించబడింది! వెబ్‌సైట్ మరియు C# యాప్‌లో ప్రత్యక్షంగా కనిపిస్తుంది.', 'Post Published Live');
        setTitle('');
        setContent('');
        fetchPosts();
      } else {
        showError('పోస్ట్ ప్రచురించడంలో లోపం జరిగింది.', 'Publish Error');
      }
    } catch (err: any) {
      showError(`Error publishing post: ${err.message}`, 'Publish Failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('మీరు ఖచ్చితంగా ఈ పోస్ట్‌ను తొలగించాలనుకుంటున్నారా?')) return;

    try {
      const res = await fetch(`/api/v1/posts/feed/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess('పోస్ట్ విజయవంతంగా తొలగించబడింది.', 'Post Removed');
        fetchPosts();
      }
    } catch (err) {
      showError('పోస్ట్ తొలగించడంలో లోపం జరిగింది.', 'Delete Error');
    }
  };

  const copyToClipboard = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full custom-scrollbar">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 border border-slate-800 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-amber-300">
            <Megaphone className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-syne tracking-tight">
                ADMIN POST PUBLISHER & BROADCAST MANAGER
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                Live Cloud Sync Active
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              ఇక్కడి నుండి మీరు ప్రచురించే ప్రతి పోస్ట్ నేరుగా <b>వెబ్‌సైట్ డ్యాష్‌బోర్డ్</b> మరియు గ్రామ పంచాయితీల కంప్యూటర్లలోని <b>C# WinForms Executable Tool</b> లో క్షణాల్లో ప్రత్యక్షంగా కనిపిస్తుంది!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => copyToClipboard(directFeedUrl, 'feed')}
            className="px-3 py-2 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-amber-300 text-xs font-semibold flex items-center gap-2 border border-indigo-500/40 transition-all cursor-pointer font-mono"
            title="Copy API Feed Endpoint: /api/v1/posts/feed"
          >
            {copiedId === 'feed' ? <Check className="w-4 h-4 text-emerald-400" /> : <Globe className="w-4 h-4 text-amber-300 animate-pulse" />}
            <span>{copiedId === 'feed' ? 'Feed URL Copied!' : 'Copy Feed URL (/api/v1/posts/feed)'}</span>
          </button>

          <button
            onClick={() => copyToClipboard(directLinkUrl, 'link')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            {copiedId === 'link' ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-indigo-400" />}
            <span>{copiedId === 'link' ? 'Publisher Link Copied!' : 'Publisher URL'}</span>
          </button>
          
          <button
            onClick={() => onOpenPost && onOpenPost('ubd_monitoring')}
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-amber-500/40"
          >
            <Database className="w-4 h-4" />
            <span>UBD Setting Manager (Telemetry)</span>
          </button>
          
          <button
            onClick={fetchPosts}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Post Creation Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>కొత్త పోస్ట్ పబ్లిష్ చేయండి (Create New Live Post)</span>
            </h2>
            <span className="text-[11px] font-mono font-medium text-slate-400">Target: Website + C# WinForms App</span>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                పోస్ట్ శీర్షిక (Post Title) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ఉదాహరణ: UBD Portal Version v1.0.8 Update Released / Important Security Notice"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none transition-all"
                required
              />
            </div>

            {/* Category & Importance Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  వర్గం (Category)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-semibold text-slate-800 bg-white outline-none cursor-pointer"
                >
                  <option value="Software Update">Software Update (అప్‌డేట్)</option>
                  <option value="Portal Notice">Portal Notice (పోర్టల్ నోటీసు)</option>
                  <option value="ActiveX / DSC Guide">ActiveX / DSC Guide (గైడ్)</option>
                  <option value="Maintenance Alert">Maintenance Alert (మెయింటెనెన్స్)</option>
                  <option value="General Notice">General Notice (సాధారణ సమాచారం)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ప్రాధాన్యత (Importance Level)
                </label>
                <select
                  value={importance}
                  onChange={(e) => setImportance(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-semibold text-slate-800 bg-white outline-none cursor-pointer"
                >
                  <option value="High">🔴 Urgent / High Priority (అత్యవసరం)</option>
                  <option value="Normal">🟡 Normal Notice (సాధారణ నోటీసు)</option>
                  <option value="Low">🟢 Low / Info Only (సమాచారం కోసం)</option>
                </select>
              </div>
            </div>

            {/* Content Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                పూర్తి వివరాలు (Post Content & Details) *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="పోస్ట్‌కు సంబంధించిన పూర్తి సమాచారం మరియు వివరాలను ఇక్కడ నమోదు చేయండి..."
                className="w-full p-3.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 outline-none leading-relaxed transition-all resize-y"
                required
              />
            </div>

            {/* Checkboxes for Delivery Channels */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-800 block mb-1">డెలివరీ ఛానెల్స్ (Delivery Targets):</span>
              
              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked readOnly className="rounded text-indigo-600 focus:ring-indigo-500" />
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Web Application Dashboard & Release Notes (www.e-vedhika.in)</span>
              </label>

              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked readOnly className="rounded text-indigo-600 focus:ring-indigo-500" />
                <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                <span>C# WinForms Desktop Tool (tabLiveUpdates - Live Posts Feed)</span>
              </label>

              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sendTelegram} 
                  onChange={(e) => setSendTelegram(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                />
                <Send className="w-3.5 h-3.5 text-sky-500" />
                <span>Instant Telegram Channel Alert (అధికారుల టెలిగ్రామ్‌కి ఆటో మేసేజ్)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPublishing}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isPublishing ? 'పోస్ట్ ప్రచురించబడుతోంది...' : '🚀 PUBLISH POST TO WEBSITE & C# APP NOW'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Dual Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* C# WinForms App Preview Card */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                <Monitor className="w-4 h-4 text-indigo-400" />
                C# WinForms Executable Preview
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">tabLiveUpdates</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  importance === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {importance === 'High' ? '🔴 HIGH PRIORITY' : '🔵 NORMAL NOTICE'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{new Date().toISOString().slice(0, 10)}</span>
              </div>

              <h4 className="text-sm font-bold text-amber-300 font-syne">
                {title || 'పోస్ట్ శీర్షిక ఇక్కడ కనిపిస్తుంది (Title Preview)'}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-4">
                {content || 'పోస్ట్ యొక్క వివరాలు ఇక్కడ ప్రత్యక్షంగా కనిపిస్తాయి. C# అప్లికేషన్‌ను ఓపెన్ చేయగానే ఆటోమేటిక్‌గా ఈ సమాచారం డిస్‌ప్లే అవుతుంది...'}
              </p>

              <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-900">
                <span>Source: www.e-vedhika.in</span>
                <span>Author: Rakesh Dhawan</span>
              </div>
            </div>
          </div>

          {/* Web App Dashboard Banner Preview Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                <Globe className="w-4 h-4 text-blue-600" />
                Website Dashboard Banner Preview
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">www.e-vedhika.in</span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-indigo-900 truncate">
                  {title || 'పోస్ట్ శీర్షిక ప్రివ్యూ'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                {content || 'వెబ్‌సైట్‌లో పోస్ట్ సేవ్‌ అయిన వెంటనే డ్యాష్‌బోర్డ్‌లో ప్రదర్శించబడుతుంది.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Published Posts Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>ప్రస్తుతం యాక్టివ్‌గా ఉన్న పోస్ట్‌లు (Active Published Posts - {posts.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ఇక్కడ ఉన్న ప్రచురణలన్నీ సిస్టమ్ డ్యాష్‌బోర్డ్ మరియు C# అప్లికేషన్‌లో లైవ్‌లో అందుబాటులో ఉంటాయి.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live Cloud Sync
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs">Loading live announcements...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            ప్రస్తుతం ఎటువంటి పోస్ట్‌లు లేవు. పైన ఉన్న ఫారమ్ ద్వారా కొత్త పోస్ట్‌ను ప్రచురించవచ్చు.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                  <th className="py-3 px-3.5">ID / Date</th>
                  <th className="py-3 px-3.5">Post Title & Details</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Priority</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      <div className="font-bold text-slate-800">#{post.id}</div>
                      <div className="text-[10px] text-slate-400">{post.date}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 text-xs">{post.title}</div>
                      <div className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">{post.content}</div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {post.category || 'General Notice'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        post.importance === 'High' 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {post.importance === 'High' ? '🔴 High Priority' : '🔵 Normal'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            const targetSlug = post.slug || (typeof post.id === 'string' && post.id.includes('ubd') ? post.id : 'ubd-setting-issues-one-click-all-in-one-setup');
                            if (onOpenPost) {
                              onOpenPost(targetSlug);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="View / Read Full Post"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => {
                            const postUrl = post.slug || (typeof post.id === 'string' && post.id.includes('ubd')) 
                              ? `https://www.e-vedhika.in/home/post/${post.slug || post.id}`
                              : `https://www.e-vedhika.in/?postId=${post.id}`;
                            copyToClipboard(postUrl, `row-${post.id}`);
                            showSuccess('పోస్ట్ పబ్లిక్ లింక్ కాపీ అయింది!', 'Link Copied');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy Public Post URL"
                        >
                          {copiedId === `row-${post.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
                          <span>{copiedId === `row-${post.id}` ? 'Copied' : 'Link'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(post.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
