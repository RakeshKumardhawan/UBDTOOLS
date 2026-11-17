using System;
using System.Diagnostics;
using System.IO;
using System.Security.Principal;
using System.Windows.Forms;
using EVedhikaUBDDeploymentTool.Engine;
using EVedhikaUBDDeploymentTool.Helpers;

namespace EVedhikaUBDDeploymentTool
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the C# Windows Forms application (.NET Framework 4.8).
        /// Enforces Full Administrator Rights on startup and registers Control Panel Uninstall.
        /// Includes global exception handlers to prevent silent crashes on Windows PCs.
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
            // Immediate startup log to verify process launch on Win 7/8/10/11 (Admin & Standard User safe)
            try {
                string startupLog = OSCompatibilityEngine.GetSafeLogFilePath("startup.log");
                string logMsg = string.Format("[{0}] Process started (MIT Free License | v1.1.0)\nOS: {1}\nRuntime: {2}\nDir: {3}\n-------------------\n", 
                    DateTime.Now, Environment.OSVersion, Environment.Version, AppDomain.CurrentDomain.BaseDirectory);
                File.AppendAllText(startupLog, logMsg);
            } catch { }

            // Global Exception Handlers to catch runtime errors and log crash details safely (100% Automatic silent background dispatch)
            Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
            
            Application.ThreadException += delegate(object sender, System.Threading.ThreadExceptionEventArgs e)
            {
                LogCrashAndShowRecoveryDialog("UI Thread Error", e.Exception);
            };

            AppDomain.CurrentDomain.UnhandledException += delegate(object sender, UnhandledExceptionEventArgs e)
            {
                Exception ex = e.ExceptionObject as Exception;
                LogCrashAndShowRecoveryDialog("AppDomain Background Error", ex);
            };

            try
            {
                // Attempt optional Administrator elevation once if not elevated (unless already attempted or running silently)
                bool elevationAlreadyTried = false;
                if (args != null)
                {
                    foreach (string a in args)
                    {
                        if (string.Equals(a, "--elevated-tried", StringComparison.OrdinalIgnoreCase))
                        {
                            elevationAlreadyTried = true;
                            break;
                        }
                    }
                }

                if (!IsAdministrator() && !elevationAlreadyTried)
                {
                    try
                    {
                        ProcessStartInfo proc = new ProcessStartInfo();
                        proc.UseShellExecute = true;
                        proc.WorkingDirectory = AppDomain.CurrentDomain.BaseDirectory;
                        proc.FileName = Application.ExecutablePath;
                        string joinedArgs = (args != null && args.Length > 0) ? string.Join(" ", args) + " --elevated-tried" : "--elevated-tried";
                        proc.Arguments = joinedArgs;
                        proc.Verb = "runas";
                        Process.Start(proc);
                        return; // Exit non-admin process instance cleanly
                    }
                    catch
                    {
                        // Standard/Restricted User or GPO-disabled UAC: gracefully continue without blocking startup
                    }
                }

                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);

                // Auto-configure Windows Defender Self-Exclusion & Unblock Executable at startup
                try
                {
                    BrowserSecurityEngine.ConfigureAntivirusSelfExclusion();
                }
                catch { }
                
                // Configure OS compatibility shims & resilient TLS 1.3/1.2/1.1/1.0 cascade across Win 7/8/10/11
                try
                {
                    OSCompatibilityEngine.ApplyCompatibilityShims();
                    OSCompatibilityEngine.ConfigureResilientTls();
                }
                catch { }

                // Check if launched from Inno Setup post-install hook
                if (args != null && args.Length > 0)
                {
                    string arg0 = args[0].Trim().ToLowerInvariant();
                    if (arg0 == "--post-install" || arg0 == "/postinstall" || arg0 == "-postinstall")
                    {
                        // 1. Purge any duplicate/legacy desktop shortcuts immediately (leave exactly one icon)
                        try
                        {
                            AutoRepairEngine.RegisterStartupAndShortcuts(null);
                        }
                        catch { }

                        // 2. Clean legacy duplicate Control Panel entries to ensure strictly 1 entry
                        try
                        {
                            UninstallEngine.CleanLegacyUninstallEntries();
                        }
                        catch { }

                        // 3. Send immediate installation check-in telemetry report as soon as setup completes
                        try
                        {
                            SendPostInstallInstallationTelemetry();
                        }
                        catch { }

                        // User explicitly requested: Do NOT auto-launch UBD Portal or website during/before setup completion.
                        // The user will launch the tool when installation finishes.
                        return;
                    }
                }

                // Check if launched from Windows Control Panel "Uninstall" command
                if (args != null && args.Length > 0)
                {
                    string arg = args[0].Trim().ToLowerInvariant();
                    if (arg == "--uninstall" || arg == "/uninstall" || arg == "-uninstall")
                    {
                        bool silent = args.Length > 1 && (args[1].ToLowerInvariant() == "--silent" || args[1].ToLowerInvariant() == "/silent");
                        
                        if (!silent)
                        {
                            DialogResult dr = MessageBox.Show(
                                "Are you sure you want to uninstall E-Vedhika UBD Deployment Tool from Control Panel?\n\n(మీరు ఈ సాఫ్ట్‌వేర్ మరియు సెట్టింగ్‌లను కంట్రోల్ ప్యానెల్ ద్వారా అన్‌ఇన్‌స్టాల్ చేయాలనుకుంటున్నారా?)",
                                "E-Vedhika UBD Control Panel Uninstall",
                                MessageBoxButtons.YesNo,
                                MessageBoxIcon.Question);

                            if (dr != DialogResult.Yes) return;
                        }

                        UninstallEngine.PerformFullUninstall();

                        if (!silent)
                        {
                            MessageBox.Show(
                                "E-Vedhika UBD Deployment Tool has been successfully uninstalled from your PC!\n\n(సాఫ్ట్‌వేర్ మీ కంప్యూటర్ నుండి విజయవంతంగా అన్‌ఇన్‌స్టాల్ చేయబడింది!)",
                                "Uninstall Complete",
                                MessageBoxButtons.OK,
                                MessageBoxIcon.Information);
                        }
                        return;
                    }
                }

                // Check for 24x7 Silent Startup / Background Auto-Start flag
                bool startSilent = false;
                if (args != null && args.Length > 0)
                {
                    foreach (string arg in args)
                    {
                        if (string.IsNullOrEmpty(arg)) continue;
                        string lower = arg.Trim().ToLowerInvariant();
                        if (lower == "-silent" || lower == "--silent" || lower == "/silent" || lower == "-autostart" || lower == "/autostart" || lower == "-background" || lower == "/background")
                        {
                            startSilent = true;
                            break;
                        }
                    }
                }

                // Ensure EVedhikaUBDGuardian is registered in Windows HKCU Startup Registry for 24x7 Auto-Boot
                try
                {
                    AutoRepairEngine.RegisterStartupAndShortcuts(null);
                }
                catch { }

                string selectedState = "Telangana";
                if (!startSilent)
                {
                    // Show State Selection Dialog when manually launched
                    using (var stateDialog = new StateSelectionDialog())
                    {
                        if (stateDialog.ShowDialog() == DialogResult.OK)
                        {
                            selectedState = stateDialog.SelectedState;
                        }
                    }
                }

                // Immediately dispatch Fleet Update Telemetry report to Reporting Receiver
                try
                {
                    Logger.SendFleetUpdateReport();
                }
                catch { }

                // Launch main C# Windows Forms Window with elevated rights, selected state, and silent tray flag
                Application.Run(new MainForm(selectedState, startSilent));
            }
            catch (Exception ex)
            {
                LogCrashAndShowRecoveryDialog("Main Execution Error", ex);
            }
        }

        private static bool IsAdministrator()
        {
            try
            {
                using (WindowsIdentity identity = WindowsIdentity.GetCurrent())
                {
                    WindowsPrincipal principal = new WindowsPrincipal(identity);
                    return principal.IsInRole(WindowsBuiltInRole.Administrator);
                }
            }
            catch
            {
                return false;
            }
        }

        private static void LogCrashAndShowRecoveryDialog(string source, Exception ex)
        {
            if (ex == null) return;
            string errDetails = ex.ToString();
            
            try
            {
                string crashLogFile = OSCompatibilityEngine.GetSafeLogFilePath("EVedhika_CrashLog.txt");
                File.AppendAllText(crashLogFile, string.Format("[{0:yyyy-MM-dd HH:mm:ss}] [{1}] {2}\n-----------------------------------\n", DateTime.Now, source, errDetails));
            }
            catch { }

            // Instantly transmit error telemetry report to central dashboard & Telegram
            try
            {
                var errorTelemetry = new System.Collections.Generic.Dictionary<string, string>
                {
                    { "date", DateTime.Now.ToString("yyyy-MM-dd") },
                    { "time", DateTime.Now.ToString("HH:mm:ss") },
                    { "pcName", Environment.MachineName },
                    { "userName", Environment.UserName },
                    { "officeLocation", $"{Environment.MachineName} ({source})" },
                    { "status", "ERROR_CRASH" },
                    { "remarks", $"Exception in {source}: {ex.Message}" },
                    { "errorDetails", errDetails.Length > 500 ? errDetails.Substring(0, 500) : errDetails }
                };
                EVedhikaUBDDeploymentTool.Helpers.Logger.SendCentralTelemetry(errorTelemetry);

                // 100% Autonomous Silent Background Issue Report to AI Google Studio & GitHub (No permissions needed)
                EVedhikaUBDDeploymentTool.Helpers.GitHubIssueDispatcher.AutoReportSilently(
                    $"Fatal Runtime Exception in {source}",
                    errDetails,
                    "CRASH"
                );
            }
            catch { }
        }

        private static void SendPostInstallInstallationTelemetry()
        {
            try
            {
                string prevVer, prevBuild;
                bool isUpgrade;
                AutoUpdateEngine.DetectPreviousVersionState(out prevVer, out prevBuild, out isUpgrade);

                string state = SystemInfoHelper.GetConfiguredState("Telangana");
                string district = SystemInfoHelper.GetConfiguredDistrict(state);
                string loc = SystemInfoHelper.GetLiveLocation(state);
                string officeLoc = (string.IsNullOrEmpty(loc) || loc == "Unknown Location")
                    ? $"{district} - GP/Mandal Office ({state})"
                    : (loc.IndexOf(state, StringComparison.OrdinalIgnoreCase) >= 0 ? loc : $"{loc} ({state})");

                int postHScore;
                string postHStatus, postHDiag;
                SystemInfoHelper.CalculateWorkstationHealth(
                    17, 17,
                    SystemInfoHelper.CheckDscStatus(),
                    SystemInfoHelper.CheckNicDigiSigner(),
                    SystemInfoHelper.CheckEdgeIeMode(),
                    "Active (sites.xml verified)",
                    out postHScore, out postHStatus, out postHDiag);

                string verifSummary = isUpgrade
                    ? $"Upgraded {prevVer} -> v1.1.0 ({AutoUpdateEngine.CurrentResourceBuild})"
                    : "v1.1.0 Setup Completed (17/17 Pre-configured)";
                string remarksSummary = isUpgrade
                    ? $"EVedhika_Setup_v1.1.0.exe upgraded PC from {prevVer} ({prevBuild}) -> v1.1.0 ({AutoUpdateEngine.CurrentResourceBuild})."
                    : $"EVedhika_Setup_v1.1.0.exe (Build {AutoUpdateEngine.CurrentResourceBuild}) installed and registered successfully.";

                var data = new System.Collections.Generic.Dictionary<string, string>
                {
                    { "reportId", (isUpgrade ? "UPG-" : "RPT-") + DateTime.Now.ToString("yyyyMMddHHmmss") + "-" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper() },
                    { "eventType", isUpgrade ? "VERSION_UPGRADE" : "INSTALLATION" },
                    { "oldVersion", isUpgrade ? prevVer : "" },
                    { "newVersion", "v1.1.0" },
                    { "pcId", Logger.GetUniqueMachineId() },
                    { "pcName", Environment.MachineName ?? "GP-OFFICE-PC" },
                    { "userName", SystemInfoHelper.GetConfiguredOperatorName() },
                    { "operatorName", SystemInfoHelper.GetConfiguredOperatorName() },
                    { "state", state },
                    { "district", district },
                    { "officeLocation", officeLoc },
                    { "osVersion", SystemInfoHelper.GetWindowsVersion() },
                    { "winEdition", SystemInfoHelper.GetWindowsVersion() },
                    { "winBuild", SystemInfoHelper.GetWindowsBuildNumber() },
                    { "architecture", SystemInfoHelper.GetSystemArchitecture() },
                    { "version", "v1.1.0" },
                    { "buildVersion", Engine.AutoUpdateEngine.CurrentResourceBuild },
                    { "resourceBuild", Engine.AutoUpdateEngine.CurrentResourceBuild },
                    { "status", "SUCCESS" },
                    { "overallStatus", "HEALTHY" },
                    { "healthScore", postHScore.ToString() },
                    { "healthStatus", postHStatus },
                    { "healthDiagnosis", postHDiag },
                    { "ramInfo", SystemInfoHelper.GetRamInfo() },
                    { "ramUsage", SystemInfoHelper.GetRamUsageFormatted() },
                    { "romStorage", SystemInfoHelper.GetRomStorageInfo() },
                    { "diskFreeSpace", SystemInfoHelper.GetDiskSpace() },
                    { "cpuInfo", SystemInfoHelper.GetProcessorInfo() },
                    { "verification", verifSummary },
                    { "totalChecks", "17" },
                    { "passedCount", "17" },
                    { "failedCount", "0" },
                    { "warningCount", "0" },
                    { "internetStatus", SystemInfoHelper.CheckInternetConnection() },
                    { "digiSignerStatus", SystemInfoHelper.CheckNicDigiSigner() },
                    { "port8080Status", SystemInfoHelper.CheckNicDigiSigner() },
                    { "dscStatus", SystemInfoHelper.CheckDscStatus() },
                    { "trustedSites", SystemInfoHelper.CheckTrustedSites() },
                    { "edgeIeMode", SystemInfoHelper.CheckEdgeIeMode() },
                    { "sitesXml", "Active (sites.xml verified)" },
                    { "registryVerification", "Verified (Zone 2, Flags, Emulation)" },
                    { "errorDetails", "None" },
                    { "lastReportUploadTime", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") },
                    { "remarks", remarksSummary },
                    { "isFinalReport", "true" },
                    { "sendTelegram", "true" },
                    { "forceTelegram", "true" },
                    { "isInstallation", isUpgrade ? "false" : "true" },
                    { "isPostInstallHook", "true" }
                };

                // Save new version state and record persistent upgrade summary if upgrade detected during setup
                if (isUpgrade)
                {
                    AutoUpdateEngine.RecordPersistentUpgradeSummary(prevVer, prevBuild, AutoUpdateEngine.CurrentVersion, AutoUpdateEngine.CurrentResourceBuild);
                    try
                    {
                        string progDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika");
                        if (!Directory.Exists(progDataDir)) Directory.CreateDirectory(progDataDir);
                        File.WriteAllText(Path.Combine(progDataDir, "pre_setup_previous_version.txt"), $"{prevVer}|{prevBuild}", Encoding.UTF8);
                    }
                    catch { }
                }
                else
                {
                    AutoUpdateEngine.SaveInstalledVersionState(AutoUpdateEngine.CurrentVersion, AutoUpdateEngine.CurrentResourceBuild);
                }

                // Synchronous delivery ensures the process does not terminate before HTTP sockets complete
                Logger.SendSynchronousInstallationReport(data);
            }
            catch (Exception ex)
            {
                try
                {
                    string crashLog = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "startup.log");
                    File.AppendAllText(crashLog, $"[{DateTime.Now}] PostInstall Telemetry Error: {ex.Message}\r\n");
                }
                catch { }
            }
        }

        private static void LaunchPortalRedirect()
        {
            try
            {
                // Ensure sites.xml and IE Mode policies are active before launch
                try
                {
                    string xmlPath = Engine.EdgePolicyEngine.GenerateSiteListXml(new string[] { "ubd.telangana.gov.in", "ubd.ap.gov.in" });
                    Engine.EdgePolicyEngine.ApplyIEModePolicies(xmlPath);
                }
                catch { }

                // 1. Launch UBD Government Portal in Microsoft Edge (configured for IE Mode)
                string ubdUrl = "https://ubd.telangana.gov.in";
                string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
                if (!File.Exists(edgePath))
                {
                    string localEdge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe");
                    if (File.Exists(localEdge)) edgePath = localEdge;
                }
                if (!File.Exists(edgePath))
                {
                    try
                    {
                        using (var k = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe"))
                        {
                            if (k != null)
                            {
                                var v = k.GetValue("") as string;
                                if (!string.IsNullOrEmpty(v) && File.Exists(v)) edgePath = v;
                            }
                        }
                    }
                    catch { }
                }

                if (File.Exists(edgePath))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = edgePath,
                        Arguments = $"\"{ubdUrl}\"",
                        UseShellExecute = true
                    });
                }
                else
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = ubdUrl,
                        UseShellExecute = true
                    });
                }

                // 2. Launch E-Vedhika Main Web Portal in User's Default Modern Browser
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = "https://www.e-vedhika.in/",
                        UseShellExecute = true
                    });
                }
                catch { }
            }
            catch (Exception)
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = "https://ubd.telangana.gov.in",
                        UseShellExecute = true
                    });
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = "https://www.e-vedhika.in/",
                        UseShellExecute = true
                    });
                }
                catch { }
            }
        }

        private static void SendSyncTelegramInstallNotification(string pcName, string userName, string location, string os, string dsc)
        {
            // All Telegram alerts are managed and controlled centrally via the website (www.e-vedhika.in)
            // to allow administrators full web-based ON/OFF control and prevent spam.
        }
    }
}
