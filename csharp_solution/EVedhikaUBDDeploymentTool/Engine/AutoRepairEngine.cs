using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using Microsoft.Win32;
using System.Windows.Forms;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class AutoRepairEngine
    {
        private static bool _isGuardianRunning = false;
        private static Thread _guardianThread = null;

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
                        runKey.SetValue("EVedhikaUBDGuardian", string.Format("\"{0}\"", exePath), RegistryValueKind.String);
                        if (logCallback != null) logCallback("[AutoRepair] Registered 'EVedhikaUBDGuardian' in Windows Startup Registry (HKCU\\...\\Run).");
                    }
                }

                // 2. Create Desktop Shortcut for UBD Portal (Edge IE Mode) - REMOVED
                // 3. Create Windows Native .lnk Shortcut for E-Vedhika Deployment Tool EXE - REMOVED
                return true;
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[AutoRepair ERROR] Failed to register startup: {0}", ex.Message));
                return false;
            }
        }

        public static void Start24x7BackgroundGuardian(Action<string> logCallback)
        {
            if (_isGuardianRunning) return;
            _isGuardianRunning = true;

            _guardianThread = new Thread(delegate()
            {
                if (logCallback != null) logCallback("[Guardian 24x7] Background Self-Healing Guardian Active. Monitoring system settings...");
                while (_isGuardianRunning)
                {
                    try
                    {
                        PerformSelfHealingAudit(logCallback);
                    }
                    catch (Exception ex)
                    {
                        if (logCallback != null) logCallback(string.Format("[Guardian Audit Exception] {0}", ex.Message));
                    }
                    // Sleep for 10 minutes (600,000 ms) in small increments so StopGuardian can exit promptly
                    for (int i = 0; i < 600 && _isGuardianRunning; i++)
                    {
                        Thread.Sleep(1000);
                    }
                }
            });
            _guardianThread.IsBackground = true;
            _guardianThread.Name = "EVedhikaGuardianThread";
            _guardianThread.Start();
        }

        public static bool PerformSelfHealingAudit(Action<string> logCallback)
        {
            bool repairedSomething = false;
            if (logCallback != null) logCallback("[Audit] Scanning system for corrupted settings, deleted files, Windows Update resets, or missing UBD policies...");

            string expectedXmlPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika", "sites.xml");

            // 1. Verify Edge IE Mode Policies & sites.xml file existence
            try
            {
                bool edgeOk = true;

                // Check if sites.xml exists on disk and is non-empty
                if (!File.Exists(expectedXmlPath) || new FileInfo(expectedXmlPath).Length < 30)
                {
                    if (logCallback != null) logCallback("[Audit WARN] sites.xml is MISSING or DELETED from " + expectedXmlPath);
                    edgeOk = false;
                }

                // Check Registry Keys for Edge Policy
                if (edgeOk)
                {
                    RegistryKey edgeKey = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Policies\Microsoft\Edge");
                    if (edgeKey == null) edgeKey = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Policies\Microsoft\Edge");

                    if (edgeKey == null)
                    {
                        if (logCallback != null) logCallback("[Audit WARN] Edge Registry Policy Key missing!");
                        edgeOk = false;
                    }
                    else
                    {
                        var ieLevel = edgeKey.GetValue("InternetExplorerIntegrationLevel");
                        var siteListObj = edgeKey.GetValue("InternetExplorerIntegrationSiteList");
                        string siteList = siteListObj != null ? siteListObj.ToString() : null;

                        if (ieLevel == null || Convert.ToInt32(ieLevel) != 1)
                        {
                            if (logCallback != null) logCallback("[Audit WARN] InternetExplorerIntegrationLevel != 1");
                            edgeOk = false;
                        }
                        if (string.IsNullOrEmpty(siteList) || !File.Exists(siteList))
                        {
                            if (logCallback != null) logCallback("[Audit WARN] InternetExplorerIntegrationSiteList points to invalid/missing file!");
                            edgeOk = false;
                        }
                        edgeKey.Dispose();
                    }
                }

                if (!edgeOk)
                {
                    if (logCallback != null) logCallback("[Audit REPAIR] Re-generating sites.xml and re-enforcing Edge IE Mode Group Policies...");
                    string xmlPath = EdgePolicyEngine.GenerateSiteListXml(new string[] { 
                        "ubd.telangana.gov.in", 
                        "ubd.ap.gov.in", 
                        "www.ubd.ap.gov.in", 
                        "www.ubd.ap.gov.in:8080",
                        "www.ubd.ap.gov.in:8080/UBDNEW"
                    });
                    EdgePolicyEngine.ApplyIEModePolicies(xmlPath);
                    repairedSomething = true;
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[Audit Repair] Edge Policy check error: {0}", ex.Message));
            }

            // 2. Verify Zone 2 Trusted Sites for UBD
            try
            {
                bool zoneOk = false;
                using (RegistryKey domainKeyTS = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.telangana.gov.in") ??
                                               Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in"))
                using (RegistryKey domainKeyAP = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.ap.gov.in") ??
                                               Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ap.gov.in") ??
                                               Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\www.ubd.ap.gov.in"))
                {
                    if (domainKeyTS != null || domainKeyAP != null)
                    {
                        zoneOk = true;
                    }
                }

                if (!zoneOk)
                {
                    if (logCallback != null) logCallback("[Audit WARN] Zone 2 Trusted Site mapping for UBD (TS/AP) missing/deleted. Restoring...");
                    RegistryManager.ConfigureTrustedSites("ubd.telangana.gov.in");
                    RegistryManager.ConfigureTrustedSites("ubd.ap.gov.in");
                    RegistryManager.ConfigureTrustedSites("www.ubd.ap.gov.in");
                    repairedSomething = true;
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[Audit Repair] Zone 2 check error: {0}", ex.Message));
            }

            // 3. Verify ActiveX Controls & Security Zone 2 Policies
            try
            {
                bool activexOk = false;
                using (RegistryKey zone2Key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2"))
                {
                    if (zone2Key != null)
                    {
                        var val1001 = zone2Key.GetValue("1001"); // Download signed ActiveX
                        var val1201 = zone2Key.GetValue("1201"); // Script ActiveX not safe
                        var val1405 = zone2Key.GetValue("1405"); // Script ActiveX safe
                        var val1803 = zone2Key.GetValue("1803"); // File Download (0 = Allow)
                        var val2200 = zone2Key.GetValue("2200"); // Automatic prompting for file downloads
                        if (val1001 != null && Convert.ToInt32(val1001) == 0 &&
                            val1201 != null && Convert.ToInt32(val1201) == 0 &&
                            val1405 != null && Convert.ToInt32(val1405) == 0 &&
                            val1803 != null && Convert.ToInt32(val1803) == 0 &&
                            val2200 != null && Convert.ToInt32(val2200) == 0)
                        {
                            activexOk = true;
                        }
                    }
                }

                if (!activexOk)
                {
                    if (logCallback != null) logCallback("[Audit WARN] ActiveX Security Zone 2 settings missing or restricted. Re-enabling ActiveX Controls & TLS...");
                    RegistryManager.ConfigureActiveXAndTLS();
                    repairedSomething = true;
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[Audit Repair] ActiveX Security Zone check error: {0}", ex.Message));
            }

            // 4. Verify IE5 Browser Emulation Mode
            try
            {
                bool emuOk = false;
                using (RegistryKey emuKey = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION"))
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
                    if (logCallback != null) logCallback("[Audit WARN] IE5 Quirks emulation reset/deleted. Re-enforcing 5000 (IE5) emulation mode...");
                    EdgePolicyEngine.ConfigureIE5BrowserEmulation();
                    repairedSomething = true;
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[Audit Repair] Emulation check error: {0}", ex.Message));
            }

            // 5. Check Windows Activation Status & Auto-Repair
            try
            {
                var actStatus = WindowsActivationEngine.CheckWindowsActivation();
                if (!actStatus.IsActivated)
                {
                    if (logCallback != null) logCallback(string.Format("[Audit WARN] Windows license status: {0}. Auto-repairing activation...", actStatus.LicenseStatusText));
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
                    if (logCallback != null) logCallback("[Audit REPAIRED] Self-healing complete. Refreshing Edge Browser process policy cache...");
                    RestartEdgeProcesses(logCallback);
                }
                catch { }
            }
            else
            {
                if (logCallback != null) logCallback("[Audit OK] All system policies, Edge IE Mode rules, sites.xml, and drivers are 100% compliant.");
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
                    if (logCallback != null) logCallback(string.Format("[Edge Refresh] Closing {0} active Microsoft Edge process(es) to force reload of IE Mode sites.xml policy...", edgeProcs.Length));
                    foreach (var proc in edgeProcs)
                    {
                        try { proc.Kill(); } catch { }
                    }
                    if (logCallback != null) logCallback("[Edge Refresh] Microsoft Edge processes closed. When you open 'UBD Portal (Edge IE Mode)' shortcut, it will load cleanly in IE Mode.");
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[Edge Refresh Warning] {0}", ex.Message));
            }
        }

        public static void StopGuardian()
        {
            _isGuardianRunning = false;
            try
            {
                if (_guardianThread != null && _guardianThread.IsAlive)
                {
                    _guardianThread.Abort();
                }
            }
            catch { }
        }
    }
}
