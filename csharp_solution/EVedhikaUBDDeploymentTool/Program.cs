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
            // Immediate startup log to verify process launch on Win 7/8
            try {
                string startupLog = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "startup.log");
                string logMsg = string.Format("[{0}] Process started\nOS: {1}\nRuntime: {2}\nDir: {3}\n-------------------\n", 
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
                // Auto-Elevate to Administrator if launched without Admin rights
                if (!IsAdministrator())
                {
                    try
                    {
                        ProcessStartInfo proc = new ProcessStartInfo();
                        proc.UseShellExecute = true;
                        proc.WorkingDirectory = AppDomain.CurrentDomain.BaseDirectory;
                        proc.FileName = Application.ExecutablePath;
                        if (args != null && args.Length > 0)
                        {
                            proc.Arguments = string.Join(" ", args);
                        }
                        proc.Verb = "runas"; // Prompts Windows UAC for Administrator Elevation
                        Process.Start(proc);
                        return; // Exit non-admin process instance
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show(
                            "E-Vedhika UBD Deployment Tool requires Administrator privileges to configure ActiveX, IE Mode, and DSC Drivers.\n\n" +
                            "(ఈ అప్లికేషన్ రన్ కావడం కోసం Administrator అనుమతులు అవసరం. దయచేసి 'Yes' క్లిక్ చేసి Administrator అనుమతులు ఇవ్వండి.)\n\nDetail: " + ex.Message,
                            "Administrator Privileges Required",
                            MessageBoxButtons.OK,
                            MessageBoxIcon.Warning);
                        return; // Crucial: Exit process when UAC is denied to prevent non-admin crash
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
                
                // Configure TLS 1.2 for modern web API telemetry calls (.NET 4.8 compatibility)
                try
                {
                    System.Net.ServicePointManager.SecurityProtocol = (System.Net.SecurityProtocolType)3072 | (System.Net.SecurityProtocolType)768 | System.Net.SecurityProtocolType.Tls;
                    // Removed global SSL validation bypass to prevent MITM attacks. 
                    // Individual WebClient calls in Logger.cs handle their own validation if absolutely necessary for legacy servers.
                }
                catch { }

                // Check if launched from Inno Setup post-install hook
                if (args != null && args.Length > 0)
                {
                    string arg0 = args[0].Trim().ToLowerInvariant();
                    if (arg0 == "--post-install" || arg0 == "/postinstall" || arg0 == "-postinstall")
                    {
                        // NO report on installation alone. User requested reports ONLY after running 16-step deployment.
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
                string crashLogFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "EVedhika_CrashLog.txt");
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

        private static void SendSyncTelegramInstallNotification(string pcName, string userName, string location, string os, string dsc)
        {
            // All Telegram alerts are managed and controlled centrally via the website (www.e-vedhika.in)
            // to allow administrators full web-based ON/OFF control and prevent spam.
        }
    }
}
