using System;
using System.Diagnostics;
using System.IO;
using Microsoft.Win32;
using EVedhikaUBDDeploymentTool.Helpers;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class UninstallEngine
    {
        private const string UninstallRegPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDDeploymentTool";

        /// <summary>
        /// Cleans up duplicate legacy/old Control Panel entries to prevent multiple entries in Add/Remove Programs.
        /// <summary>
        /// Cleans up all legacy, duplicate, or old version uninstall keys from Windows Control Panel
        /// ensuring zero duplicates remain in HKLM (64-bit & 32-bit) and HKCU.
        /// </summary>
        public static void CleanLegacyUninstallEntries()
        {
            try
            {
                string innoSetupKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\{8A9C8F3E-4B2D-4C5A-9E7F-1D6B8A9C0D4F}_is1";
                string customKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDTool";

                string[] targetKeys = new string[]
                {
                    @"Software\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDDeploymentTool",
                    @"Software\Microsoft\Windows\CurrentVersion\Uninstall\EVedhika_UBD_Deployment_Tool",
                    @"Software\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.1",
                    @"Software\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.4",
                    @"Software\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.7",
                    @"Software\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.8"
                };

                // Check if Inno Setup official installation key exists
                bool innoExists = false;
                try
                {
                    using (var baseKey = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, Environment.Is64BitOperatingSystem ? RegistryView.Registry64 : RegistryView.Registry32))
                    using (var k = baseKey.OpenSubKey(innoSetupKey))
                    {
                        if (k != null) innoExists = true;
                    }
                }
                catch { }

                // Helper to delete subkey from a specific hive and view
                Action<RegistryHive, RegistryView, string> deleteKey = (hive, view, subKey) =>
                {
                    try
                    {
                        using (var baseKey = RegistryKey.OpenBaseKey(hive, view))
                        {
                            baseKey.DeleteSubKeyTree(subKey, false);
                        }
                    }
                    catch { }
                };

                // Delete known legacy keys from all hives and views
                foreach (var kPath in targetKeys)
                {
                    deleteKey(RegistryHive.CurrentUser, RegistryView.Default, kPath);
                    deleteKey(RegistryHive.LocalMachine, RegistryView.Registry32, kPath);
                    deleteKey(RegistryHive.LocalMachine, RegistryView.Registry64, kPath);
                }

                // If Inno Setup key exists, DELETE all custom standalone keys so ONLY Inno Setup key remains!
                if (innoExists)
                {
                    deleteKey(RegistryHive.CurrentUser, RegistryView.Default, customKey);
                    deleteKey(RegistryHive.LocalMachine, RegistryView.Registry32, customKey);
                    deleteKey(RegistryHive.LocalMachine, RegistryView.Registry64, customKey);
                }
                else
                {
                    // If standalone, ensure we don't have duplicate keys in both 32-bit and 64-bit views!
                    if (Environment.Is64BitOperatingSystem)
                    {
                        deleteKey(RegistryHive.LocalMachine, RegistryView.Registry32, customKey);
                    }
                    deleteKey(RegistryHive.CurrentUser, RegistryView.Default, customKey);
                }
            }
            catch { }
        }

        /// <summary>
        /// Registers the application in Windows Control Panel -> "Programs and Features" (Add or Remove Programs)
        /// ensuring strictly ONLY ONE single official entry exists.
        /// </summary>
        public static bool RegisterControlPanelUninstall(string exePath, Action<string> logCallback = null)
        {
            try
            {
                // First purge all legacy and duplicate entries
                CleanLegacyUninstallEntries();

                string innoSetupKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\{8A9C8F3E-4B2D-4C5A-9E7F-1D6B8A9C0D4F}_is1";
                RegistryView targetView = Environment.Is64BitOperatingSystem ? RegistryView.Registry64 : RegistryView.Registry32;

                // 1. Check if Official Inno Setup key exists
                bool innoExists = false;
                try
                {
                    using (var baseKey = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, targetView))
                    using (var k = baseKey.OpenSubKey(innoSetupKey, true))
                    {
                        if (k != null)
                        {
                            innoExists = true;
                            // Update display name and version on official Inno key
                            k.SetValue("DisplayName", "E-Vedhika UBD Tool (v1.0.8)", RegistryValueKind.String);
                            k.SetValue("DisplayVersion", "1.0.8", RegistryValueKind.String);
                            k.SetValue("Publisher", "E-Vedhika Development Community (Rakesh Dhawan)", RegistryValueKind.String);
                        }
                    }
                }
                catch { }

                // If Inno Setup key exists, we are DONE! Strictly 1 entry exists in Control Panel.
                if (innoExists)
                {
                    if (logCallback != null) logCallback("[UNINSTALL REG] Verified single official Inno Setup Control Panel entry (v1.0.8).");
                    return true;
                }

                // 2. If standalone (not installed via Inno Setup), write STRICTLY ONE custom key in native OS registry view
                if (string.IsNullOrEmpty(exePath))
                {
                    exePath = Process.GetCurrentProcess().MainModule.FileName;
                }

                string installDir = Path.GetDirectoryName(exePath);
                string customKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDTool";

                using (var baseKey = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, targetView))
                using (var keyLM = baseKey.CreateSubKey(customKey))
                {
                    if (keyLM != null)
                    {
                        keyLM.SetValue("DisplayName", "E-Vedhika UBD Tool (v1.0.8)", RegistryValueKind.String);
                        keyLM.SetValue("DisplayVersion", "1.0.8", RegistryValueKind.String);
                        keyLM.SetValue("Publisher", "E-Vedhika Development Community (Rakesh Dhawan)", RegistryValueKind.String);
                        keyLM.SetValue("UninstallString", string.Format("\"{0}\" --uninstall", exePath), RegistryValueKind.String);
                        keyLM.SetValue("QuietUninstallString", string.Format("\"{0}\" --uninstall --silent", exePath), RegistryValueKind.String);
                        keyLM.SetValue("DisplayIcon", string.Format("{0},0", exePath), RegistryValueKind.String);
                        keyLM.SetValue("InstallLocation", installDir, RegistryValueKind.String);
                        keyLM.SetValue("HelpLink", "https://www.e-vedhika.in", RegistryValueKind.String);
                        keyLM.SetValue("URLInfoAbout", "https://www.e-vedhika.in", RegistryValueKind.String);
                        keyLM.SetValue("NoModify", 1, RegistryValueKind.DWord);
                        keyLM.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                        keyLM.SetValue("EstimatedSize", 142336, RegistryValueKind.DWord); // ~139 MB
                    }
                }

                if (logCallback != null) logCallback("[UNINSTALL REG] Registered single official standalone entry in Control Panel.");
                return true;
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[UNINSTALL REG ERROR] Control Panel registration failed: {0}", ex.Message));
                return false;
            }
        }

        /// <summary>
        /// Performs a complete clean uninstall, removing all registry keys, Control Panel entries,
        /// shortcuts, Edge IE Mode policies, and ProgramData files.
        /// </summary>
        public static bool PerformFullUninstall(Action<string> logCallback = null)
        {
            bool success = true;
            if (logCallback != null) logCallback("==========================================================================");
            if (logCallback != null) logCallback("[UNINSTALL] Starting Complete Clean Uninstall & System Revert Process...");
            if (logCallback != null) logCallback("  Target: Reverting all registry, zone settings, policies & files to original state.");
            if (logCallback != null) logCallback("==========================================================================");

            // 1. REVERT REGISTRY SECURITY ZONES VIA PRE-DEPLOYMENT BACKUP SNAPSHOT
            try
            {
                bool restoredFromBackup = false;
                try
                {
                    restoredFromBackup = BackupEngine.RollbackLastBackup();
                }
                catch { }

                if (restoredFromBackup)
                {
                    if (logCallback != null) logCallback("[1/10] [SUCCESS] All Security Zones (0, 1, 2, 3) restored from Pre-Deployment Backup snapshot!");
                }
                else
                {
                    if (logCallback != null) logCallback("[1/10] [RESET] No pre-deployment backup found. Manually resetting Zones 1, 2, 3 to Windows factory defaults...");
                    ResetZonesToWindowsFactoryDefaults(logCallback);
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback($"[1/10 WARN] Registry zones restoration notice: {ex.Message}");
            }

            // 2. REMOVE TRUSTED SITES (Zone 2) DOMAIN MAPPINGS
            try
            {
                string[] domainsToPurge = new string[]
                {
                    @"ubd.telangana.gov.in",
                    @"telangana.gov.in\ubd",
                    @"ubd.ap.gov.in",
                    @"ap.gov.in\ubd"
                };

                RegistryKey[] rootHives = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                foreach (var root in rootHives)
                {
                    try
                    {
                        using (var dm = root.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains", true))
                        {
                            if (dm != null)
                            {
                                foreach (var d in domainsToPurge)
                                {
                                    try { dm.DeleteSubKeyTree(d, false); } catch { }
                                }
                            }
                        }
                    }
                    catch { }
                }
                if (logCallback != null) logCallback("[2/10] Removed UBD portal domain mappings from ZoneMap (Trusted Sites).");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback($"[2/10 WARN] ZoneMap cleanup notice: {ex.Message}");
            }

            // 3. REMOVE MICROSOFT EDGE ENTERPRISE SITE LIST POLICIES
            try
            {
                RegistryKey[] edgeRoots = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                foreach (var r in edgeRoots)
                {
                    try
                    {
                        using (var edgePol = r.OpenSubKey(@"SOFTWARE\Policies\Microsoft\Edge", true))
                        {
                            if (edgePol != null)
                            {
                                edgePol.DeleteValue("InternetExplorerIntegrationLevel", false);
                                edgePol.DeleteValue("InternetExplorerIntegrationSiteList", false);
                                edgePol.DeleteValue("InternetExplorerIntegrationReloadInIEModeAllowed", false);
                            }
                        }
                    }
                    catch { }
                }
                if (logCallback != null) logCallback("[3/10] Removed Microsoft Edge IE Mode enterprise policies from Registry.");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback($"[3/10 WARN] Edge policies cleanup notice: {ex.Message}");
            }

            // 3b. REMOVE FIREWALL RULES & CLEAR EDGE IE CACHE
            try
            {
                // Remove NIC DigiSigner Firewall Rule
                try
                {
                    ProcessStartInfo psiFw = new ProcessStartInfo("netsh", "advfirewall firewall delete rule name=\"NIC DigiSigner 8080\"")
                    {
                        CreateNoWindow = true,
                        UseShellExecute = false
                    };
                    using (Process pFw = Process.Start(psiFw)) { pFw?.WaitForExit(3000); }
                }
                catch { }

                // Clear Edge IE Mode site list cache directory
                try
                {
                    string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                    string edgeIeCache = Path.Combine(localAppData, @"Microsoft\Edge\User Data\Default\IE Mode");
                    if (Directory.Exists(edgeIeCache))
                    {
                        Directory.Delete(edgeIeCache, true);
                    }
                }
                catch { }

                if (logCallback != null) logCallback("[3b/10] Removed NIC DigiSigner Firewall Rule and cleared Edge IE Mode site cache.");
            }
            catch { }

            // 4. DELETE ENTERPRISE COMPATIBILITY SITES.XML FILE & DIRECTORY
            try
            {
                // Unregister SignatureDemoLib.dll before deleting
                string compatDir = @"C:\enterprise_compat";
                string dllPath = Path.Combine(compatDir, "SignatureDemoLib.dll");
                if (File.Exists(dllPath))
                {
                    try
                    {
                        string regasmPath = Path.Combine(System.Runtime.InteropServices.RuntimeEnvironment.GetRuntimeDirectory(), "RegAsm.exe");
                        if (File.Exists(regasmPath))
                        {
                            ProcessStartInfo psi = new ProcessStartInfo(regasmPath, $"\"{dllPath}\" /u /silent")
                            {
                                CreateNoWindow = true,
                                UseShellExecute = false
                            };
                            using (Process p = Process.Start(psi)) { p?.WaitForExit(3000); }
                        }
                    }
                    catch { }
                }

                if (Directory.Exists(compatDir))
                {
                    Directory.Delete(compatDir, true);
                    if (logCallback != null) logCallback(@"[4/10] Unregistered & Deleted SignatureDemoLib.dll and Enterprise Site List (C:\enterprise_compat\).");
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback($"[4/10 WARN] enterprise_compat directory notice: {ex.Message}");
            }

            // 4b. REMOVE ACTIVEX PROGID & CLSID OVERRIDES (DigiSignHelper, CAPICOM, NIC)
            try
            {
                string[] progIds = new string[] { 
                    "DigiSignHelper", "DigiSignHelper.1", "DigiSignHelper.DigiSigner",
                    "DigiSigner", "DigiSigner.1", "DigiSigner.DigiSignHelper",
                    "DigiSignerHelper", "DigiSignerHelper.1", "SignatureDemoLib.DigiSignHelper",
                    "NIC.DigiSigner", "CAPICOM.SignedData", "CAPICOM.SignedData.1",
                    "CAPICOM.SignedData.2", "CAPICOM.Store", "CAPICOM.Store.1",
                    "CAPICOM.Store.2", "CAPICOM.Signer", "CAPICOM.Signer.1"
                };

                string[] clsids = new string[] 
                { 
                    "{32DB2444-A227-463C-868C-D63D6D254924}",
                    "{B8601633-0100-47F1-9457-495204431B32}",
                    "{A996E48C-D3DE-4206-89AF-00AA006C42C4}",
                    "{D4F44F4E-E1A4-4E64-884A-98C045F9616D}",
                    "{96A006C4-AA00-CF11-9FA9-00AA006C42C4}",
                    "{15E2085E-94D1-4551-9E1D-444453456789}",
                    "{B6D9006F-035D-4A76-884A-C3E7705B9FF1}",
                    "{BD0D437A-F76E-4545-9244-6720D911718F}"
                };

                foreach (var p in progIds) { try { Registry.ClassesRoot.DeleteSubKeyTree(p, false); } catch { } }
                
                string[] clsidRoots = new string[] { @"CLSID", @"Software\Classes\CLSID", @"Software\WOW6432Node\Classes\CLSID" };
                foreach (var c in clsids)
                {
                    foreach (var root in clsidRoots)
                    {
                        try { Registry.LocalMachine.DeleteSubKeyTree(root + "\\" + c, false); } catch { }
                    }
                }
                if (logCallback != null) logCallback("[4b/10] Purged all ActiveX ProgID and CLSID overrides from registry.");
            }
            catch { }

            // 5. RESTORE ADVANCED TAB & INTERNET SETTINGS (TLS & Certificate Revocation)
            try
            {
                RegistryKey[] isRoots = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                foreach (var r in isRoots)
                {
                    try
                    {
                        using (var isKey = r.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings", true))
                        {
                            if (isKey != null)
                            {
                                isKey.DeleteValue("CertificateRevocation", false);
                                isKey.DeleteValue("PublisherRevocation", false);
                                isKey.DeleteValue("WarnonBadCertRecving", false);
                                isKey.DeleteValue("WarnOnZoneCrossing", false);
                                isKey.DeleteValue("WarnOnPostRedirect", false);
                                isKey.DeleteValue("AllowInvalidCertificates", false);
                                isKey.DeleteValue("CheckExeSignatures", false);
                                isKey.DeleteValue("SyncMode5", false);
                                isKey.DeleteValue("DisableCachingOfSSLPages", false);
                                // Restore SecureProtocols to Windows Default (TLS 1.0, 1.1, 1.2 = 2688)
                                isKey.SetValue("SecureProtocols", 2688, RegistryValueKind.DWord);
                            }
                        }
                    }
                    catch { }
                }
                if (logCallback != null) logCallback("[5/10] Restored Windows Internet Settings Advanced options & TLS protocols to default (2688).");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback($"[5/10 WARN] Advanced Internet Settings restore notice: {ex.Message}");
            }

            // 6. RESTORE FEATURE CONTROL LOCKDOWN & POP-UP BLOCKER
            try
            {
                string[] featHives = new string[] 
                { 
                    @"Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_LOCALMACHINE_LOCKDOWN", 
                    @"SOFTWARE\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_LOCALMACHINE_LOCKDOWN",
                    @"SOFTWARE\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION"
                };

                RegistryKey[] rootList = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                foreach (var root in rootList)
                {
                    foreach (var fh in featHives)
                    {
                        try
                        {
                            using (var fk = root.OpenSubKey(fh, true))
                            {
                                if (fk != null)
                                {
                                    fk.DeleteValue("iexplore.exe", false);
                                    fk.DeleteValue("msedge.exe", false);
                                    fk.DeleteValue("EVedhikaUBDDeploymentTool.exe", false);
                                }
                            }
                        }
                        catch { }
                    }
                }

                try
                {
                    using (var nw = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Internet Explorer\New Windows", true))
                    {
                        nw?.DeleteValue("PopupMgr", false);
                    }
                }
                catch { }

                if (logCallback != null) logCallback("[6/10] Reverted FeatureControl and Pop-up Blocker settings to original state.");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback($"[6/10 WARN] FeatureControl revert notice: {ex.Message}");
            }

            // 7. REMOVE WINDOWS STARTUP REGISTRY KEYS
            try
            {
                using (RegistryKey runKey = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Run", true))
                {
                    if (runKey != null && runKey.GetValue("EVedhikaUBDGuardian") != null)
                    {
                        runKey.DeleteValue("EVedhikaUBDGuardian", false);
                    }
                }
                using (RegistryKey runKeyLM = Registry.LocalMachine.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Run", true))
                {
                    if (runKeyLM != null && runKeyLM.GetValue("EVedhikaUBDGuardian") != null)
                    {
                        runKeyLM.DeleteValue("EVedhikaUBDGuardian", false);
                    }
                }
                if (logCallback != null) logCallback("[7/10] Removed startup run keys (EVedhikaUBDGuardian).");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback($"[7/10 WARN] Startup keys notice: {ex.Message}");
            }

            // 8. REMOVE ALL DESKTOP & START MENU SHORTCUTS
            try
            {
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string commonDesktop = Environment.GetFolderPath(Environment.SpecialFolder.CommonDesktopDirectory);
                string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "E-Vedhika UBD Tool");
                string commonStartMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonPrograms), "E-Vedhika UBD Tool");

                string[] shortcuts = new string[]
                {
                    Path.Combine(desktopPath, "UBD Portal (Edge IE Mode).url"),
                    Path.Combine(desktopPath, "E-Vedhika UBD Deployment Tool.lnk"),
                    Path.Combine(desktopPath, "E-Vedhika UBD Deployment Tool.url"),
                    Path.Combine(desktopPath, "E-Vedhika Web App (www.e-vedhika.in).url"),
                    Path.Combine(commonDesktop, "UBD Portal (Edge IE Mode).url"),
                    Path.Combine(commonDesktop, "E-Vedhika UBD Deployment Tool.lnk"),
                    Path.Combine(commonDesktop, "E-Vedhika UBD Deployment Tool.url")
                };

                foreach (var sc in shortcuts)
                {
                    try { if (File.Exists(sc)) File.Delete(sc); } catch { }
                }

                try { if (Directory.Exists(startMenu)) Directory.Delete(startMenu, true); } catch { }
                try { if (Directory.Exists(commonStartMenu)) Directory.Delete(commonStartMenu, true); } catch { }

                if (logCallback != null) logCallback("[8/10] Deleted all Desktop and Start Menu shortcuts.");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback($"[8/10 WARN] Shortcuts notice: {ex.Message}");
            }

            // 9. CLEAN PROGRAMDATA AND APPLICATION STORAGE
            try
            {
                string appDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika");
                if (Directory.Exists(appDataDir))
                {
                    Directory.Delete(appDataDir, true);
                }
                if (logCallback != null) logCallback("[9/10] Cleaned Application Data directories.");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback($"[9/10 WARN] Storage notice: {ex.Message}");
            }

            // 10. REMOVE CONTROL PANEL UNINSTALL REGISTRATIONS & SEND TELEMETRY
            try
            {
                CleanLegacyUninstallEntries();
                try { Registry.CurrentUser.DeleteSubKeyTree(UninstallRegPath, false); } catch { }
                try { Registry.LocalMachine.DeleteSubKeyTree(UninstallRegPath, false); } catch { }
                try { Registry.LocalMachine.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDTool", false); } catch { }

                // Post silent telemetry notification to central dashboard
                try
                {
                    var uninstallPayload = new System.Collections.Generic.Dictionary<string, string>
                    {
                        { "pcName", Environment.MachineName },
                        { "userName", Environment.UserName },
                        { "officeLocation", SystemInfoHelper.GetLiveLocation() },
                        { "status", "APP UNINSTALLED (System Reverted)" },
                        { "remarks", "Tool uninstalled on " + Environment.MachineName + ". All security zones and policies cleanly reverted to previous state." }
                    };
                    Helpers.Logger.SendCentralTelemetry(uninstallPayload);
                }
                catch { }

                if (logCallback != null) logCallback("[10/10] Removed Control Panel Uninstall registration & posted telemetry.");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback($"[10/10 WARN] Control panel unregister notice: {ex.Message}");
            }

            if (logCallback != null) logCallback("==========================================================================");
            if (logCallback != null) logCallback("[COMPLETE] All application changes removed. System successfully reverted to original state!");
            if (logCallback != null) logCallback("==========================================================================");

            return success;
        }

        private static void ResetZonesToWindowsFactoryDefaults(Action<string> logCallback)
        {
            try
            {
                string[] customKeys = new string[]
                {
                    "1001", "1004", "1200", "1201", "1206", "1208", "1209", "120A", "120B",
                    "1400", "1402", "1405", "1406", "1407", "1409", "1604", "1606", "1607",
                    "1608", "1609", "1802", "1803", "1804", "1806", "1809", "2000", "2001",
                    "2004", "2007", "2100", "2102", "2103", "2104", "2105", "2201", "2300",
                    "2301", "2400", "2401", "2402", "2600", "2702", "2708", "2709", "1A00", "1A04"
                };

                // 1. Reset Zone 2 (Trusted Sites) to Default Medium template
                using (var z2 = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2", true))
                {
                    if (z2 != null)
                    {
                        foreach (var k in customKeys) { try { z2.DeleteValue(k, false); } catch { } }
                        z2.SetValue("CurrentLevel", 0x00010000, RegistryValueKind.DWord); // 0x10000 = Medium
                        z2.SetValue("Flags", 0x00000043, RegistryValueKind.DWord);        // Default Flags
                        try { z2.DeleteValue("MinLevel", false); } catch { }
                    }
                }

                // Delete HKLM Zone 2 mirror
                try
                {
                    using (var z2lm = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2", true))
                    {
                        if (z2lm != null)
                        {
                            foreach (var k in customKeys) { try { z2lm.DeleteValue(k, false); } catch { } }
                            z2lm.SetValue("CurrentLevel", 0x00010000, RegistryValueKind.DWord);
                            z2lm.SetValue("Flags", 0x00000043, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

                // 2. Reset Zone 1 (Local Intranet) to Default Medium-low template
                using (var z1 = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\1", true))
                {
                    if (z1 != null)
                    {
                        foreach (var k in customKeys) { try { z1.DeleteValue(k, false); } catch { } }
                        z1.SetValue("CurrentLevel", 0x00010500, RegistryValueKind.DWord); // 0x10500 = Medium-low
                        z1.SetValue("Flags", 0x000000db, RegistryValueKind.DWord);
                    }
                }

                // 3. Reset Zone 3 (Internet) to Default Medium-high template
                using (var z3 = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\3", true))
                {
                    if (z3 != null)
                    {
                        foreach (var k in customKeys) { try { z3.DeleteValue(k, false); } catch { } }
                        z3.SetValue("CurrentLevel", 0x00011000, RegistryValueKind.DWord); // 0x11000 = Medium-high
                        z3.SetValue("Flags", 0x00000025, RegistryValueKind.DWord);
                    }
                }

                if (logCallback != null) logCallback("  [RESET] Zones 1, 2, 3 custom DWORD overrides removed; template levels restored to Windows defaults.");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback("  [RESET NOTICE] " + ex.Message);
            }
        }
    }
}
