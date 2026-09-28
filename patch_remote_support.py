import re

with open("src/components/RemoteSupportView.tsx", "r") as f:
    content = f.read()

# 1. Update RemoteSession Interface
old_interface = """interface RemoteSession {
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
}"""

new_interface = """interface RemoteSession {
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
}"""
content = content.replace(old_interface, new_interface)

# 2. Update initial activeSession state
old_state = """  const [activeSession, setActiveSession] = useState<RemoteSession>({
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
    ieModeActive: true
  });"""

new_state = """  const [activeSession, setActiveSession] = useState<RemoteSession>({
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
  }, []);"""
content = content.replace(old_state, new_state)

# 3. Update the Badge
old_badge = """<span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  ● ACTIVE LIVE
                </span>"""

new_badge = """{activeSession.isOnline ? (
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
                )}"""
content = content.replace(old_badge, new_badge)

with open("src/components/RemoteSupportView.tsx", "w") as f:
    f.write(content)
print("Patched RemoteSupportView.tsx")
