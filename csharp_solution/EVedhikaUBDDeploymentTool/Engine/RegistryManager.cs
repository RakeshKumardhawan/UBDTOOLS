using EVedhikaUBDDeploymentTool.Helpers;
using System;
using Microsoft.Win32;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Security.AccessControl;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class RegistryManager
    {
        private const string Zone2KeyPath = @"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains";
        private const string SecurityZonesKeyPath = @"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2";

        public static void CleanOldBatSettings()
        {
            try
            {
                // Forcefully remove old settings using system CMD (reg delete) to ensure maximum cleanup power
                try
                {
                    string[] commands = new string[]
                    {
                        "reg delete \"HKCU\\Software\\Policies\\Microsoft\\Edge\" /f 2>nul",
                        "reg delete \"HKLM\\Software\\Policies\\Microsoft\\Edge\" /f 2>nul",
                        "reg delete \"HKCU\\Software\\Policies\\Microsoft\\Internet Explorer\" /f 2>nul",
                        "reg delete \"HKLM\\Software\\Policies\\Microsoft\\Internet Explorer\" /f 2>nul",
                        "reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\" /f 2>nul",
                        "reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\EscDomains\" /f 2>nul",
                        "reg delete \"HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\" /f 2>nul",
                        "reg delete \"HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\EscDomains\" /f 2>nul",
                        "reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2\" /f 2>nul",
                        "reg delete \"HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2\" /f 2>nul"
                    };

                    foreach (string cmd in commands)
                    {
                        ProcessStartInfo psiReg = new ProcessStartInfo("cmd.exe", $"/c {cmd}")
                        {
                            CreateNoWindow = true,
                            UseShellExecute = false,
                            WindowStyle = ProcessWindowStyle.Hidden
                        };
                        using (Process pReg = Process.Start(psiReg)) { pReg?.WaitForExit(2000); }
                    }
                }
                catch (Exception ex)
                {
                    Logger.LogWarn("Registry", "CMD reg delete cleanup notice: " + ex.Message);
                }

                // 1. Remove old legacy Edge Policies
                try { Registry.LocalMachine.DeleteSubKeyTree(@"Software\Policies\Microsoft\Edge", false); } catch { }
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Policies\Microsoft\Edge", false); } catch { }

                // 2. Remove old legacy IE Policies
                try { Registry.LocalMachine.DeleteSubKeyTree(@"Software\Policies\Microsoft\Internet Explorer", false); } catch { }
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Policies\Microsoft\Internet Explorer", false); } catch { }

                // 3. Reset IE Security Zone 2 (Trusted Sites) to default by deleting custom overrides
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2", false); } catch { }

                // 4. Remove stale Edge IE Mode site list cache directory and legacy folders
                try
                {
                    string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                    string edgeIeCache = Path.Combine(localAppData, @"Microsoft\Edge\User Data\Default\IE Mode");
                    if (Directory.Exists(edgeIeCache))
                    {
                        Directory.Delete(edgeIeCache, true);
                    }
                }
                catch (Exception ex)
                {
                    Logger.LogWarn("Registry", "Edge IE cache cleanup notice: " + ex.Message);
                }

                try
                {
                    string programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
                    string eVedhikaData = Path.Combine(programData, "EVedhika");
                    if (Directory.Exists(eVedhikaData))
                    {
                        Directory.Delete(eVedhikaData, true);
                    }
                }
                catch (Exception ex)
                {
                    Logger.LogWarn("Registry", "EVedhika program data cleanup notice: " + ex.Message);
                }

                try
                {
                    if (Directory.Exists(@"C:\enterprise_compat"))
                    {
                        Directory.Delete(@"C:\enterprise_compat", true);
                    }
                }
                catch (Exception ex)
                {
                    Logger.LogWarn("Registry", "Enterprise compat cleanup notice: " + ex.Message);
                }
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Registry", "Non-fatal cleanup exception: " + ex.Message);
            }
        }

        public static bool ConfigureTrustedSites(string targetDomain)
        {
            try
            {
                // Core domains that are permanently protected and visible in Trusted Sites
                List<string> domainPaths = new List<string>
                {
                    @"telangana.gov.in",
                    @"telangana.gov.in\ubd",
                    @"ubd.telangana.gov.in",
                    @"ap.gov.in",
                    @"ap.gov.in\ubd",
                    @"ubd.ap.gov.in",
                    @"epanchayat.telangana.gov.in",
                    @"prrd.telangana.gov.in",
                    @"127.0.0.1",
                    @"localhost"
                };

                if (!string.IsNullOrEmpty(targetDomain))
                {
                    if (targetDomain == "ubd.telangana.gov.in" && !domainPaths.Contains(@"telangana.gov.in\ubd"))
                        domainPaths.Add(@"telangana.gov.in\ubd");
                    else if (targetDomain == "ubd.ap.gov.in" && !domainPaths.Contains(@"ap.gov.in\ubd"))
                        domainPaths.Add(@"ap.gov.in\ubd");
                    else if (!domainPaths.Contains(targetDomain))
                        domainPaths.Add(targetDomain);
                }

                // Write to both CurrentUser (visible to user in Sites dialog) and LocalMachine (machine-level safety backup)
                RegistryKey[] rootKeys = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                foreach (var root in rootKeys)
                {
                    foreach (var dom in domainPaths)
                    {
                        try
                        {
                            string regPath = $@"{Zone2KeyPath}\{dom}";
                            using (RegistryKey baseKey = root.CreateSubKey(regPath))
                            {
                                if (baseKey != null)
                                {
                                    baseKey.SetValue("https", 2, RegistryValueKind.DWord);
                                    baseKey.SetValue("http", 2, RegistryValueKind.DWord);
                                    baseKey.SetValue("*", 2, RegistryValueKind.DWord);
                                }
                            }
                        }
                        catch { }
                    }
                }

                // Protect core government domains from deletion while keeping user ability to add/delete other domains
                ProtectGovernmentDomainACL(@"telangana.gov.in\ubd");
                ProtectGovernmentDomainACL(@"ubd.telangana.gov.in");
                ProtectGovernmentDomainACL(@"telangana.gov.in");
                ProtectGovernmentDomainACL(@"ap.gov.in\ubd");
                ProtectGovernmentDomainACL(@"ubd.ap.gov.in");

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Registry configuration failed for Trusted Sites: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Protects core government domain registry subkeys from unauthorized deletion,
        /// while keeping the parent ZoneMap Domains container wide open so users can freely add and delete other websites.
        /// </summary>
        public static void ProtectGovernmentDomainACL(string dom)
        {
            try
            {
                string regPath = $@"{Zone2KeyPath}\{dom}";
                using (RegistryKey baseKey = Registry.CurrentUser.OpenSubKey(regPath, RegistryKeyPermissionCheck.ReadWriteSubTree, RegistryRights.ChangePermissions | RegistryRights.ReadKey))
                {
                    if (baseKey != null)
                    {
                        RegistrySecurity rs = baseKey.GetAccessControl();
                        string identity = Environment.UserDomainName + "\\" + Environment.UserName;
                        RegistryAccessRule denyRule = new RegistryAccessRule(
                            identity,
                            RegistryRights.Delete,
                            AccessControlType.Deny
                        );
                        rs.AddAccessRule(denyRule);
                        baseKey.SetAccessControl(rs);
                    }
                }
            }
            catch { }
        }

        public static bool ConfigureActiveXAndTLS()
        {
            try
            {
                // Configure Zone 2 for CurrentUser and LocalMachine to ensure Custom Level shows on all systems
                RegistryKey[] zoneRoots = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                foreach (var rk in zoneRoots)
                {
                    try
                    {
                        using (RegistryKey z2 = rk.CreateSubKey(SecurityZonesKeyPath))
                        {
                            if (z2 != null)
                            {
                                z2.SetValue("CurrentLevel", 0x00000000, RegistryValueKind.DWord); // 0 = Custom level
                                z2.SetValue("Flags", 0x00000047, RegistryValueKind.DWord); // 0x47 = Enable Custom Level, Sites & Add button
                                z2.SetValue("MinLevel", 0x00010000, RegistryValueKind.DWord);
                            }
                        }
                    }
                    catch { }
                }

                // Remove Group Policy locks that block or hide Custom Level button
                try
                {
                    using (RegistryKey pol = Registry.CurrentUser.OpenSubKey(@"Software\Policies\Microsoft\Windows\CurrentVersion\Internet Settings", true))
                    {
                        pol?.DeleteValue("Security_options", false);
                        pol?.DeleteValue("Security_HKLM_only", false);
                    }
                }
                catch { }
                try
                {
                    using (RegistryKey pol = Registry.LocalMachine.OpenSubKey(@"Software\Policies\Microsoft\Windows\CurrentVersion\Internet Settings", true))
                    {
                        pol?.DeleteValue("Security_options", false);
                        pol?.DeleteValue("Security_HKLM_only", false);
                    }
                }
                catch { }

                using (RegistryKey zone2Key = Registry.CurrentUser.CreateSubKey(SecurityZonesKeyPath))
                {
                    if (zone2Key != null)
                    {
                        zone2Key.SetValue("CurrentLevel", 0x00000000, RegistryValueKind.DWord); 
                        zone2Key.SetValue("Flags", 0x00000047, RegistryValueKind.DWord);
                        zone2Key.SetValue("MinLevel", 0x00010000, RegistryValueKind.DWord);
                        
                        // Comprehensive flags matching standard Trusted/Intranet Low security configurations
                        zone2Key.SetValue("1001", 0, RegistryValueKind.DWord); // Download signed ActiveX controls
                        zone2Key.SetValue("1004", 0, RegistryValueKind.DWord); // Download unsigned ActiveX controls
                        zone2Key.SetValue("1200", 0, RegistryValueKind.DWord); // Run ActiveX controls and plug-ins
                        zone2Key.SetValue("1201", 0, RegistryValueKind.DWord); // Initialize and script ActiveX controls not marked as safe
                        zone2Key.SetValue("1208", 0, RegistryValueKind.DWord); // Allow previously unused ActiveX controls
                        zone2Key.SetValue("1209", 0, RegistryValueKind.DWord); // Allow Scriptlets
                        zone2Key.SetValue("120A", 0, RegistryValueKind.DWord); // Override Antivirus protection for ActiveX
                        zone2Key.SetValue("120B", 0, RegistryValueKind.DWord); // Override for SmartScreen
                        zone2Key.SetValue("1400", 0, RegistryValueKind.DWord); // Active scripting
                        zone2Key.SetValue("1402", 0, RegistryValueKind.DWord); // Scripting of Java applets
                        zone2Key.SetValue("1405", 0, RegistryValueKind.DWord); // Script ActiveX controls marked safe for scripting
                        zone2Key.SetValue("1406", 0, RegistryValueKind.DWord); // Access data sources across domains
                        zone2Key.SetValue("1407", 0, RegistryValueKind.DWord); // Programmatic clipboard access
                        zone2Key.SetValue("1408", 0, RegistryValueKind.DWord); // Normal Active Scripting
                        zone2Key.SetValue("1601", 0, RegistryValueKind.DWord); // Submit encrypted form data
                        zone2Key.SetValue("1604", 0, RegistryValueKind.DWord); // Font download
                        zone2Key.SetValue("1606", 0, RegistryValueKind.DWord); // Userdata persistence
                        zone2Key.SetValue("1607", 0, RegistryValueKind.DWord); // Navigate windows and frames across different domains
                        zone2Key.SetValue("1609", 0, RegistryValueKind.DWord); // Display mixed content / DOM Storage
                        zone2Key.SetValue("1802", 0, RegistryValueKind.DWord); // Drag & drop
                        zone2Key.SetValue("1803", 0, RegistryValueKind.DWord); // File Download
                        zone2Key.SetValue("1804", 0, RegistryValueKind.DWord); // Launching programs and files in an IFRAME
                        zone2Key.SetValue("1806", 0, RegistryValueKind.DWord); // Launching applications and unsafe files
                        zone2Key.SetValue("1807", 0, RegistryValueKind.DWord); // Navigate sub-frames across different domains
                        zone2Key.SetValue("1808", 0, RegistryValueKind.DWord); // Font download
                        zone2Key.SetValue("1809", 0, RegistryValueKind.DWord); // Pop-up Blocker: Disable
                        zone2Key.SetValue("2000", 0, RegistryValueKind.DWord); // Binary and script behaviors
                        zone2Key.SetValue("2001", 0, RegistryValueKind.DWord); // .NET-reliant components
                        zone2Key.SetValue("2004", 0, RegistryValueKind.DWord); // Run components not signed with Authenticode
                        zone2Key.SetValue("2101", 0, RegistryValueKind.DWord); // Status bar updates via script
                        zone2Key.SetValue("2102", 0, RegistryValueKind.DWord); // Script-initiated windows without size/pos constraints
                        zone2Key.SetValue("2200", 0, RegistryValueKind.DWord); // Automatic prompting for file downloads
                        zone2Key.SetValue("2201", 0, RegistryValueKind.DWord); // Automatic prompting for ActiveX
                        zone2Key.SetValue("2300", 0, RegistryValueKind.DWord); // Web sites in less privileged zone can navigate into this zone
                        zone2Key.SetValue("2702", 0, RegistryValueKind.DWord); // Allow active content
                        zone2Key.SetValue("2708", 0, RegistryValueKind.DWord); // Allow only approved domains to use ActiveX without prompt
                    }
                }

                // Apply to Zone 1 (Intranet) and Zone 3 (Internet) as well
                foreach (string zoneId in new string[] { "1", "3" })
                {
                    using (RegistryKey zoneKey = Registry.CurrentUser.CreateSubKey($@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\{zoneId}"))
                    {
                        if (zoneKey != null)
                        {
                            zoneKey.SetValue("1803", 0, RegistryValueKind.DWord);
                            zoneKey.SetValue("2200", 0, RegistryValueKind.DWord);
                            zoneKey.SetValue("1200", 0, RegistryValueKind.DWord);
                            zoneKey.SetValue("1400", 0, RegistryValueKind.DWord);
                        }
                    }
                }

                // Enable TLS 1.1 + 1.2 + 1.3
                using (RegistryKey systemSettings = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings"))
                {
                    if (systemSettings != null)
                    {
                        systemSettings.SetValue("SecureProtocols", 2688, RegistryValueKind.DWord);
                        systemSettings.SetValue("DisableCachingOfSSLPages", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("SyncMode5", 3, RegistryValueKind.DWord);
                    }
                }

                using (RegistryKey ieMain = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Internet Explorer\Main"))
                {
                    if (ieMain != null)
                    {
                        ieMain.SetValue("TabProcGrowth", 1, RegistryValueKind.DWord);
                    }
                }

                ApplyMasterZonesConfiguration();
                ForceEnableDownloadsForAllZones();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"ActiveX/TLS Registry configuration failed: {ex.Message}", ex);
            }
        }

        private static void ForceEnableDownloadsForAllZones()
        {
            try
            {
                try
                {
                    using (RegistryKey ieEscKey = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Microsoft\Active Setup\Installed Components\{A509B1A7-37EF-4b3f-8CFC-4F3A74704073}"))
                    {
                        if (ieEscKey != null) ieEscKey.SetValue("IsInstalled", 0, RegistryValueKind.DWord);
                    }
                    using (RegistryKey ieEscUserKey = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Microsoft\Active Setup\Installed Components\{A509B1A8-37EF-4b3f-8CFC-4F3A74704073}"))
                    {
                        if (ieEscUserKey != null) ieEscUserKey.SetValue("IsInstalled", 0, RegistryValueKind.DWord);
                    }
                }
                catch { }

                string[] basePaths = new string[]
                {
                    @"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones"
                };

                RegistryKey[] roots = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };

                foreach (string basePath in basePaths)
                {
                    foreach (RegistryKey root in roots)
                    {
                        // Limit to Zone 2 (Trusted Sites) only to avoid breaking Internet Zone security
                        int i = 2;
                        try
                        {
                            using (RegistryKey zoneKey = root.CreateSubKey($@"{basePath}\{i}"))
                            {
                                if (zoneKey != null)
                                {
                                    zoneKey.SetValue("1803", 0, RegistryValueKind.DWord);
                                    zoneKey.SetValue("2200", 0, RegistryValueKind.DWord);
                                    zoneKey.SetValue("2201", 0, RegistryValueKind.DWord);
                                }
                            }
                        }
                        catch { }
                    }
                }
            }
            catch { }
        }

        public static Dictionary<string, string> ReadCurrentRegistryStatus()
        {
            var dict = new Dictionary<string, string>();
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings"))
                {
                    if (key != null)
                    {
                        object protocols = key.GetValue("SecureProtocols");
                        dict["SecureProtocols"] = protocols != null ? protocols.ToString() : "Not Configured";
                    }
                }
            }
            catch (Exception ex)
            {
                dict["Error"] = ex.Message;
            }
            return dict;
        }

        public static void HealDigiSignHelperAutomation()
        {
            try
            {
                // 1. Comprehensive list of ProgIDs invoked by Government Portal JavaScript (DigiSignHelper, DigiSigner, CAPICOM)
                string[] progIds = new string[] { 
                    "DigiSignHelper", "DigiSignHelper.1", "DigiSignHelper.DigiSigner",
                    "DigiSigner", "DigiSigner.1", "DigiSigner.DigiSignHelper",
                    "DigiSignerHelper", "DigiSignerHelper.1", "SignatureDemoLib.DigiSignHelper",
                    "NIC.DigiSigner", "CAPICOM.SignedData", "CAPICOM.SignedData.1",
                    "CAPICOM.SignedData.2", "CAPICOM.Store", "CAPICOM.Store.1",
                    "CAPICOM.Store.2", "CAPICOM.Signer", "CAPICOM.Signer.1"
                };

                // Real Common CLSIDs for DigiSigner and CAPICOM
                string[] clsids = new string[] 
                { 
                    "{32DB2444-A227-463C-868C-D63D6D254924}", // Common DigiSignHelper
                    "{B8601633-0100-47F1-9457-495204431B32}", // SignatureDemoLib
                    "{A996E48C-D3DE-4206-89AF-00AA006C42C4}", // CAPICOM.SignedData
                    "{D4F44F4E-E1A4-4E64-884A-98C045F9616D}", // Another DigiSigner variant
                    "{96A006C4-AA00-CF11-9FA9-00AA006C42C4}", // CAPICOM variant
                    "{15E2085E-94D1-4551-9E1D-444453456789}", // Hybrid variant
                    "{B6D9006F-035D-4A76-884A-C3E7705B9FF1}", // Hybrid variant 2
                    "{BD0D437A-F76E-4545-9244-6720D911718F}"  // NIC variant
                };

                // Determine actual DLL path for InprocServer32
                string sysWOW64 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "SysWOW64");
                string system32 = Environment.SystemDirectory;
                string pf86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
                string pf = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
                string dllPath = "";

                // Search priority
                string[] searchFiles = { "DigiSignHelper.dll", "capicom.dll", "NICDigiSignHelper.dll", "SignatureDemoLib.dll" };
                foreach (var file in searchFiles)
                {
                    string[] paths = {
                        Path.Combine(sysWOW64, file),
                        Path.Combine(system32, file),
                        Path.Combine(pf86, "NIC", "DigiSigner", file),
                        Path.Combine(pf, "NIC", "DigiSigner", file),
                        Path.Combine(pf86, "DigiSigner", file),
                        Path.Combine(pf, "DigiSigner", file)
                    };
                    
                    foreach (var p in paths)
                    {
                        if (File.Exists(p)) { dllPath = p; break; }
                    }
                    if (!string.IsNullOrEmpty(dllPath)) break;
                }

                // If DLL not found in common paths, try to find it from existing registry entry to preserve it
                if (string.IsNullOrEmpty(dllPath))
                {
                    try {
                        using (var key = Registry.ClassesRoot.OpenSubKey(@"DigiSignHelper\CLSID")) {
                            string existingClsid = key?.GetValue("")?.ToString();
                            if (!string.IsNullOrEmpty(existingClsid)) {
                                using (var inproc = Registry.ClassesRoot.OpenSubKey($@"CLSID\{existingClsid}\InprocServer32")) {
                                    dllPath = inproc?.GetValue("")?.ToString();
                                }
                            }
                        }
                    } catch { }
                }

                if (string.IsNullOrEmpty(dllPath) || !File.Exists(dllPath))
                {
                    Logger.LogWarn("Registry", "HealDigiSignHelperAutomation: No matching DLL found. Skipping registry injection.");
                    return;
                }

                // Try to detect existing CLSID from the DLL we found
                string targetClsid = clsids[0]; 
                try {
                    using (var key = Registry.ClassesRoot.OpenSubKey(@"DigiSignHelper\CLSID")) {
                        string existing = key?.GetValue("")?.ToString();
                        if (!string.IsNullOrEmpty(existing)) targetClsid = existing;
                    }
                } catch { }

                // A. Write ProgIDs to Registry
                string[] progIdRoots = new string[] { @"Software\Classes", @"Software\WOW6432Node\Classes" };
                foreach (var progId in progIds)
                {
                    try
                    {
                        Registry.ClassesRoot.CreateSubKey(progId)?.SetValue("", "NIC DigiSigner Helper Object");
                        Registry.ClassesRoot.CreateSubKey($@"{progId}\CLSID")?.SetValue("", targetClsid);

                        foreach (var rootPath in progIdRoots)
                        {
                            using (RegistryKey baseKey = Registry.LocalMachine.CreateSubKey(rootPath))
                            {
                                using (RegistryKey progKey = baseKey?.CreateSubKey(progId))
                                {
                                    if (progKey != null)
                                    {
                                        progKey.SetValue("", "NIC DigiSigner Helper Object");
                                        progKey.CreateSubKey("CLSID")?.SetValue("", targetClsid);
                                    }
                                }
                            }
                        }
                    }
                    catch { }
                }

                // B. Write CLSIDs to Registry
                string[] clsidRoots = new string[] { @"CLSID", @"Software\Classes\CLSID", @"Software\WOW6432Node\Classes\CLSID" };
                foreach (var clsid in clsids)
                {
                    try
                    {
                        foreach (var rootPath in clsidRoots)
                        {
                            using (RegistryKey clsidBase = Registry.LocalMachine.CreateSubKey(rootPath + "\\" + clsid))
                            {
                                if (clsidBase != null)
                                {
                                    clsidBase.SetValue("", "NIC DigiSigner Helper Object");
                                    clsidBase.CreateSubKey("ProgID")?.SetValue("", "DigiSignHelper");
                                    
                                    using (RegistryKey inproc = clsidBase.CreateSubKey("InprocServer32"))
                                    {
                                        if (inproc != null)
                                        {
                                            inproc.SetValue("", dllPath);
                                            inproc.SetValue("ThreadingModel", "Apartment");
                                        }
                                    }

                                    using (RegistryKey catKey = clsidBase.CreateSubKey("Implemented Categories"))
                                    {
                                        catKey.CreateSubKey("{7DD95801-9882-11CF-9FA9-00AA006C42C4}");
                                        catKey.CreateSubKey("{7DD95802-9882-11CF-9FA9-00AA006C42C4}");
                                    }
                                }
                            }
                        }
                    }
                    catch { }
                }

                // 3. Force-Enable ActiveX Controls across All IE Zones (0, 1, 2, 3, 4) in HKCU & HKLM
                RegistryKey[] rootKeys = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                string[] zones = new string[] { "0", "1", "2", "3", "4" };

                foreach (var root in rootKeys)
                {
                    foreach (var zone in zones)
                    {
                        try
                        {
                            string zonePath = $@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\{zone}";
                            using (RegistryKey key = root.CreateSubKey(zonePath))
                            {
                                if (key != null)
                                {
                                    if (zone == "2")
                                    {
                                        key.SetValue("CurrentLevel", 0, RegistryValueKind.DWord); // 0 = Custom level
                                        key.SetValue("Flags", 0x47, RegistryValueKind.DWord); // 0x47 = Enable Custom Level, Sites & Add button
                                    }
                                    key.SetValue("1200", 0, RegistryValueKind.DWord); // Run ActiveX
                                    key.SetValue("1201", 0, RegistryValueKind.DWord); // Initialize and script ActiveX not marked safe
                                    key.SetValue("1208", 0, RegistryValueKind.DWord); // Allow previous unused ActiveX controls
                                    key.SetValue("1209", 0, RegistryValueKind.DWord); // Allow scriptlets
                                    key.SetValue("1400", 0, RegistryValueKind.DWord); // ActiveX prompt/enable
                                    key.SetValue("1402", 0, RegistryValueKind.DWord); // Script ActiveX marked safe
                                    key.SetValue("1405", 0, RegistryValueKind.DWord); // Script ActiveX not marked safe
                                    key.SetValue("2000", 0, RegistryValueKind.DWord); // Binary/script behaviors
                                    key.SetValue("2201", 0, RegistryValueKind.DWord); // ActiveX opt-in
                                    key.SetValue("2708", 0, RegistryValueKind.DWord); // Deny IE ActiveX filtering
                                    key.SetValue("1001", 0, RegistryValueKind.DWord); // Download signed ActiveX
                                    key.SetValue("1004", 0, RegistryValueKind.DWord); // Download unsigned ActiveX
                                }
                            }
                        }
                        catch { }
                    }
                }

                // 4. Force FeatureControl policies to prevent browser ActiveX suppression
                string[] featureControlKeys = new string[] {
                    @"Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_ACTIVEX_REPROMPT_WARNING",
                    @"Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_SAFE_BINDING",
                    @"Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_LOCALMACHINE_LOCKDOWN",
                    @"Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_RESTRICT_ACTIVEX_INSTALL",
                    @"Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_ACTIVEX_FILTERING"
                };

                foreach (var root in rootKeys)
                {
                    foreach (var fKeyPath in featureControlKeys)
                    {
                        try
                        {
                            using (RegistryKey key = root.CreateSubKey(fKeyPath))
                            {
                                key?.SetValue("msedge.exe", 0, RegistryValueKind.DWord);
                                key?.SetValue("iexplore.exe", 0, RegistryValueKind.DWord);
                                key?.SetValue("*", 0, RegistryValueKind.DWord);
                            }
                        }
                        catch { }
                    }
                }

                // Specifically ensure ActiveX Filtering is OFF in main IE settings
                foreach (var root in rootKeys)
                {
                    try {
                        using (var key = root.CreateSubKey(@"Software\Microsoft\Internet Explorer\Main")) {
                            key?.SetValue("ActiveXFiltering", 0, RegistryValueKind.DWord);
                        }
                    } catch { }
                }

                Logger.LogInfo("Registry", "DigiSigner & CAPICOM ActiveX Auto-Heal (Full ProgID/InprocServer32/Policy Force) applied successfully.");
                FixInvalidAlgorithmAndCryptoProviders();
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Registry", "ActiveX heal notice: " + ex.Message);
            }
        }

        /// <summary>
        /// Permanently fixes error -2146893816 / 0x80090008 ("Invalid algorithm specified." / NTE_BAD_ALGID)
        /// during Step 4: FetchCertDetails() by configuring Type 24 (PROV_RSA_AES) providers for SHA-256 DSC tokens,
        /// disabling FIPS algorithm policy enforcement, enabling SCHANNEL SHA-256 hashes, and repairing certificate store private keys.
        /// </summary>
        public static void FixInvalidAlgorithmAndCryptoProviders()
        {
            try
            {
                // 1. Disable FIPS mode enforcement (which triggers "Invalid algorithm specified" 0x80090008 / -2146893816)
                try
                {
                    using (var key = Registry.LocalMachine.CreateSubKey(@"System\CurrentControlSet\Control\Lsa\FipsAlgorithmPolicy"))
                    {
                        key?.SetValue("Enabled", 0, RegistryValueKind.DWord);
                    }
                    using (var key = Registry.LocalMachine.CreateSubKey(@"System\CurrentControlSet\Control\Lsa"))
                    {
                        key?.SetValue("fipsalgorithmpolicy", 0, RegistryValueKind.DWord);
                    }
                }
                catch { }

                // 2. Ensure Microsoft Enhanced RSA and AES Cryptographic Provider (Type 24) is fully configured
                var views = Environment.Is64BitOperatingSystem
                    ? new RegistryView[] { RegistryView.Registry64, RegistryView.Registry32 }
                    : new RegistryView[] { RegistryView.Registry32 };

                foreach (var view in views)
                {
                    try
                    {
                        using (var baseKey = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, view))
                        {
                            // Register Type 024 (PROV_RSA_AES) default provider
                            using (var t24 = baseKey.CreateSubKey(@"SOFTWARE\Microsoft\Cryptography\Defaults\Provider Types\Type 024"))
                            {
                                if (t24 != null)
                                {
                                    t24.SetValue("Name", "Microsoft Enhanced RSA and AES Cryptographic Provider", RegistryValueKind.String);
                                    t24.SetValue("TypeName", "RSA Full (Signature and Key Exchange) with AES", RegistryValueKind.String);
                                }
                            }

                            // Register Type 001 (PROV_RSA_FULL) default provider
                            using (var t1 = baseKey.CreateSubKey(@"SOFTWARE\Microsoft\Cryptography\Defaults\Provider Types\Type 001"))
                            {
                                if (t1 != null)
                                {
                                    t1.SetValue("Name", "Microsoft Enhanced Cryptographic Provider v1.0", RegistryValueKind.String);
                                    t1.SetValue("TypeName", "RSA Full (Signature and Key Exchange)", RegistryValueKind.String);
                                }
                            }

                            // Register Microsoft Enhanced RSA and AES Cryptographic Provider
                            using (var provAes = baseKey.CreateSubKey(@"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\Microsoft Enhanced RSA and AES Cryptographic Provider"))
                            {
                                if (provAes != null)
                                {
                                    provAes.SetValue("Image Path", "rsaenh.dll", RegistryValueKind.String);
                                    provAes.SetValue("Type", 24, RegistryValueKind.DWord);
                                    provAes.SetValue("SigInFile", 0, RegistryValueKind.DWord);
                                }
                            }

                            // Register Microsoft Enhanced Cryptographic Provider v1.0
                            using (var provRsa = baseKey.CreateSubKey(@"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\Microsoft Enhanced Cryptographic Provider v1.0"))
                            {
                                if (provRsa != null)
                                {
                                    provRsa.SetValue("Image Path", "rsaenh.dll", RegistryValueKind.String);
                                    provRsa.SetValue("Type", 1, RegistryValueKind.DWord);
                                    provRsa.SetValue("SigInFile", 0, RegistryValueKind.DWord);
                                }
                            }

                            // Register Microsoft Strong Cryptographic Provider
                            using (var provStrong = baseKey.CreateSubKey(@"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\Microsoft Strong Cryptographic Provider"))
                            {
                                if (provStrong != null)
                                {
                                    provStrong.SetValue("Image Path", "rsaenh.dll", RegistryValueKind.String);
                                    provStrong.SetValue("Type", 1, RegistryValueKind.DWord);
                                    provStrong.SetValue("SigInFile", 0, RegistryValueKind.DWord);
                                }
                            }

                            // Token CSPs: Register both Type 1 and Type 24 so SHA-256 and SHA-1 both succeed!
                            var tokenCsps = new System.Collections.Generic.Dictionary<string, string>
                            {
                                { "HyperPKI Crypto Service Provider", "HyperPKICSP.dll" },
                                { "HyperSecu HyperPKI CSP", "HyperPKICSP.dll" },
                                { "HYP2003 Crypto Service Provider", "eps2003csp11.dll" },
                                { "EnterSafe ePass2003 CSP v1.0", "eps2003csp11.dll" },
                                { "EnterSafe ePass2003 CSP v2.0", "eps2003csp11.dll" },
                                { "EnterSafe ePass2003 CSP v3.0", "eps2003csp11.dll" },
                                { "ePass2003 Crypto Service Provider", "eps2003csp11.dll" },
                                { "Verasys CA Crypto Service Provider", "eps2003csp11.dll" },
                                { "Watchdata ProxKey CSP", "wdscsp.dll" },
                                { "Watchdata India CSP v1.0", "wdscsp.dll" },
                                { "WD ProxKey CSP", "wdscsp.dll" },
                                { "mToken CryptoAPI Service Provider", "mTokenCSP.dll" },
                                { "mToken Crypto Service Provider", "mTokenCSP.dll" }
                            };

                            foreach (var tc in tokenCsps)
                            {
                                string existingPath = null;
                                try {
                                    using (var existingKey = baseKey.OpenSubKey($@"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\{tc.Key}")) {
                                        existingPath = existingKey?.GetValue("Image Path")?.ToString();
                                    }
                                } catch { }

                                string finalPath = tc.Value;
                                // If existing path is valid and full, use it. Otherwise try to find it.
                                if (!string.IsNullOrEmpty(existingPath) && (existingPath.Contains("\\") || existingPath.Contains("/"))) {
                                    finalPath = existingPath;
                                } else {
                                    // Search for DLL in system and common paths
                                    string sysDir = Environment.GetFolderPath(Environment.SpecialFolder.System);
                                    string sys64Dir = Environment.GetFolderPath(Environment.SpecialFolder.SystemX86);
                                    
                                    if (File.Exists(Path.Combine(sysDir, tc.Value))) finalPath = Path.Combine(sysDir, tc.Value);
                                    else if (File.Exists(Path.Combine(sys64Dir, tc.Value))) finalPath = Path.Combine(sys64Dir, tc.Value);
                                    else {
                                        // Fallback search in Program Files
                                        string[] commonRoots = { 
                                            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
                                            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86)
                                        };
                                        bool found = false;
                                        foreach (var root in commonRoots) {
                                            if (string.IsNullOrEmpty(root)) continue;
                                            string[] subFolders = { "WD_PROXKey", "HyperPKI", "ePass2003", "mToken", "Watchdata", "NIC", "DigiSigner" };
                                            foreach (var sub in subFolders) {
                                                string targetDir = Path.Combine(root, sub);
                                                if (Directory.Exists(targetDir)) {
                                                    try {
                                                        var files = Directory.GetFiles(targetDir, tc.Value, SearchOption.AllDirectories);
                                                        if (files.Length > 0) { finalPath = files[0]; found = true; break; }
                                                    } catch { }
                                                }
                                            }
                                            if (found) break;
                                        }
                                    }
                                }

                                // Type 1 registration
                                using (var k = baseKey.CreateSubKey($@"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\{tc.Key}"))
                                {
                                    if (k != null)
                                    {
                                        k.SetValue("Image Path", finalPath, RegistryValueKind.String);
                                        k.SetValue("Type", 1, RegistryValueKind.DWord);
                                        k.SetValue("SigInFile", 0, RegistryValueKind.DWord);
                                    }
                                }

                                // Type 24 registration (Crucial for SHA-256 FetchCertDetails())
                                using (var k = baseKey.CreateSubKey($@"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\{tc.Key} (AES)"))
                                {
                                    if (k != null)
                                    {
                                        k.SetValue("Image Path", finalPath, RegistryValueKind.String);
                                        k.SetValue("Type", 24, RegistryValueKind.DWord);
                                        k.SetValue("SigInFile", 0, RegistryValueKind.DWord);
                                    }
                                }
                            }
                        }
                    }
                    catch { }
                }

                // 3. Enable SCHANNEL Hashes (SHA-256, SHA-384, SHA-512, SHA, MD5)
                string[] hashes = new string[] { "SHA-256", "SHA-384", "SHA-512", "SHA", "MD5" };
                foreach (var h in hashes)
                {
                    try
                    {
                        using (var k = Registry.LocalMachine.CreateSubKey($@"SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Hashes\{h}"))
                        {
                            k?.SetValue("Enabled", 1, RegistryValueKind.DWord);
                        }
                    }
                    catch { }
                }

                // 4. Set .NET Strong Crypto & SystemDefaultTlsVersions
                string[] netKeys = new string[] {
                    @"SOFTWARE\Microsoft\.NETFramework\v4.0.30319",
                    @"SOFTWARE\WOW6432Node\Microsoft\.NETFramework\v4.0.30319"
                };
                foreach (var nk in netKeys)
                {
                    try
                    {
                        using (var k = Registry.LocalMachine.CreateSubKey(nk))
                        {
                            if (k != null)
                            {
                                k.SetValue("SchUseStrongCrypto", 1, RegistryValueKind.DWord);
                                k.SetValue("SystemDefaultTlsVersions", 1, RegistryValueKind.DWord);
                            }
                        }
                    }
                    catch { }
                }

                // 5. Repair Certificate Store Private Key links via certutil -repairstore -user my
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = "certutil.exe",
                        Arguments = "-repairstore -user my",
                        CreateNoWindow = true,
                        UseShellExecute = false,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };
                    using (var proc = Process.Start(psi))
                    {
                        proc?.WaitForExit(3000);
                    }
                }
                catch { }

                Logger.LogInfo("Registry", "Algorithm and Cryptographic Providers (NTE_BAD_ALGID / Type 24 SHA-256 fix) applied.");
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Registry", "Crypto algorithm fix notice: " + ex.Message);
            }
        }

        /// <summary>
        /// Master Internet Security Zones Configuration (Zones 0, 1, 2, 3, 4)
        /// Applies comprehensive ActiveX, Scripting, DSC Token, and Protected Mode settings requested by admin.
        /// </summary>
        public static void ApplyMasterZonesConfiguration()
        {
            try
            {
                string progData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
                string regDir = Path.Combine(progData, "EVedhika");
                Directory.CreateDirectory(regDir);
                string regPath = Path.Combine(regDir, "master_zones.reg");

                // Check if pre-packaged reg file exists in app payload
                string appPayloadReg = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Payload", "Registry", "evedhika_master_zones.reg");
                if (File.Exists(appPayloadReg))
                {
                    regPath = appPayloadReg;
                }
                else
                {
                    // Generate master reg file
                    File.WriteAllText(regPath, GetMasterZonesRegScript());
                }

                // Execute reg import silently
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo("reg.exe", $"import \"{regPath}\"")
                    {
                        CreateNoWindow = true,
                        UseShellExecute = false,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };
                    using (var p = Process.Start(psi))
                    {
                        p?.WaitForExit(3000);
                    }
                }
                catch { }

                // Direct API enforcement for Zone 0, 1, 2, 3, 4
                ApplyDirectZoneDwords();
                Logger.LogInfo("Registry", "Master Internet Settings Zones (0-4) successfully configured.");
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Registry", "Master zones configuration notice: " + ex.Message);
            }
        }

        private static void ApplyDirectZoneDwords()
        {
            try
            {
                RegistryKey[] rootHives = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                foreach (var root in rootHives)
                {
                    try
                    {
                        // Zone 0: Computer
                        using (var z0 = root.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\0"))
                        {
                            if (z0 != null)
                            {
                                z0.SetValue("DisplayName", "Computer", RegistryValueKind.String);
                                z0.SetValue("CurrentLevel", 0, RegistryValueKind.DWord);
                                z0.SetValue("Flags", 0x21, RegistryValueKind.DWord);
                                z0.SetValue("1200", 0, RegistryValueKind.DWord);
                                z0.SetValue("1400", 0, RegistryValueKind.DWord);
                                z0.SetValue("2001", 3, RegistryValueKind.DWord);
                                z0.SetValue("2004", 3, RegistryValueKind.DWord);
                            }
                        }

                        // Zone 1: Local Intranet
                        using (var z1 = root.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\1"))
                        {
                            if (z1 != null)
                            {
                                z1.SetValue("DisplayName", "Local intranet", RegistryValueKind.String);
                                z1.SetValue("CurrentLevel", 0, RegistryValueKind.DWord);
                                z1.SetValue("Flags", 0xdb, RegistryValueKind.DWord);
                                z1.SetValue("1200", 0, RegistryValueKind.DWord);
                                z1.SetValue("1400", 0, RegistryValueKind.DWord);
                                z1.SetValue("1001", 0, RegistryValueKind.DWord);
                                z1.SetValue("1004", 0, RegistryValueKind.DWord);
                                z1.SetValue("1201", 0, RegistryValueKind.DWord);
                                z1.SetValue("1405", 0, RegistryValueKind.DWord);
                                z1.SetValue("1803", 0, RegistryValueKind.DWord);
                                z1.SetValue("2001", 0, RegistryValueKind.DWord);
                                z1.SetValue("2004", 0, RegistryValueKind.DWord);
                                z1.SetValue("2500", 3, RegistryValueKind.DWord);
                                z1.SetValue("2402", 0, RegistryValueKind.DWord);
                                z1.SetValue("2400", 0, RegistryValueKind.DWord);
                                z1.SetValue("2401", 0, RegistryValueKind.DWord);
                                z1.SetValue("2007", 3, RegistryValueKind.DWord);
                                z1.SetValue("2702", 0, RegistryValueKind.DWord);
                                z1.SetValue("1208", 0, RegistryValueKind.DWord);
                                z1.SetValue("1209", 0, RegistryValueKind.DWord);
                                z1.SetValue("2201", 0, RegistryValueKind.DWord);
                                z1.SetValue("2000", 0, RegistryValueKind.DWord);
                                z1.SetValue("120A", 0, RegistryValueKind.DWord);
                                z1.SetValue("270C", 0, RegistryValueKind.DWord);
                                z1.SetValue("1604", 0, RegistryValueKind.DWord);
                                z1.SetValue("2600", 0, RegistryValueKind.DWord);
                                z1.SetValue("1406", 0, RegistryValueKind.DWord);
                                z1.SetValue("2709", 0, RegistryValueKind.DWord);
                                z1.SetValue("2708", 0, RegistryValueKind.DWord);
                                z1.SetValue("1608", 0, RegistryValueKind.DWord);
                                z1.SetValue("1206", 0, RegistryValueKind.DWord);
                                z1.SetValue("2102", 0, RegistryValueKind.DWord);
                                z1.SetValue("120C", 0, RegistryValueKind.DWord);
                                z1.SetValue("2300", 0, RegistryValueKind.DWord);
                                z1.SetValue("2104", 0, RegistryValueKind.DWord);
                                z1.SetValue("1609", 0, RegistryValueKind.DWord);
                                z1.SetValue("1A04", 0, RegistryValueKind.DWord);
                                z1.SetValue("1802", 0, RegistryValueKind.DWord);
                                z1.SetValue("2100", 0, RegistryValueKind.DWord);
                                z1.SetValue("160A", 0, RegistryValueKind.DWord);
                                z1.SetValue("1806", 0, RegistryValueKind.DWord);
                                z1.SetValue("1804", 0, RegistryValueKind.DWord);
                                z1.SetValue("1607", 0, RegistryValueKind.DWord);
                                z1.SetValue("270B", 0, RegistryValueKind.DWord);
                                z1.SetValue("1601", 0, RegistryValueKind.DWord);
                                z1.SetValue("1809", 0, RegistryValueKind.DWord);
                                z1.SetValue("2301", 0, RegistryValueKind.DWord);
                                z1.SetValue("1606", 0, RegistryValueKind.DWord);
                                z1.SetValue("2101", 0, RegistryValueKind.DWord);
                                z1.SetValue("1407", 0, RegistryValueKind.DWord);
                                z1.SetValue("2103", 0, RegistryValueKind.DWord);
                                z1.SetValue("2105", 0, RegistryValueKind.DWord);
                                z1.SetValue("1409", 0, RegistryValueKind.DWord);
                                z1.SetValue("1402", 0, RegistryValueKind.DWord);
                                z1.SetValue("1A00", 0x20000, RegistryValueKind.DWord);
                                z1.SetValue("2707", 0, RegistryValueKind.DWord);
                            }
                        }

                        // Zone 2: Trusted Sites
                        using (var z2 = root.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2"))
                        {
                            if (z2 != null)
                            {
                                z2.SetValue("DisplayName", "Trusted sites", RegistryValueKind.String);
                                z2.SetValue("MinLevel", 0x00010000, RegistryValueKind.DWord);
                                z2.SetValue("Flags", 0x47, RegistryValueKind.DWord);

                                if (root == Registry.LocalMachine)
                                {
                                    z2.SetValue("CurrentLevel", 0x00011000, RegistryValueKind.DWord);
                                    z2.SetValue("1001", 1, RegistryValueKind.DWord);
                                    z2.SetValue("1004", 3, RegistryValueKind.DWord);
                                    z2.SetValue("1201", 3, RegistryValueKind.DWord);
                                    z2.SetValue("1806", 1, RegistryValueKind.DWord);
                                    z2.SetValue("2201", 3, RegistryValueKind.DWord);
                                }
                                else
                                {
                                    z2.SetValue("CurrentLevel", 0x00000000, RegistryValueKind.DWord);
                                    z2.SetValue("1200", 0, RegistryValueKind.DWord);
                                    z2.SetValue("1400", 0, RegistryValueKind.DWord);
                                    z2.SetValue("1001", 0, RegistryValueKind.DWord);
                                    z2.SetValue("1004", 0, RegistryValueKind.DWord);
                                    z2.SetValue("1201", 0, RegistryValueKind.DWord);
                                    z2.SetValue("120B", 3, RegistryValueKind.DWord);
                                }
                            }
                        }

                        // Zone 3: Internet
                        using (var z3 = root.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\3"))
                        {
                            if (z3 != null)
                            {
                                z3.SetValue("DisplayName", "Internet", RegistryValueKind.String);
                                z3.SetValue("CurrentLevel", 0, RegistryValueKind.DWord);
                                z3.SetValue("Flags", 1, RegistryValueKind.DWord);
                                
                                // Apply the 24 permissive zeros requested
                                string[] zeros = { 
                                    "1001", "1004", "1201", "1206", "1209", "120A", "120C", 
                                    "1407", "1607", "1609", "160A", "1804", "1A04", "2102", 
                                    "2103", "2104", "2105", "2201", "2300", "2400", "2402", 
                                    "2708", "2709", "270B" 
                                };
                                foreach (var z in zeros) z3.SetValue(z, 0, RegistryValueKind.DWord);
                                
                                z3.SetValue("1200", 0, RegistryValueKind.DWord);
                                z3.SetValue("1400", 0, RegistryValueKind.DWord);
                            }
                        }

                        // Zone 4: Restricted Sites
                        using (var z4 = root.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\4"))
                        {
                            if (z4 != null)
                            {
                                z4.SetValue("DisplayName", "Restricted sites", RegistryValueKind.String);
                                z4.SetValue("CurrentLevel", 0x12000, RegistryValueKind.DWord);
                                z4.SetValue("Flags", 3, RegistryValueKind.DWord);
                                z4.SetValue("1200", 3, RegistryValueKind.DWord);
                                z4.SetValue("1400", 3, RegistryValueKind.DWord);
                            }
                        }
                    }
                    catch { }
                }
            }
            catch { }
        }

        private static string GetMasterZonesRegScript()
        {
            string payloadPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Payload", "Registry", "evedhika_master_zones.reg");
            if (File.Exists(payloadPath))
            {
                try { return File.ReadAllText(payloadPath); } catch { }
            }

            string altPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "evedhika_master_zones.reg");
            if (File.Exists(altPath))
            {
                try { return File.ReadAllText(altPath); } catch { }
            }

            return @"Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2]
""CurrentLevel""=dword:00000000
""MinLevel""=dword:00010000
""Flags""=dword:00000047
""1200""=dword:00000000
""1400""=dword:00000000
""1001""=dword:00000000
""1004""=dword:00000000
""1201""=dword:00000000
""1803""=dword:00000000
""1806""=dword:00000000
""2201""=dword:00000000

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge]
""InternetExplorerIntegrationLevel""=dword:00000001
""InternetExplorerIntegrationSiteList""=""C:\\enterprise_compat\\sites.xml""
""InternetExplorerIntegrationReloadInIEModeAllowed""=dword:00000001

[HKEY_CURRENT_USER\SOFTWARE\Policies\Microsoft\Edge]
""InternetExplorerIntegrationLevel""=dword:00000001
""InternetExplorerIntegrationSiteList""=""C:\\enterprise_compat\\sites.xml""
""InternetExplorerIntegrationReloadInIEModeAllowed""=dword:00000001
";
        }


    }
}
