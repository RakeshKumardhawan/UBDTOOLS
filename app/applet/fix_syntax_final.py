import os
import re

def fix_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace common lambda patterns with explicit delegates
    content = content.replace('SafeInvoke(() => {', 'SafeInvoke(delegate() {')
    content = content.replace('SafeInvoke(() =>', 'SafeInvoke(delegate() {') # Tricky, might need closing brace
    
    # Specific ones for MainForm.cs
    content = content.replace('ThreadPool.QueueUserWorkItem((state) =>', 'ThreadPool.QueueUserWorkItem(delegate(object state)')
    content = content.replace('AutoRepairEngine.PerformSelfHealingAudit((msg) =>', 'AutoRepairEngine.PerformSelfHealingAudit(delegate(string msg)')
    content = content.replace('Engine.WindowsActivationEngine.AutoActivateWindows((msg) =>', 'Engine.WindowsActivationEngine.AutoActivateWindows(delegate(string msg)')
    content = content.replace('PCBoostEngine.OptimizeSystem((msg) =>', 'PCBoostEngine.OptimizeSystem(delegate(string msg)')
    content = content.replace('Engine.SystemRepairTools.FixPrintSpooler((msg) =>', 'Engine.SystemRepairTools.FixPrintSpooler(delegate(string msg)')
    content = content.replace('Engine.SystemRepairTools.RunOSDeepRepair((msg) =>', 'Engine.SystemRepairTools.RunOSDeepRepair(delegate(string msg)')
    content = content.replace('Engine.SystemRepairTools.AutoSyncTime((msg) =>', 'Engine.SystemRepairTools.AutoSyncTime(delegate(string msg)')
    content = content.replace('Engine.SystemRepairTools.FixOrInstallEdgeBrowser((msg) =>', 'Engine.SystemRepairTools.FixOrInstallEdgeBrowser(delegate(string msg)')
    content = content.replace('UninstallEngine.PerformFullUninstall((msg) =>', 'UninstallEngine.PerformFullUninstall(delegate(string msg)')
    content = content.replace('AutoUpdateEngine.CheckForUpdates((msg) =>', 'AutoUpdateEngine.CheckForUpdates(delegate(string msg)')
    
    content = content.replace('(s, ev) =>', 'delegate(object s, EventArgs ev)')
    content = content.replace('(s, args) =>', 'delegate(object s, EventArgs args)')
    content = content.replace('(msg) => { }', 'delegate(string msg) { }')
    content = content.replace('(state2) =>', 'delegate(object state2)')
    content = content.replace('(msg) => LogMessage', 'delegate(string msg) { LogMessage')
    content = content.replace('(msg) => SafeInvoke', 'delegate(string msg) { SafeInvoke')
    content = content.replace('(progress) =>', 'delegate(int progress)')
    content = content.replace('(sender, e) =>', 'delegate(object sender, EventArgs e)')
    content = content.replace('(s, e) =>', 'delegate(object s, EventArgs e)')
    content = content.replace('(hWnd, lParam) =>', 'delegate(IntPtr hWnd, IntPtr lParam)')
    
    # Simple regex for one-line SafeInvoke(() => something());
    # content = re.sub(r'SafeInvoke\(delegate\(\) \{ ([^;{]+)\);', r'SafeInvoke(delegate() { \1; });', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filepath}")

# List of files to fix
files = [
    '/app/applet/csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs',
    '/app/applet/csharp_solution/EVedhikaUBDDeploymentTool/Program.cs',
    '/app/applet/csharp_solution/EVedhikaUBDDeploymentTool/PCBoostEngine.cs',
    '/app/applet/csharp_solution/EVedhikaUBDDeploymentTool/Engine/AutoUpdateEngine.cs',
    '/app/applet/csharp_solution/EVedhikaUBDDeploymentTool/Helpers/DscVerificationHelper.cs'
]

for f in files:
    fix_file(f)
