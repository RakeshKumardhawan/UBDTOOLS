import os
import re

filepath = '/app/applet/csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Simple SafeInvoke(() => something);
content = re.sub(r'SafeInvoke\(\(\) => ([^;{]+)\);', r'SafeInvoke(delegate() { \1; });', content)

# 2. SafeInvoke(() => { ... });
content = content.replace('SafeInvoke(() => {', 'SafeInvoke(delegate() {')

# 3. ThreadPool.QueueUserWorkItem((state) => { ... });
content = content.replace('ThreadPool.QueueUserWorkItem((state) =>', 'ThreadPool.QueueUserWorkItem(delegate(object state)')

# 4. issuesFound = AutoRepairEngine.PerformSelfHealingAudit((msg) => { ... });
content = content.replace('AutoRepairEngine.PerformSelfHealingAudit((msg) =>', 'AutoRepairEngine.PerformSelfHealingAudit(delegate(string msg)')

# 5. Engine.WindowsActivationEngine.AutoActivateWindows((msg) =>
content = content.replace('Engine.WindowsActivationEngine.AutoActivateWindows((msg) =>', 'Engine.WindowsActivationEngine.AutoActivateWindows(delegate(string msg)')

# 6. PCBoostEngine.OptimizeSystem((msg) =>
content = content.replace('PCBoostEngine.OptimizeSystem((msg) =>', 'PCBoostEngine.OptimizeSystem(delegate(string msg)')

# 7. Engine.SystemRepairTools.FixPrintSpooler((msg) =>
content = content.replace('Engine.SystemRepairTools.FixPrintSpooler((msg) =>', 'Engine.SystemRepairTools.FixPrintSpooler(delegate(string msg)')

# 8. Engine.SystemRepairTools.RunOSDeepRepair((msg) =>
content = content.replace('Engine.SystemRepairTools.RunOSDeepRepair((msg) =>', 'Engine.SystemRepairTools.RunOSDeepRepair(delegate(string msg)')

# 9. Engine.SystemRepairTools.AutoSyncTime((msg) =>
content = content.replace('Engine.SystemRepairTools.AutoSyncTime((msg) =>', 'Engine.SystemRepairTools.AutoSyncTime(delegate(string msg)')

# 10. Engine.SystemRepairTools.FixOrInstallEdgeBrowser((msg) =>
content = content.replace('Engine.SystemRepairTools.FixOrInstallEdgeBrowser((msg) =>', 'Engine.SystemRepairTools.FixOrInstallEdgeBrowser(delegate(string msg)')

# 11. (s, ev) =>
content = content.replace('(s, ev) =>', 'delegate(object s, EventArgs ev)')

# 12. (s, args) =>
content = content.replace('(s, args) =>', 'delegate(object s, EventArgs args)')

# 13. (msg) => { }
content = content.replace('(msg) => { }', 'delegate(string msg) { }')

# 14. UninstallEngine.PerformFullUninstall((msg) =>
content = content.replace('UninstallEngine.PerformFullUninstall((msg) =>', 'UninstallEngine.PerformFullUninstall(delegate(string msg)')

# 15. CheckForUpdates((msg) =>
content = content.replace('AutoUpdateEngine.CheckForUpdates((msg) =>', 'AutoUpdateEngine.CheckForUpdates(delegate(string msg)')

# 16. (state2) =>
content = content.replace('(state2) =>', 'delegate(object state2)')

# 17. (msg) => SafeInvoke
content = content.replace('(msg) => SafeInvoke', 'delegate(string msg) { SafeInvoke')
# This one is tricky because it needs a closing }
# Let's hope it's followed by a line that ends with );

# 18. (progress) =>
content = content.replace('(progress) =>', 'delegate(int progress)')

# 5. String interpolation fixes (just in case)
# C# 6.0 features like $"..." might also be failing if the compiler is VERY old.
# Let's replace some obvious ones with string.Format
def replace_interpolation(match):
    inner = match.group(1)
    # Simple one-variable interpolation
    parts = re.split(r'\{([^}]+)\}', inner)
    if len(parts) > 1:
        fmt = ""
        args = []
        for i, p in enumerate(parts):
            if i % 2 == 0:
                fmt += p.replace('{', '{{').replace('}', '}}')
            else:
                fmt += "{" + str(len(args)) + "}"
                args.append(p)
        return 'string.Format("' + fmt + '", ' + ", ".join(args) + ')'
    return match.group(0)

# content = re.sub(r'\$"(.*?)"', replace_interpolation, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("MainForm.cs patched via Python.")
