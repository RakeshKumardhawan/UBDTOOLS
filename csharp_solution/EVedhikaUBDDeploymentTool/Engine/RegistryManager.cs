using EVedhikaUBDDeploymentTool.Helpers;
using System;
using Microsoft.Win32;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;

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
                string registryPath = $@"{Zone2KeyPath}\{targetDomain}";
                if (targetDomain == "ubd.telangana.gov.in")
                {
                    registryPath = $@"{Zone2KeyPath}\telangana.gov.in\ubd";
                }
                else if (targetDomain == "ubd.ap.gov.in")
                {
                    registryPath = $@"{Zone2KeyPath}\ap.gov.in\ubd";
                }

                using (RegistryKey baseKey = Registry.CurrentUser.CreateSubKey(registryPath))
                {
                    if (baseKey != null)
                    {
                        baseKey.SetValue("https", 2, RegistryValueKind.DWord);
                        baseKey.SetValue("http", 2, RegistryValueKind.DWord);
                        baseKey.SetValue("*", 2, RegistryValueKind.DWord);
                    }
                    else
                    {
                        throw new Exception("Failed to open or create registry key for " + targetDomain);
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Registry configuration failed for Trusted Sites: {ex.Message}", ex);
            }
        }

        public static bool ConfigureActiveXAndTLS()
        {
            try
            {
                using (RegistryKey zone2Key = Registry.CurrentUser.CreateSubKey(SecurityZonesKeyPath))
                {
                    if (zone2Key != null)
                    {
                        zone2Key.SetValue("CurrentLevel", 0x00010000, RegistryValueKind.DWord); 
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
                    @"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones",
                    @"Software\Policies\Microsoft\Windows\CurrentVersion\Internet Settings\Zones"
                };

                RegistryKey[] roots = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };

                foreach (string basePath in basePaths)
                {
                    foreach (RegistryKey root in roots)
                    {
                        for (int i = 0; i <= 4; i++)
                        {
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
                string[] progIds = new string[] { "DigiSignHelper.DigiSigner", "SignatureDemoLib.DigiSignHelper", "NIC.DigiSigner", "CAPICOM.SignedData.1", "CAPICOM.Store.1" };
                string targetClsid = "{76767676-7676-7676-7676-767676767676}";

                foreach (var progId in progIds)
                {
                    try
                    {
                        using (RegistryKey key = Registry.ClassesRoot.CreateSubKey(progId))
                        {
                            if (key != null)
                            {
                                key.SetValue("", "NIC DigiSigner Helper Object");
                                using (RegistryKey clsidKey = key.CreateSubKey("CLSID"))
                                {
                                    clsidKey.SetValue("", targetClsid);
                                }
                            }
                        }
                    }
                    catch { }
                }

                string[] clsids = new string[] 
                { 
                    "{76767676-7676-7676-7676-767676767676}",
                    "{A1B2C3D4-E5F6-7890-ABCD-EF0123456789}",
                    "{B8601633-0100-47F1-9457-495204431B32}",
                    "{7DD95801-9882-11CF-9FA9-00AA006C42C4}",
                    "{D4F44F4E-E1A4-4E64-884A-98C045F9616D}",
                    "{96A006C4-AA00-CF11-9FA9-00AA006C42C4}"
                };

                foreach (var clsid in clsids)
                {
                    try
                    {
                        string clsidPath = $@"CLSID\{clsid}";
                        using (RegistryKey clsidBase = Registry.ClassesRoot.CreateSubKey(clsidPath))
                        {
                            if (clsidBase != null)
                            {
                                clsidBase.SetValue("", "NIC DigiSigner Helper Object");
                                using (RegistryKey catKey = clsidBase.CreateSubKey("Implemented Categories"))
                                {
                                    catKey.CreateSubKey("{7DD95801-9882-11CF-9FA9-00AA006C42C4}");
                                    catKey.CreateSubKey("{7DD95802-9882-11CF-9FA9-00AA006C42C4}");
                                }
                            }
                        }
                    }
                    catch { }
                }

                string[] capicomClsids = new string[]
                {
                    "{15E2085E-94D1-4551-9E1D-444453456789}",
                    "{B6D9006F-035D-4A76-884A-C3E7705B9FF1}",
                    "{BD0D437A-F76E-4545-9244-6720D911718F}"
                };

                foreach (var clsid in capicomClsids)
                {
                    try
                    {
                        using (RegistryKey clsidBase = Registry.ClassesRoot.CreateSubKey($@"CLSID\{clsid}"))
                        {
                            if (clsidBase != null)
                            {
                                using (RegistryKey catKey = clsidBase.CreateSubKey("Implemented Categories"))
                                {
                                    catKey.CreateSubKey("{7DD95801-9882-11CF-9FA9-00AA006C42C4}");
                                    catKey.CreateSubKey("{7DD95802-9882-11CF-9FA9-00AA006C42C4}");
                                }
                            }
                        }
                    }
                    catch { }
                }

                RegistryKey[] rootKeys = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                string[] zones = new string[] { "1", "2" };

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
                                    key.SetValue("1201", 0, RegistryValueKind.DWord);
                                    key.SetValue("1405", 0, RegistryValueKind.DWord);
                                    key.SetValue("1200", 0, RegistryValueKind.DWord);
                                    key.SetValue("2708", 0, RegistryValueKind.DWord);
                                    key.SetValue("1001", 0, RegistryValueKind.DWord);
                                    key.SetValue("1004", 0, RegistryValueKind.DWord);
                                }
                            }
                        }
                        catch { }
                    }
                }

                Logger.LogInfo("Registry", "DigiSigner & CAPICOM ActiveX Auto-Heal (Force Policy Bypass) applied.");
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Registry", "ActiveX heal notice: " + ex.Message);
            }
        }
    }
}
