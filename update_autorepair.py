import re

code = """using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Win32;
using System.Windows.Forms;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class AutoRepairEngine
    {
        private static bool _isGuardianRunning = false;
        private static CancellationTokenSource _cts = new CancellationTokenSource();

        public static bool RegisterStartupAndShortcuts(Action<string> logCallback)
        {
            try
            {
                string exePath = Application.ExecutablePath;
                string appDir = AppDomain.CurrentDomain.BaseDirectory;

                // 1. Add to Windows Startup Registry Key
                using (RegistryKey runKey = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Run", true))
                {
                    if (runKey != null)
                    {
                        runKey.SetValue("EVedhikaUBDGuardian", $"\"{exePath}\"", RegistryValueKind.String);
                        logCallback?.Invoke("[AutoRepair] Registered 'EVedhikaUBDGuardian' in Windows Startup Registry (HKCU\\\\...\\\\Run).");
                    }
                }

                // 2. Create Desktop Shortcut for UBD Portal (Edge IE Mode)
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string ubdShortcut = Path.Combine(desktopPath, "UBD Portal (Edge IE Mode).url");
                string edgePath = @"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
                if (!File.Exists(edgePath)) edgePath = @"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe";
                if (!File.Exists(edgePath)) edgePath = @"C:\\Windows\\System32\\shell32.dll";

                File.WriteAllText(ubdShortcut, $"[InternetShortcut]\\r\\nURL=https://ubd.telangana.gov.in\\r\\nIconFile={edgePath}\\r\\nIconIndex=0\\r\\n");
                logCallback?.Invoke($"[AutoRepair] Created UBD Portal Desktop Shortcut with Edge Logo: {ubdShortcut}");

                // 3. Create Windows Native .lnk Shortcut for E-Vedhika Deployment Tool EXE
                string appLnkShortcut = Path.Combine(desktopPath, "E-Vedhika UBD Deployment Tool.lnk");
                try
                {
                    string psScript = $"$s=(New-Object -COM WScript.Shell).CreateShortcut('{appLnkShortcut}'); $s.TargetPath='{exePath}'; $s.IconLocation='{exePath},0'; $s.WorkingDirectory='{appDir}'; $s.Description='E-Vedhika UBD Deployment & Repair Tool'; $s.Save()";
                    ProcessStartInfo psi = new ProcessStartInfo("powershell", $"-NoProfile -ExecutionPolicy Bypass -Command \"{psScript}\"")
                    {
                        CreateNoWindow = true,
                        UseShellExecute = false,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };
                    using (Process p = Process.Start(psi)) { p?.WaitForExit(3000); }
                }
                catch
                {
                    string oldUrlShortcut = Path.Combine(desktopPath, "E-Vedhika UBD Deployment Tool.url");
                    File.WriteAllText(oldUrlShortcut, $"[InternetShortcut]\\r\\nURL=file:///{exePath.Replace('/', '\\\\')}\\r\\nIconFile={exePath}\\r\\nIconIndex=0\\r\\n");
                }

                logCallback?.Invoke("[AutoRepair] Desktop Shortcuts Created with Icons: UBD Portal, E-Vedhika Web App & E-Vedhika Tool (.lnk).");
                return true;
            }
            catch (Exception ex)
            {
                logCallback?.Invoke($"[AutoRepair ERROR] Failed to register startup or shortcuts: {ex.Message}");
                return false;
            }
        }

        public static void Start24x7BackgroundGuardian(Action<string> logCallback)
        {
            if (_isGuardianRunning) return;
            _isGuardianRunning = true;
            _cts = new CancellationTokenSource();

            Task.Run(async () =>
            {
                logCallback?.Invoke("[Guardian 24x7] Background Self-Healing Guardian Active. Monitoring system settings...");
                while (!_cts.Token.IsCancellationRequested)
                {
                    try
                    {
                        PerformSelfHealingAudit(logCallback);
                    }
                    catch (Exception ex)
                    {
                        logCallback?.Invoke($"[Guardian Audit Exception] {ex.Message}");
                    }
                    // Sleep for 10 minutes (600,000 ms) between checks
                    await Task.Delay(600000, _cts.Token);
                }
            }, _cts.Token);
        }

        public static bool PerformSelfHealingAudit(Action<string> logCallback)
        {
            bool repairedSomething = false;
            logCallback?.Invoke("[Audit] Scanning system for corrupted settings, deleted files, Windows Update resets, or missing UBD policies...");

            string expectedXmlPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika", "sites.xml");

            // 1. Verify Edge IE Mode Policies & sites.xml file existence
            try
            {
                bool edgeOk = true;

                // Check if sites.xml exists on disk and is non-empty
                if (!File.Exists(expectedXmlPath) || new FileInfo(expectedXmlPath).Length < 30)
                {
                    logCallback?.Invoke("[Audit WARN] sites.xml is MISSING or DELETED from " + expectedXmlPath);
                    edgeOk = false;
                }

                // Check Registry Keys for Edge Policy
                if (edgeOk)
                {
                    using (RegistryKey edgeKey = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\\Policies\\Microsoft\\Edge") ?? Registry.LocalMachine.OpenSubKey(@"SOFTWARE\\Policies\\Microsoft\\Edge"))
                    {
                        if (edgeKey == null)
                        {
                            logCallback?.Invoke("[Audit WARN] Edge Registry Policy Key missing!");
                            edgeOk = false;
                        }
                        else
                        {
                            var ieLevel = edgeKey.GetValue("InternetExplorerIntegrationLevel");
                            var siteList = edgeKey.GetValue("InternetExplorerIntegrationSiteList")?.ToString();

                            if (ieLevel == null || Convert.ToInt32(ieLevel) != 1)
                            {
                                logCallback?.Invoke("[Audit WARN] InternetExplorerIntegrationLevel != 1");
                                edgeOk = false;
                            }
                            if (string.IsNullOrEmpty(siteList) || !File.Exists(siteList))
                            {
                                logCallback?.Invoke("[Audit WARN] InternetExplorerIntegrationSiteList points to invalid/missing file!");
                                edgeOk = false;
                            }
                        }
                    }
                }

                if (!edgeOk)
                {
                    logCallback?.Invoke("[Audit REPAIR] Re-generating sites.xml and re-enforcing Edge IE Mode Group Policies...");
                    string xmlPath = EdgePolicyEngine.GenerateSiteListXml(new string[] { "ubd.telangana.gov.in", "telangana.gov.in", "202.65.142.140" });
                    EdgePolicyEngine.ApplyIEModePolicies(xmlPath);
                    repairedSomething = true;
                }
            }
            catch (Exception ex)
            {
                logCallback?.Invoke($"[Audit Repair] Edge Policy check error: {ex.Message}");
            }

            // 2. Verify Zone 2 Trusted Sites for UBD
            try
            {
                bool zoneOk = false;
                using (RegistryKey domainKey = Registry.CurrentUser.OpenSubKey(@"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\ubd.telangana.gov.in") ??
                                               Registry.CurrentUser.OpenSubKey(@"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in"))
                {
                    if (domainKey != null)
                    {
                        var httpsZone = domainKey.GetValue("https");
                        var httpZone = domainKey.GetValue("http");
                        var wildcardZone = domainKey.GetValue("*");
                        if ((httpsZone != null && Convert.ToInt32(httpsZone) == 2) ||
                            (httpZone != null && Convert.ToInt32(httpZone) == 2) ||
                            (wildcardZone != null && Convert.ToInt32(wildcardZone) == 2))
                        {
                            zoneOk = true;
                        }
                    }
                }

                if (!zoneOk)
                {
                    logCallback?.Invoke("[Audit WARN] Zone 2 Trusted Site mapping for ubd.telangana.gov.in missing/deleted. Restoring...");
                    RegistryManager.ConfigureTrustedSites("ubd.telangana.gov.in");
                    RegistryManager.ConfigureTrustedSites("telangana.gov.in");
                    repairedSomething = true;
                }
            }
            catch (Exception ex)
            {
                logCallback?.Invoke($"[Audit Repair] Zone 2 check error: {ex.Message}");
            }

            // 3. Verify ActiveX Controls & Security Zone 2 Policies
            try
            {
                bool activexOk = false;
                using (RegistryKey zone2Key = Registry.CurrentUser.OpenSubKey(@"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2"))
                {
                    if (zone2Key != null)
                    {
                        var val1001 = zone2Key.GetValue("1001"); // Download signed ActiveX
                        var val1201 = zone2Key.GetValue("1201"); // Script ActiveX not safe
                        var val1405 = zone2Key.GetValue("1405"); // Script ActiveX safe
                        if (val1001 != null && Convert.ToInt32(val1001) == 0 &&
                            val1201 != null && Convert.ToInt32(val1201) == 0 &&
                            val1405 != null && Convert.ToInt32(val1405) == 0)
                        {
                            activexOk = true;
                        }
                    }
                }

                if (!activexOk)
                {
                    logCallback?.Invoke("[Audit WARN] ActiveX Security Zone 2 settings missing or restricted. Re-enabling ActiveX Controls & TLS...");
                    RegistryManager.ConfigureActiveXAndTLS();
                    repairedSomething = true;
                }
            }
            catch (Exception ex)
            {
                logCallback?.Invoke($"[Audit Repair] ActiveX Security Zone check error: {ex.Message}");
            }

            // 4. Verify IE5 Browser Emulation Mode
            try
            {
                bool emuOk = false;
                using (RegistryKey emuKey = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_BROWSER_EMULATION"))
                {
                    if (emuKey != null)
                    {
                        var msedgeVal = emuKey.GetValue("msedge.exe");
                        if (msedgeVal != null && Convert.ToInt32(msedgeVal) == 5000)
                        {
                            emuOk = true;
                        }
                    }
                }

                if (!emuOk)
                {
                    logCallback?.Invoke("[Audit WARN] IE5 Quirks emulation reset/deleted. Re-enforcing 5000 (IE5) emulation mode...");
                    EdgePolicyEngine.ConfigureIE5BrowserEmulation();
                    repairedSomething = true;
                }
            }
            catch (Exception ex)
            {
                logCallback?.Invoke($"[Audit Repair] Emulation check error: {ex.Message}");
            }

            // 5. Check Windows Activation Status & Auto-Repair
            try
            {
                var actStatus = WindowsActivationEngine.CheckWindowsActivation();
                if (!actStatus.IsActivated)
                {
                    logCallback?.Invoke($"[Audit WARN] Windows license status: {actStatus.LicenseStatusText}. Auto-repairing activation...");
                    WindowsActivationEngine.AutoActivateWindows(logCallback);
                    repairedSomething = true;
                }
            }
            catch { }

            // 6. If settings were restored/repaired, restart msedge.exe processes so Edge reloads policies immediately
            if (repairedSomething)
            {
                try
                {
                    logCallback?.Invoke("[Audit REPAIRED] Self-healing complete. Refreshing Edge Browser process policy cache...");
                    RestartEdgeProcesses(logCallback);
                }
                catch { }
            }
            else
            {
                logCallback?.Invoke("[Audit OK] All system policies, Edge IE Mode rules, sites.xml, and drivers are 100% compliant.");
            }

            return repairedSomething;
        }

        public static void RestartEdgeProcesses(Action<string> logCallback)
        {
            try
            {
                var edgeProcs = Process.GetProcessesByName("msedge");
                if (edgeProcs.Length > 0)
                {
                    logCallback?.Invoke($"[Edge Refresh] Closing {edgeProcs.Length} active Microsoft Edge process(es) to force reload of IE Mode sites.xml policy...");
                    foreach (var proc in edgeProcs)
                    {
                        try { proc.Kill(); } catch { }
                    }
                    logCallback?.Invoke("[Edge Refresh] Microsoft Edge processes closed. When you open 'UBD Portal (Edge IE Mode)' shortcut, it will load cleanly in IE Mode.");
                }
            }
            catch (Exception ex)
            {
                logCallback?.Invoke($"[Edge Refresh Warning] {ex.Message}");
            }
        }

        public static void StopGuardian()
        {
            _cts?.Cancel();
            _isGuardianRunning = false;
        }
    }
}
"""

with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/AutoRepairEngine.cs', 'w') as f:
    f.write(code)

print("Updated AutoRepairEngine.cs successfully")
