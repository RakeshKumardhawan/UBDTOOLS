import React, { useState, useEffect } from 'react';
import { Megaphone, PlusCircle, Radio, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';
import { NavigationTab } from '../types';

interface PostItem {
  id: number | string;
  slug?: string;
  title: string;
  content: string;
  date: string;
  importance: 'High' | 'Normal' | 'Low';
  category?: string;
}

interface LiveAnnouncementWidgetProps {
  setActiveTab: (tab: NavigationTab) => void;
  onOpenPost?: (slug: string) => void;
}

export const LiveAnnouncementWidget: React.FC<LiveAnnouncementWidgetProps> = ({ setActiveTab, onOpenPost }) => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/v1/posts/feed');
        if (res.ok) {
          const data = await res.json();
          const list = data.posts || data.feed || data.announcements || data.news || [];
          if (isMounted && Array.isArray(list)) {
            setPosts(list);
          }
        }
      } catch (err) {
        console.warn('Failed to load live announcements on widget:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const latestPost = posts[0];

  return (
    <div className="rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-indigo-950/60 shadow-lg text-white space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-amber-300">
            <Megaphone className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-syne font-bold text-sm tracking-wide text-amber-300">
                LIVE OFFICIAL ANNOUNCEMENTS & BROADCASTS
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                Live Sync Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ఈ వెబ్‌సైట్ ద్వారా మీరు పెట్టే ప్రతి పోస్ట్ నేరుగా C# అప్లికేషన్ డిస్‌ప్లేలో ప్రత్యక్షంగా కనిపిస్తుంది.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('posts')}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 border border-indigo-400/40 shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
          <span>కొత్త పోస్ట్ ప్రచురించండి (Publisher)</span>
          <ArrowRight className="w-3 h-3 text-indigo-200" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-4 text-xs text-slate-400 text-center animate-pulse">
          Loading live announcements...
        </div>
      ) : !latestPost ? (
        <div className="py-3 text-xs text-slate-400 text-center">
          ప్రస్తుతం ఎటువంటి పోస్ట్‌లు లేవు. పైన ఉన్న బటన్ క్లిక్ చేసి కొత్త పోస్ట్‌ను డిస్‌ప్లేకి పంపవచ్చు.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {posts.slice(0, 2).map((post) => (
            <div
              key={post.id}
              onClick={() => {
                const targetSlug = post.slug || (typeof post.id === 'string' && post.id.includes('ubd') ? post.id : 'ubd-setting-issues-one-click-all-in-one-setup');
                if (onOpenPost) {
                  onOpenPost(targetSlug);
                } else {
                  setActiveTab('post-detail');
                }
              }}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-indigo-400 hover:bg-slate-900 transition-all space-y-1.5 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span
                  className={`px-2 py-0.5 rounded font-bold font-mono ${
                    post.importance === 'High'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {post.importance === 'High' ? '🔴 HIGH PRIORITY' : '🔵 NOTICE'}
                </span>
                <span className="text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </span>
              </div>
              <h4 className="text-xs font-bold text-amber-200 line-clamp-1 font-syne group-hover:text-amber-300 transition-colors">
                {post.title}
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {post.content}
              </p>
              <div className="pt-1 flex items-center gap-1 text-[10px] text-indigo-400 font-bold group-hover:text-indigo-300">
                <span>చదవండి (Read Full Post)</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
