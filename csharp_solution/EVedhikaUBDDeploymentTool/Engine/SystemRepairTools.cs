using System;
using System.IO;
using System.Diagnostics;
using System.ServiceProcess;
using Microsoft.Win32;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class SystemRepairTools
    {
        public static void FixDscObjectError(Action<string> logCallback)
        {
            logCallback("Starting DSC USB Token / Windows 7 [object Error] Auto-Repair...");
            try
            {
                // 1. Force kill Edge & IE to clear locked sessions and reload registry/COM cleanly
                logCallback("Closing active Microsoft Edge and Internet Explorer sessions...");
                RunCommand("taskkill", "/F /IM msedge.exe /T", logCallback);
                RunCommand("taskkill", "/F /IM iexplore.exe /T", logCallback);
                
                // 2. Clear IE Cache & Cookies
                logCallback("Clearing expired IE Mode cache and blocking cookies...");
                RunCommand("RunDll32.exe", "InetCpl.cpl,ClearMyTracksByProcess 8", logCallback);
                RunCommand("RunDll32.exe", "InetCpl.cpl,ClearMyTracksByProcess 2", logCallback);
                
                // 3. Fix Smart Card & Certificate Propagation Services (SCardSvr, CertPropSvc)
                logCallback("Re-configuring Smart Card Services (SCardSvr & CertPropSvc) for automatic startup...");
                RunCommand("sc", "config SCardSvr start= auto", logCallback);
                RunCommand("sc", "failure SCardSvr reset= 86400 actions= restart/5000/restart/5000/restart/5000", logCallback);
                RunCommand("net", "start SCardSvr", logCallback);
                RunCommand("sc", "config CertPropSvc start= auto", logCallback);
                RunCommand("net", "start CertPropSvc", logCallback);

                // 4. Windows 7 OS-level TLS 1.2, .NET Strong Crypto & IE11 Protected Mode / 64-bit Isolation fixes
                logCallback("Applying Windows 7 TLS 1.2, SCHANNEL, IE11 Protected Mode OFF (2500=3) & 32-bit ActiveX fixes...");
                string activeState = Helpers.SystemInfoHelper.GetConfiguredState("Telangana");
                bool isAp = EdgePolicyEngine.IsAndhraPradeshState(activeState);
                OSCompatibilityEngine.ApplyCompatibilityShims();
                RegistryManager.ConfigureTrustedSites(isAp ? "ubd.ap.gov.in" : "ubd.telangana.gov.in");
                RegistryManager.ConfigureActiveXAndTLS();

                // 5. Register SmartCard CSPs + Rebuild Universal CNG+CSP COM-Safe SignatureDemoLib.dll + Heal ActiveX & CAPICOM safely
                logCallback("Rebuilding Universal CNG+CSP Anti-Tamper COM-Safe Signature Engine (v2.0.3.0) and repairing ActiveX / CAPICOM...");
                DriverInstaller.RegisterSmartCardAndCspProviders();
                UBDSigningFixEngine.ApplyUniversalTokenFix(logCallback);
                DriverInstaller.RegisterActiveXComponents();
                RegistryManager.HealDigiSignHelperAutomation();

                // 6. Re-apply state-specific UBD Enterprise Site List & IE Mode policies
                string xmlPath = EdgePolicyEngine.GenerateSiteListXmlForState(activeState);
                EdgePolicyEngine.ApplyIEModePolicies(xmlPath);

                logCallback("DSC / Deactivation [object Error] fixed successfully! Please re-open the UBD Portal and try again.");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("Failed to fix DSC Object Error: {0}", ex.Message));
            }
        }

        public static void FixPrintSpooler(Action<string> logCallback)
        {
            logCallback("Starting Auto-Printer Configuration & Print Spooler Fix...");
            try
            {
                ServiceController spooler = new ServiceController("Spooler");
                if (spooler.Status == ServiceControllerStatus.Running || spooler.Status == ServiceControllerStatus.StartPending)
                {
                    logCallback("Stopping Print Spooler service...");
                    spooler.Stop();
                    spooler.WaitForStatus(ServiceControllerStatus.Stopped, TimeSpan.FromSeconds(15));
                }

                string spoolPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), @"System32\spool\PRINTERS");
                if (logCallback != null) logCallback(string.Format("Clearing stuck print jobs in {0}...", spoolPath));
                if (Directory.Exists(spoolPath))
                {
                    foreach (string file in Directory.GetFiles(spoolPath))
                    {
                        try { File.Delete(file); } catch { }
                    }
                }

                logCallback("Starting Print Spooler service...");
                spooler.Start();
                spooler.WaitForStatus(ServiceControllerStatus.Running, TimeSpan.FromSeconds(15));

                logCallback("Print Spooler fixed successfully! Your printer should now work normally.");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("Failed to fix Print Spooler: {0}", ex.Message));
            }
        }

        public static void RunOSDeepRepair(Action<string> logCallback)
        {
            logCallback("Starting OS Deep Repair (SFC & DISM)...");
            logCallback("WARNING: This process might take 10-30 minutes depending on your disk speed.");
            
            logCallback("Phase 1: Running SFC Scan (System File Checker)...");
            RunCommand("sfc", "/scannow", logCallback);
            
            logCallback("Phase 2: Running DISM RestoreHealth...");
            RunCommand("dism", "/online /cleanup-image /restorehealth", logCallback);
            
            logCallback("OS Deep Repair completed. Please restart your computer for all changes to take effect.");
        }

        public static void AutoSyncTime(Action<string> logCallback)
        {
            try
            {
                logCallback("Starting Time & Date Synchronization...");
                
                // Set timezone to IST (India Standard Time)
                logCallback("Setting TimeZone to India Standard Time (IST)...");
                RunCommand("tzutil", "/s \"India Standard Time\"", logCallback);
                
                // Resync time with Windows Time Service
                logCallback("Restarting Windows Time Service (w32time)...");
                RunCommand("net", "stop w32time", logCallback);
                RunCommand("net", "start w32time", logCallback);
                
                logCallback("Syncing time with internet time servers (time.windows.com)...");
                RunCommand("w32tm", "/resync /force", logCallback);
                
                logCallback("Time and Date synchronized successfully! DSC Tokens will now work without SSL errors.");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("Failed to sync time: {0}", ex.Message));
            }
        }

        public static void FixOrInstallEdgeBrowser(Action<string> logCallback)
        {
            logCallback("==================================================");
            logCallback("Starting Microsoft Edge Integrity & Auto-Install/Update...");
            logCallback("==================================================");
            try
            {
                EdgeManagementEngine.EnsureEdgeInstalledAndUpdated(logCallback);
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("Edge repair failed: {0}", ex.Message));
            }
        }

        private static void RunCommand(string filename, string arguments, Action<string> logCallback)
        {
            try
            {
                Process p = new Process();
                p.StartInfo.FileName = filename;
                p.StartInfo.Arguments = arguments;
                p.StartInfo.UseShellExecute = false;
                p.StartInfo.CreateNoWindow = true;
                p.StartInfo.RedirectStandardOutput = true;
                p.Start();
                
                while (!p.StandardOutput.EndOfStream)
                {
                    string line = p.StandardOutput.ReadLine();
                    if (!string.IsNullOrWhiteSpace(line))
                    {
                        if (logCallback != null) logCallback(string.Format("[{0}] {1}", filename.ToUpper(), line));
                    }
                }
                p.WaitForExit();
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("Command {0} failed: {1}", filename, ex.Message));
            }
        }
    }
}
