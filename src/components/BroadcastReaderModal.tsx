import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  User,
  Tag,
  Share2,
  Printer,
  Check,
  Megaphone,
  Radio,
  FileText
} from 'lucide-react';
import { useToast } from './Toast';

export interface BroadcastPost {
  id: number | string;
  slug?: string;
  title: string;
  content: string;
  date: string;
  time?: string;
  importance: 'High' | 'Normal' | 'Low';
  category?: string;
  author?: string;
}

interface BroadcastReaderModalProps {
  post: BroadcastPost | null;
  onClose: () => void;
}

export const BroadcastReaderModal: React.FC<BroadcastReaderModalProps> = ({ post, onClose }) => {
  const { showSuccess } = useToast();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [speechLang, setSpeechLang] = useState<'te-IN' | 'en-IN'>('te-IN');

  useEffect(() => {
    // Stop speech synthesis when modal unmounts or changes
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [post]);

  if (!post) return null;

  const handleStartSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('మీ బ్రౌజర్‌లో వాయిస్ రీడర్ (Speech Synthesis) సపోర్ట్ లేదు.');
      return;
    }

    window.speechSynthesis.cancel(); // Reset any ongoing speech

    const textToRead = `${post.title}. ${post.content}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = speechLang;
    utterance.rate = 0.95; // Slightly relaxed reading rate for clarity

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePauseSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (isPlaying && !isPaused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } else if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    }
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleCopy = () => {
    const fullText = `📢 ${post.title}\n📅 ${post.date}\n\n${post.content}\n\n- E-Vedhika Official Broadcast`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    showSuccess('పోస్ట్ పూర్తి సమాచారం కాపీ చేయబడింది!', 'కాపీ పూర్తయింది');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-5 sm:p-7 space-y-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <Megaphone className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    post.importance === 'High'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  {post.importance === 'High' ? '🔴 HIGH PRIORITY BROADCAST' : '🔵 OFFICIAL NOTICE'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {post.category || 'General Notice'}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-amber-200 font-syne leading-snug">
                {post.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              handleStopSpeech();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Metadata Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{post.date} {post.time ? `(${post.time})` : ''}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{post.author || 'Rakesh Dhawan (Admin)'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-bold">Live Synchronized</span>
          </div>
        </div>

        {/* Audio TTS Voice Reader Controller Box */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950 p-4 rounded-xl border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-300 animate-bounce" />
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-mono">
                వాయిస్ రీడర్ (Audio Read Aloud - Voice Reader)
              </h4>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="text-slate-400">భాష (Voice):</span>
              <button
                onClick={() => {
                  handleStopSpeech();
                  setSpeechLang('te-IN');
                }}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  speechLang === 'te-IN'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => {
                  handleStopSpeech();
                  setSpeechLang('en-IN');
                }}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  speechLang === 'en-IN'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            ఈ పోస్ట్ సమాచారాన్ని మొత్తంగా బిగ్గరగా చదివి వినిపించడానికి క్రింది బటన్ నొక్కండి.
          </p>

          <div className="flex items-center gap-2 pt-1">
            {!isPlaying ? (
              <button
                onClick={handleStartSpeech}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>🔊 మొత్తంగా బిగ్గరగా వినండి (Read Aloud)</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseSpeech}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>{isPaused ? 'మళ్ళీ ప్రారంభించు (Resume)' : 'పాజ్ చేయి (Pause)'}</span>
                </button>

                <button
                  onClick={handleStopSpeech}
                  className="px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>ఆపివేయి (Stop)</span>
                </button>

                {/* Animated Equalizer Visualizer */}
                <div className="flex items-center gap-1 ml-2">
                  <span className="w-1 h-4 bg-amber-400 animate-bounce"></span>
                  <span className="w-1 h-6 bg-cyan-400 animate-bounce delay-100"></span>
                  <span className="w-1 h-3 bg-emerald-400 animate-bounce delay-200"></span>
                  <span className="w-1 h-5 bg-purple-400 animate-bounce delay-300"></span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Full Text Body Prose */}
        <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-amber-500 selection:text-slate-950">
          {post.content}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-300" />}
              <span>{copied ? 'కాపీ అయింది!' : 'కాపీ / షేర్ (Copy Text)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer hidden sm:flex"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>ప్రింట్ / PDF</span>
            </button>
          </div>

          <button
            onClick={() => {
              handleStopSpeech();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all cursor-pointer"
          >
            పూర్తయింది (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
