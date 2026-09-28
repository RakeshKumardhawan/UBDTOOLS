import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Loader2, 
  HelpCircle, 
  Code, 
  Terminal,
  RefreshCw
} from 'lucide-react';
import { EnvironmentStatus, DepartmentProfile, LogEntry } from '../types';

interface AiTroubleshooterViewProps {
  envStatus: EnvironmentStatus;
  selectedProfile: DepartmentProfile;
  logs: LogEntry[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiTroubleshooterView: React.FC<AiTroubleshooterViewProps> = ({
  envStatus,
  selectedProfile,
  logs,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `నమస్కారం! I am the Gemini 3.6 Flash AI Diagnostic Assistant for the E-Vedhika One-Click Deployment Tool created by Rakesh Dhawan.

How can I help you today? You can ask in Telugu or English about portal login issues, DSC Token errors, ActiveX configuration, or DigiSigner certificates.`,
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const presetQueries = [
    'Portal login page fails to load ActiveX control on Edge',
    'DSC Token error UBD-1003: Token not detected by DigiSigner',
    'How to enable .NET Framework 3.5 on Windows 11 for enterprise portals',
    'పోర్టల్‌లో డబుల్ క్లిక్ చేయగానే ఎర్రర్ వస్తోంది (Telugu Prompt)',
    'NIC DigiSigner port 8080 connection refused error',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const userPrompt = textToSend || query;
    if (!userPrompt.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userPrompt,
          logs: logs.map((l) => `${l.timestamp} [${l.module}] ${l.message}`).join('\n'),
          systemContext: {
            os: envStatus.osVersion,
            profile: selectedProfile.name,
            dscToken: envStatus.dscTokenName,
            edgeIEMode: envStatus.edgeIEModeConfigured,
          },
          language: 'Telugu and English',
        }),
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.analysis,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Failed to get analysis');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Error connecting to Gemini AI Diagnostic Engine: ${err.message}. Please ensure internet is connected and server GEMINI_API_KEY is active.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-100px)]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 text-white rounded-2xl p-5 border border-purple-800/50 flex items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Gemini AI Diagnostic Assistant</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 text-[10px] font-bold">
                gemini-3.6-flash
              </span>
            </h2>
            <p className="text-xs text-purple-200">
              E-Vedhika automated support engineer.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <span className="text-xs font-bold text-slate-500 mr-1">Quick Prompts:</span>
        {presetQueries.map((pq, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(pq)}
            className="px-3 py-1 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 hover:border-purple-300 text-xs font-medium transition-all cursor-pointer shadow-2xs"
          >
            {pq}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-3xl rounded-2xl p-4 text-xs space-y-2 relative shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white font-medium rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] opacity-75 font-mono mb-1">
                <span>{msg.sender === 'user' ? 'You (Panchayat Staff)' : 'E-Vedhika Gemini AI Engine'}</span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                {msg.text}
              </div>

              {msg.sender === 'ai' && (
                <button
                  onClick={() => copyMessage(msg.id, msg.text)}
                  className="mt-2 text-[10px] text-slate-500 hover:text-purple-700 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === msg.id ? 'Copied to Clipboard' : 'Copy Solution'}</span>
                </button>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>Analyzing diagnostic context & generating fix...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center gap-2 shrink-0">
        <input
          id="input-ai-prompt"
          type="text"
          placeholder="Type your question or paste error code (English or Telugu / తెలుగు)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 px-3 py-2 text-xs text-slate-800 focus:outline-hidden"
        />
        <button
          id="btn-send-ai-prompt"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !query.trim()}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>
      </div>
    </div>
  );
};
