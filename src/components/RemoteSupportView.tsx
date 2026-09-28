import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  MousePointer, 
  Keyboard, 
  FolderSync, 
  MessageSquare, 
  Camera, 
  RotateCcw, 
  Stethoscope, 
  PlayCircle, 
  Terminal, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  FileText, 
  Server, 
  Activity, 
  Power, 
  Eye, 
  Cpu, 
  Key, 
  Globe, 
  Database, 
  Maximize2, 
  Download, 
  Upload, 
  RefreshCw,
  Sliders,
  Check,
  AlertTriangle
} from 'lucide-react';
import { EnvironmentStatus } from '../types';

interface RemoteSupportViewProps {
  envStatus: EnvironmentStatus;
}

interface RemoteSession {
  id: string;
  code: string;
  pcName: string;
  userName: string;
  location: string;
  os: string;
  status: 'connected' | 'waiting' | 'ended';
  latency: number;
  ipAddress: string;
  dscConnected: boolean;
  ieModeActive: boolean;
  isOnline: boolean;
  lastHeartbeat: string;
}

export const RemoteSupportView: React.FC<RemoteSupportViewProps> = ({ envStatus }) => {
  const [sessionCodeInput, setSessionCodeInput] = useState('EV-8921-9042');
  const [activeSession, setActiveSession] = useState<RemoteSession>({
    id: 'SESS-101',
    code: 'EV-8921-9042',
    pcName: 'GP-PC-12 (Khammam Mandal)',
    userName: 'Secretary_Ramesh_K',
    location: 'Khammam Grama Panchayat Office',
    os: 'Windows 11 Pro (64-Bit Build 22631)',
    status: 'connected',
    latency: 14,
    ipAddress: '10.240.18.42',
    dscConnected: true,
    ieModeActive: true,
    isOnline: true,
    lastHeartbeat: new Date().toLocaleTimeString()
  });

  // Simulated Heartbeat for Remote PC Status
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSession(prev => {
        // Mock occasional network drop (10% chance)
        const isCurrentlyOnline = prev.isOnline;
        const willBeOnline = Math.random() > (isCurrentlyOnline ? 0.1 : 0.4);
        return {
          ...prev,
          isOnline: willBeOnline,
          lastHeartbeat: willBeOnline ? new Date().toLocaleTimeString() : prev.lastHeartbeat
        };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [mouseControl, setMouseControl] = useState(true);
  const [keyboardControl, setKeyboardControl] = useState(true);
  const [sessionRecording, setSessionRecording] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState<
    'screen' | 'deploy_status' | 'registry' | 'services' | 'events' | 'cmd' | 'powershell'
  >('screen');

  // Interactive Remote Screen States
  const [screenClickPoint, setScreenClickPoint] = useState<{ x: number; y: number } | null>(null);
  const [remoteLogs, setRemoteLogs] = useState<string[]>([
    '[TLS 1.3] Secure session handshake established with GP-PC-12.',
    '[Consent] User Secretary_Ramesh_K granted full Remote Support permissions.',
    '[System] Display stream initialized: 1920x1080 @ 60 FPS.',
    '[USB DSC] ProXKey USB Token detected on COM4.',
    '[Edge IE Mode] Site list XML parsed successfully. ubd.telangana.gov.in running under IE5 Quirks.'
  ]);

  // Remote Chat State
  const [chatMessages, setChatMessages] = useState<{ sender: 'Admin' | 'User'; text: string; time: string }[]>([
    { sender: 'User', text: 'నమస్తే అడ్మిన్ సర్, UBD పోర్టల్‌లో డిజిటల్ సైన్ అవ్వడం లేదు.', time: '09:40 AM' },
    { sender: 'Admin', text: 'నమస్తే రమేష్ గారు, నేను E-Vedhika ఇన్-బిల్ట్ రిమోట్ ద్వారా మీ PC చూస్తున్నాను. 1 నిమిషంలో సెట్ చేస్తాను.', time: '09:41 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Remote CMD & PowerShell Command Line States
  const [cmdHistory, setCmdHistory] = useState<string[]>([
    'Microsoft Windows [Version 10.0.22631.3880]',
    '(c) Microsoft Corporation. All rights reserved.',
    '',
    'C:\\Windows\\System32> echo [E-Vedhika Remote Session Active]',
    '[E-Vedhika Remote Session Active]',
    ''
  ]);
  const [cmdInput, setCmdInput] = useState('');

  const [psHistory, setPsHistory] = useState<string[]>([
    'Windows PowerShell',
    'Copyright (C) Microsoft Corporation. All rights reserved.',
    '',
    'PS C:\\Users\\Secretary> Get-Service DigiSignerService',
    'Status   Name               DisplayName',
    '------   ----               -----------',
    'Running  DigiSignerService  NIC DigiSigner Port 8080 Service',
    ''
  ]);
  const [psInput, setPsInput] = useState('');

  // Remote Services Table
  const [servicesList, setServicesList] = useState([
    { name: 'DigiSignerService', displayName: 'NIC DigiSigner Port 8080 Service', status: 'Running', startup: 'Automatic' },
    { name: 'SCardSvr', displayName: 'Smart Card Reader Core Service', status: 'Running', startup: 'Automatic' },
    { name: 'EdgeElevationService', displayName: 'Microsoft Edge Elevation Service', status: 'Running', startup: 'Automatic' },
    { name: 'PlugAndPlay', displayName: 'Plug and Play USB Driver Host', status: 'Running', startup: 'Automatic' },
    { name: 'WinHttpAutoProxySvc', displayName: 'WinHTTP Web Proxy Auto-Discovery', status: 'Running', startup: 'Manual' }
  ]);

  // Handle Screen Canvas Clicks
  const handleScreenCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseControl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setScreenClickPoint({ x, y });

    const newLog = `[Mouse Click] Remote Click sent to X: ${x}px, Y: ${y}px on ${activeSession.pcName}`;
    setRemoteLogs(prev => [newLog, ...prev.slice(0, 15)]);

    setTimeout(() => setScreenClickPoint(null), 1200);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      sender: 'Admin' as const,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulated response from Secretary
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'User',
          text: 'థ్యాంక్స్ సర్, స్క్రీన్ స్పష్టంగా కనిపిస్తోంది.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  const handleRunCmd = (cmdToRun?: string) => {
    const cmd = cmdToRun || cmdInput;
    if (!cmd.trim()) return;

    let output = '';
    const upper = cmd.toUpperCase();
    if (upper.includes('IPCONFIG')) {
      output = `Ethernet adapter Local Area Connection:\n   IPv4 Address. . . . . . . . . . . : ${activeSession.ipAddress}\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 10.240.18.1\n   DNS Servers . . . . . . . . . . . : 8.8.8.8, 1.1.1.1`;
    } else if (upper.includes('PING')) {
      output = `Pinging ubd.telangana.gov.in [164.100.12.89] with 32 bytes of data:\nReply from 164.100.12.89: bytes=32 time=18ms TTL=118\nReply from 164.100.12.89: bytes=32 time=16ms TTL=118\nPing statistics for 164.100.12.89:\n    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`;
    } else if (upper.includes('SFC')) {
      output = `Beginning system scan. This process will take some time.\nVerification 100% complete.\nWindows Resource Protection did not find any integrity violations.`;
    } else if (upper.includes('GPUPDATE')) {
      output = `Updating policy...\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.`;
    } else {
      output = `Command executed successfully on remote machine ${activeSession.pcName}. Return Code: 0`;
    }

    setCmdHistory(prev => [...prev, `C:\\Windows\\System32> ${cmd}`, output, '']);
    setCmdInput('');
  };

  const handleRunPs = (scriptToRun?: string) => {
    const script = scriptToRun || psInput;
    if (!script.trim()) return;

    let output = `PS C:\\Users\\Secretary> ${script}\nResult: Execution completed with status OK (ExitCode: 0)`;
    setPsHistory(prev => [...prev, output, '']);
    setPsInput('');
  };

  const toggleService = (serviceName: string) => {
    setServicesList(prev => prev.map(s => {
      if (s.name === serviceName) {
        const nextStatus = s.status === 'Running' ? 'Stopped' : 'Running';
        setRemoteLogs(logPrev => [`[Service] ${serviceName} changed state to ${nextStatus}`, ...logPrev]);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Monitor className="w-64 h-64 text-teal-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>E-VEDHIKA NATIVE REMOTE ENGINE</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>TLS 1.3 Encrypted Session</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>No AnyDesk / TeamViewer Needed</span>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Central Enterprise Remote Support Control Center</span>
            </h1>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              ప్రాంతీయ గ్రామ్ పంచాయతీల కంప్యూటర్లను అడ్మిన్ డాష్‌బోర్డ్ నుండే ప్రత్యక్షంగా రిమోట్ కంట్రోల్ (Mouse, Keyboard, Screen, File Transfer, CMD, Registry, Services) చేయండి.
            </p>
          </div>

          {/* Direct Connection Input */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 min-w-[320px]">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Session Desk Code:</span>
              <span className="text-emerald-400 font-mono text-[11px] font-semibold">Consent Active</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sessionCodeInput}
                onChange={(e) => setSessionCodeInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. EV-8921-9042"
              />
              <button
                onClick={() => {
                  alert(`Connecting to Desk Session: ${sessionCodeInput}... Session established!`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Connect</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Latency: <strong className="text-emerald-400">{activeSession.latency} ms</strong></span>
              <span>FPS: <strong className="text-emerald-400">60 FPS</strong></span>
              <span>Audio: <strong className="text-slate-300">PCM 48kHz</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Remote Support Control Hub Layout */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Active Remote Machine Bar & Action Toolbar */}
        <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">{activeSession.pcName}</h3>
                {activeSession.isOnline ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 w-max">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
                    </span>
                    <span className="text-[9px] text-emerald-500/70 font-mono">Last Heartbeat: {activeSession.lastHeartbeat}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1 w-max">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> OFFLINE
                    </span>
                    <span className="text-[9px] text-rose-500/70 font-mono">Connection Lost (Last seen: {activeSession.lastHeartbeat})</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>User: <strong>{activeSession.userName}</strong></span>
                <span>•</span>
                <span>OS: <strong>{activeSession.os}</strong></span>
                <span>•</span>
                <span>IP: <strong>{activeSession.ipAddress}</strong></span>
              </p>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMouseControl(!mouseControl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mouseControl ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Remote Mouse Control Toggle"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Mouse {mouseControl ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setKeyboardControl(!keyboardControl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                keyboardControl ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Remote Keyboard Input Toggle"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard {keyboardControl ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                const fn = prompt('Enter filename to push to remote PC (e.g. EVedhika_Fix_Script.bat):', 'EVedhika_Fix_Script.bat');
                if (fn) {
                  alert(`File ${fn} transferred to C:\\EVedhika\\Downloads\\ on remote PC ${activeSession.pcName}!`);
                  setRemoteLogs(prev => [`[File Transfer] Uploaded ${fn} to remote PC.`, ...prev]);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FolderSync className="w-3.5 h-3.5 text-teal-400" />
              <span>File Transfer</span>
            </button>

            <button
              onClick={() => {
                alert(`Captured High-Res Screenshot of ${activeSession.pcName} desktop saved to local downloads!`);
                setRemoteLogs(prev => [`[Screenshot] Remote screen capture saved.`, ...prev]);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Screenshot</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Are you sure you want to trigger remote diagnostic verification (90 checks) on ${activeSession.pcName}?`)) {
                  alert('Remote Enterprise Diagnostic Engine initiated! All 90 parameters verified 100% Passed.');
                  setRemoteLogs(prev => [`[Diagnostics] 90 Enterprise Checks executed on remote PC. Score: 100%`, ...prev]);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Run 90 Checks</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Reboot remote PC ${activeSession.pcName}? User Secretary_Ramesh_K will receive notification.`)) {
                  alert('Remote soft restart command sent!');
                  setRemoteLogs(prev => [`[System] Remote reboot command sent to ${activeSession.pcName}`, ...prev]);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Power className="w-3.5 h-3.5 text-rose-400" />
              <span>Restart PC</span>
            </button>
          </div>
        </div>

        {/* Console Sub-Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveConsoleTab('screen')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeConsoleTab === 'screen'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>1. Current Screen (Live Remote Desktop)</span>
          </button>

          <button
            onClick={() => setActiveConsoleTab('deploy_status')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeConsoleTab === 'deploy_status'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>2. Deployment Status (15 Steps)</span>
          </button>

          <button
            onClick={() => setActiveConsoleTab('registry')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeConsoleTab === 'registry'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>3. Registry Viewer</span>
          </button>

          <button
            onClick={() => setActiveConsoleTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeConsoleTab === 'services'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>4. Services Manager</span>
          </button>

          <button
            onClick={() => setActiveConsoleTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeConsoleTab === 'events'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>5. Event Viewer</span>
          </button>

          <button
            onClick={() => setActiveConsoleTab('cmd')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeConsoleTab === 'cmd'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>6. Remote CMD</span>
          </button>

          <button
            onClick={() => setActiveConsoleTab('powershell')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeConsoleTab === 'powershell'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>7. Remote PowerShell</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 bg-slate-950 min-h-[520px] flex flex-col justify-between">
          {/* TAB 1: CURRENT SCREEN (INTERACTIVE REMOTE DESKTOP) */}
          {activeConsoleTab === 'screen' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Screen Display Area (3 cols) */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-slate-200 font-bold">Remote Window: Microsoft Edge (IE Mode Active)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Resolution: 1920x1080</span>
                    <span>Scaling: 100%</span>
                    <button
                      onClick={() => alert('Fullscreen interactive remote viewport toggled!')}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Simulated Desktop Canvas Frame */}
                <div 
                  onClick={handleScreenCanvasClick}
                  className="relative aspect-video bg-slate-900 rounded-2xl border-2 border-indigo-500/40 shadow-2xl overflow-hidden cursor-crosshair group select-none"
                >
                  {/* Top Edge Browser Window Mock */}
                  <div className="bg-slate-800 border-b border-slate-700 p-2 flex items-center gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                      <span>https://ubd.telangana.gov.in (IE Mode - IE5 Quirks)</span>
                      <span className="text-amber-400 font-bold text-[10px] bg-amber-950/80 px-1.5 rounded">
                        ActiveX Enabled
                      </span>
                    </div>
                  </div>

                  {/* Web Page Content Inside Remote Desktop */}
                  <div className="p-6 bg-slate-100 h-full text-slate-900 space-y-4 font-sans">
                    {/* Header of Telangana UBD Portal */}
                    <div className="flex items-center justify-between border-b pb-3 border-slate-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
                          TG
                        </div>
                        <div>
                          <h2 className="font-extrabold text-sm text-slate-900">
                            Government of Telangana - UBD Portal
                          </h2>
                          <p className="text-[10px] text-slate-600">e-Panchayat Urban & Rural Body Services</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          DSC Token Ready: ProXKey USB
                        </span>
                      </div>
                    </div>

                    {/* Active Form Area */}
                    <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-3">
                      <h3 className="font-bold text-xs text-slate-800">
                        Work Order Verification & Digital Signature Authentication
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">GP Location:</span>
                          <span className="font-bold text-slate-900">Khammam Mandal GP Office</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">DigiSigner Listener:</span>
                          <span className="font-bold text-emerald-700">Port 8080 Active (OK)</span>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-900">
                          ActiveX USB Token Digital Certificate Found:
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('Digital Certificate Signed successfully on remote UBD Portal!');
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs"
                        >
                          Sign Document (ActiveX)
                        </button>
                      </div>
                    </div>

                    {/* Windows Taskbar at bottom of remote screen */}
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 text-white py-1 px-4 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-3">
                        <span className="bg-indigo-600 px-2 py-0.5 rounded text-white font-bold">Start</span>
                        <span>Edge (IE Mode)</span>
                        <span>DigiSigner v3.5</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>USB DSC Connected</span>
                        <span>09:42 AM</span>
                      </div>
                    </div>
                  </div>

                  {/* Click Visual Ripple */}
                  {screenClickPoint && (
                    <div
                      style={{ left: screenClickPoint.x - 12, top: screenClickPoint.y - 12 }}
                      className="absolute w-6 h-6 rounded-full bg-amber-400/80 border-2 border-white animate-ping pointer-events-none"
                    />
                  )}
                </div>

                {/* Direct Keystroke Send Input */}
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-indigo-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Type keystrokes here to send directly to remote machine (e.g., Password, Certificate PIN)..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        alert(`Sent keystrokes "${e.currentTarget.value}" to remote desktop PC!`);
                        setRemoteLogs(prev => [`[Keyboard] Sent input string "${e.currentTarget.value}" to remote PC.`, ...prev]);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">Press Enter to Send</span>
                </div>
              </div>

              {/* Chat & Session Log Side Panel (1 col) */}
              <div className="space-y-4 flex flex-col justify-between">
                {/* Operator Chat */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                      <span>Live Operator Chat</span>
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono">Connected</span>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 min-h-[160px] max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar text-xs">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl space-y-0.5 ${
                          msg.sender === 'Admin'
                            ? 'bg-indigo-600/30 border border-indigo-500/30 text-indigo-100 ml-4'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span>{msg.sender}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                      placeholder="Type message to Panchayat Secretary..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleSendChat}
                      className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Session Stream Logs */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-amber-400" />
                      Live Stream Event Log
                    </span>
                    <button
                      onClick={() => setRemoteLogs([])}
                      className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="h-28 overflow-y-auto text-[10px] font-mono text-slate-400 space-y-1 custom-scrollbar">
                    {remoteLogs.map((log, i) => (
                      <div key={i} className="leading-snug hover:text-slate-200 transition-colors">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE DEPLOYMENT STATUS (15 STEPS) */}
          {activeConsoleTab === 'deploy_status' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white">
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    Remote PC Deployment Execution Status (15/15 Verifications)
                  </h3>
                  <p className="text-xs text-slate-400">
                    C# EVedhikaUBDDeploymentTool running on {activeSession.pcName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    alert(`Triggered One-Click Deployment re-run on remote PC ${activeSession.pcName}!`);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Re-Deploy Remote Tool</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  '1. OS & Architecture Check (Win 11 x64)',
                  '2. Administrator Privilege Audit',
                  '3. Internet & Network Connectivity',
                  '4. .NET Framework v3.5 Verification',
                  '5. .NET Framework v4.8 Active Check',
                  '6. Edge Browser IE Mode Registry Policy',
                  '7. Zone 2 Trusted Sites Config',
                  '8. ActiveX Control Execution Permission',
                  '9. ProXKey USB Token Driver Check',
                  '10. HYP2003 USB DSC Driver Check',
                  '11. NIC DigiSigner Service (Port 8080)',
                  '12. Smart Card Subsystem Audit',
                  '13. SiteList XML Enterprise Deployment',
                  '14. Edge Enterprise Policy Auto-Apply',
                  '15. Final UBD Portal Handshake Test'
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-200"
                  >
                    <span className="font-medium text-[11px] truncate">{step}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] shrink-0">
                      PASSED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REGISTRY VIEWER */}
          {activeConsoleTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white">
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    Remote Registry Hive Inspector ({activeSession.pcName})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct access to IE Mode FeatureControl, Security Zones, and ActiveX Flags
                  </p>
                </div>
                <button
                  onClick={() => alert('Remote registry policy applied successfully!')}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Apply IE Mode Registry Fix
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-3">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-amber-300 font-bold">
                    HKLM\SOFTWARE\Policies\Microsoft\Edge\InternetExplorerIntegrationLevel = 1 (DWORD)
                  </div>
                  <div className="text-slate-400 text-[11px]">Enables Edge Internet Explorer Mode Integration</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-amber-300 font-bold">
                    HKLM\SOFTWARE\Policies\Microsoft\Edge\InternetExplorerIntegrationSiteList = "C:\EVedhika\sites.xml"
                  </div>
                  <div className="text-slate-400 text-[11px]">Points Edge to Enterprise Site List XML</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-amber-300 font-bold">
                    HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in\ubd = 2 (DWORD)
                  </div>
                  <div className="text-slate-400 text-[11px]">Configures Zone 2 Trusted Sites for UBD Portal</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SERVICES MANAGER */}
          {activeConsoleTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white">
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    Remote Windows Services Manager ({activeSession.pcName})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control DigiSigner, Smart Card, and Edge background services
                  </p>
                </div>
                <button
                  onClick={() => alert('Refreshed services list from remote PC!')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Services</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                      <th className="p-3">Service Name</th>
                      <th className="p-3">Display Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Startup</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {servicesList.map((svc) => (
                      <tr key={svc.name} className="hover:bg-slate-800/40 text-slate-300">
                        <td className="p-3 font-bold text-amber-300">{svc.name}</td>
                        <td className="p-3 text-slate-300">{svc.displayName}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            svc.status === 'Running' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {svc.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{svc.startup}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => toggleService(svc.name)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            {svc.status === 'Running' ? 'Stop' : 'Start'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: EVENT VIEWER */}
          {activeConsoleTab === 'events' && (
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    Remote Event Viewer Log Stream ({activeSession.pcName})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Application & System event entries regarding USB Token, ActiveX, and Edge
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-2 font-mono text-xs text-slate-300">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] shrink-0">INFO</span>
                  <div>
                    <span className="text-slate-400 text-[10px]">Event ID 1001 • DigiSignerService</span>
                    <p className="text-slate-200 text-[11px]">Listener on http://127.0.0.1:8080 successfully bound to network interface.</p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] shrink-0">INFO</span>
                  <div>
                    <span className="text-slate-400 text-[10px]">Event ID 4002 • Microsoft-Edge-Enterprise</span>
                    <p className="text-slate-200 text-[11px]">SiteList policy reloaded. Host ubd.telangana.gov.in set to IE5 Quirks Mode.</p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] shrink-0">WARN</span>
                  <div>
                    <span className="text-slate-400 text-[10px]">Event ID 7023 • SmartCardReader</span>
                    <p className="text-slate-200 text-[11px]">USB DSC Token ProXKey removed and re-inserted on COM4. Certificate cache updated.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REMOTE CMD */}
          {activeConsoleTab === 'cmd' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-800 text-white">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  Remote Interactive Windows CMD: {activeSession.pcName}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRunCmd('ipconfig /all')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono rounded cursor-pointer"
                  >
                    ipconfig
                  </button>
                  <button
                    onClick={() => handleRunCmd('ping ubd.telangana.gov.in')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono rounded cursor-pointer"
                  >
                    ping ubd
                  </button>
                  <button
                    onClick={() => handleRunCmd('gpupdate /force')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono rounded cursor-pointer"
                  >
                    gpupdate
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-emerald-400 space-y-2 min-h-[260px] max-h-[320px] overflow-y-auto custom-scrollbar">
                {cmdHistory.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{line}</div>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                <span className="text-slate-400 font-mono text-xs pl-2">C:\&gt;</span>
                <input
                  type="text"
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunCmd()}
                  placeholder="Type Windows command (e.g., sfc /scannow, netstart)..."
                  className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
                />
                <button
                  onClick={() => handleRunCmd()}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl cursor-pointer"
                >
                  Run
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: REMOTE POWERSHELL */}
          {activeConsoleTab === 'powershell' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-800 text-white">
                <span className="text-xs font-bold text-indigo-300 font-mono">
                  Remote Interactive PowerShell 7: {activeSession.pcName}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRunPs('Get-Service *Digi*')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono rounded cursor-pointer"
                  >
                    Get-Service
                  </button>
                  <button
                    onClick={() => handleRunPs('Test-NetConnection ubd.telangana.gov.in -Port 443')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono rounded cursor-pointer"
                  >
                    Test-NetConn
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-sky-300 space-y-2 min-h-[260px] max-h-[320px] overflow-y-auto custom-scrollbar">
                {psHistory.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{line}</div>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                <span className="text-indigo-400 font-mono text-xs pl-2">PS&gt;</span>
                <input
                  type="text"
                  value={psInput}
                  onChange={(e) => setPsInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunPs()}
                  placeholder="Type PowerShell cmdlet..."
                  className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
                />
                <button
                  onClick={() => handleRunPs()}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl cursor-pointer"
                >
                  Exec
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
