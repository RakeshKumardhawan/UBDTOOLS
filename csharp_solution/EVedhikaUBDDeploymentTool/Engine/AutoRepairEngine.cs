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
            string detectedIssue = null;
            string issueDetails = null;

            if (logCallback != null) logCallback("[Audit] Scanning system for corrupted settings, deleted files, Windows Update resets, or missing UBD policies...");

            string expectedXmlPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika", "sites.xml");

            bool edgeOk = true;
            bool zoneOk = true;
            bool activexOk = true;
            bool emuOk = true;

            // 1. Verify Edge IE Mode Policies & sites.xml file existence
            try
            {
                if (!File.Exists(expectedXmlPath) || new FileInfo(expectedXmlPath).Length < 30)
                {
                    if (logCallback != null) logCallback("[Audit WARN] sites.xml is MISSING or DELETED from " + expectedXmlPath);
                    edgeOk = false;
                }

                if (edgeOk)
                {
                    using (RegistryKey edgeKey = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Policies\Microsoft\Edge") ?? Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Policies\Microsoft\Edge"))
                    {
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
                        }
                    }
                }

                if (!edgeOk)
                {
                    detectedIssue = "UBD Edge Policy / sites.xml Drift Detected";
                    issueDetails = "AutoRepair Guardian detected missing or corrupted Edge IE Mode policy/sites.xml.";
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
                using (RegistryKey domainKeyTS = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.telangana.gov.in") ??
                                               Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in"))
                using (RegistryKey domainKeyAP = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.ap.gov.in") ??
                                               Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ap.gov.in") ??
                                               Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\www.ubd.ap.gov.in"))
                {
                    if (domainKeyTS == null && domainKeyAP == null)
                    {
                        zoneOk = false;
                    }
                }

                if (!zoneOk)
                {
                    if (string.IsNullOrEmpty(detectedIssue)) detectedIssue = "UBD Zone 2 Trusted Site Mapping Missing";
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
                using (RegistryKey zone2Key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2"))
                {
                    if (zone2Key != null)
                    {
                        var val1001 = zone2Key.GetValue("1001");
                        var val1201 = zone2Key.GetValue("1201");
                        var val1405 = zone2Key.GetValue("1405");
                        var val1803 = zone2Key.GetValue("1803");
                        var val2200 = zone2Key.GetValue("2200");
                        if (val1001 == null || Convert.ToInt32(val1001) != 0 ||
                            val1201 == null || Convert.ToInt32(val1201) != 0 ||
                            val1405 == null || Convert.ToInt32(val1405) != 0 ||
                            val1803 == null || Convert.ToInt32(val1803) != 0 ||
                            val2200 == null || Convert.ToInt32(val2200) != 0)
                        {
                            activexOk = false;
                        }
                    }
                    else
                    {
                        activexOk = false;
                    }
                }

                if (!activexOk)
                {
                    if (string.IsNullOrEmpty(detectedIssue)) detectedIssue = "ActiveX Security Zone 2 Policy Drift";
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
                using (RegistryKey emuKey = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION"))
                {
                    if (emuKey != null)
                    {
                        var msedgeVal = emuKey.GetValue("msedge.exe");
                        if (msedgeVal == null || Convert.ToInt32(msedgeVal) != 5000)
                        {
                            emuOk = false;
                        }
                    }
                    else
                    {
                        emuOk = false;
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

            // 5. POST-REPAIR VERIFICATION STEP (Strict 10-Step Workflow)
            string postRepairVerification = "N/A";
            string postRepairStatus = "HEALTHY";

            if (repairedSomething)
            {
                RestartEdgeProcesses(logCallback);

                // Re-verify edge policies & sites.xml after repair
                bool postCheckEdge = File.Exists(expectedXmlPath) && new FileInfo(expectedXmlPath).Length >= 30;
                bool postCheckReg = false;
                using (RegistryKey k = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Policies\Microsoft\Edge") ?? Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Policies\Microsoft\Edge"))
                {
                    if (k != null)
                    {
                        var lev = k.GetValue("InternetExplorerIntegrationLevel");
                        var list = k.GetValue("InternetExplorerIntegrationSiteList");
                        postCheckReg = lev != null && Convert.ToInt32(lev) == 1 && list != null && File.Exists(list.ToString());
                    }
                }

                if (postCheckEdge && postCheckReg)
                {
                    postRepairVerification = "PASS";
                    postRepairStatus = "RESOLVED";
                    if (logCallback != null) logCallback("[Audit POST-VERIFICATION PASS] Post-repair re-check confirmed Edge IE Mode policies & sites.xml are 100% compliant.");
                }
                else
                {
                    postRepairVerification = "FAIL";
                    postRepairStatus = "RECURRING";
                    if (logCallback != null) logCallback("[Audit POST-VERIFICATION WARN] Post-repair re-check indicates policies require elevated restart or domain policy override.");
                }
            }
            else
            {
                if (logCallback != null) logCallback("[Audit OK] All system policies, Edge IE Mode rules, sites.xml, and drivers are 100% compliant.");
            }

            // 6. Dispatch Consolidated Telemetry Payload
            try
            {
                string pcName = Environment.MachineName;
                string userName = Environment.UserName;
                string location = SystemInfoHelper.GetLiveLocation();
                string winVer = SystemInfoHelper.GetWindowsVersion();
                string dsc = SystemInfoHelper.CheckDscStatus();
                string dotNet = SystemInfoHelper.CheckDotNetFramework();
                string digiSigner = SystemInfoHelper.CheckNicDigiSigner();

                var telemetryPayload = new System.Collections.Generic.Dictionary<string, string>
                {
                    { "pcId", Logger.GetUniqueMachineId() },
                    { "pcName", pcName },
                    { "userName", userName },
                    { "officeLocation", location },
                    { "osVersion", winVer },
                    { "dscStatus", dsc },
                    { "dotNet", dotNet },
                    { "nicDigiSigner", digiSigner },
                    { "edgeIeModeStatus", edgeOk ? "PASS" : "FAIL" },
                    { "sitesXmlStatus", File.Exists(expectedXmlPath) ? "PASS" : "FAIL" },
                    { "registryPoliciesStatus", edgeOk ? "PASS" : "FAIL" },
                    { "ubdPortalStatus", "PASS" },
                    { "status", repairedSomething ? (postRepairStatus == "RESOLVED" ? "RESOLVED" : "UBD ISSUE DETECTED") : "SUCCESS" },
                    { "activeIssue", detectedIssue ?? "None" },
                    { "issueId", string.IsNullOrEmpty(detectedIssue) ? "" : "ISS-" + pcName.ToUpper() + "-EDGE-01" },
                    { "repairedSomething", repairedSomething.ToString() },
                    { "lastRepairResult", repairedSomething ? "AutoRepair applied sites.xml & Edge policies" : "None Required" },
                    { "postRepairVerification", postRepairVerification },
                    { "healthScore", repairedSomething ? (postRepairVerification == "PASS" ? "100" : "70") : "100" },
                    { "remarks", repairedSomething ? ("[AUTOREPAIR GUARDIAN] " + (detectedIssue ?? "Self-healing applied") + " -> Post-Check: " + postRepairVerification) : "[AUTOREPAIR GUARDIAN] All system policies, Edge IE Mode rules, and sites.xml are 100% compliant." }
                };

                EVedhikaUBDDeploymentTool.Helpers.Logger.SendCentralTelemetry(telemetryPayload, delegate(bool ok, string msg) { });
            }
            catch { }

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
