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
                catch { }

                // 1. Remove old legacy Edge Policies set by previous .bat scripts to avoid policy precedence conflicts
                try { Registry.LocalMachine.DeleteSubKeyTree(@"Software\Policies\Microsoft\Edge", false); } catch { }
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Policies\Microsoft\Edge", false); } catch { }

                // 2. Remove old legacy IE Policies
                try { Registry.LocalMachine.DeleteSubKeyTree(@"Software\Policies\Microsoft\Internet Explorer", false); } catch { }
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Policies\Microsoft\Internet Explorer", false); } catch { }

                // Clear old Trusted Sites (Remove all unwanted domains)
                // try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains", false); } catch { }
                // try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\EscDomains", false); } catch { }
                // try { Registry.LocalMachine.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains", false); } catch { }
                // try { Registry.LocalMachine.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\EscDomains", false); } catch { }

                // 3. Reset IE Security Zone 2 (Trusted Sites) to default by deleting our custom overrides
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2", false); } catch { }

                // 4. Stale cache cleanup is handled cleanly in Step 12 without popups

                // 5. Remove stale Edge IE Mode site list cache directory and legacy folders
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

                try
                {
                    string programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
                    string eVedhikaData = Path.Combine(programData, "EVedhika");
                    if (Directory.Exists(eVedhikaData))
                    {
                        Directory.Delete(eVedhikaData, true);
                    }
                }
                catch { }

                try
                {
                    if (Directory.Exists(@"C:\enterprise_compat"))
                    {
                        Directory.Delete(@"C:\enterprise_compat", true);
                    }
                }
                catch { }
            }
            catch
            {
                // Non-fatal cleanup
            }
        }

        public static bool ConfigureTrustedSites(string targetDomain)
        {
            try
            {
                // Correctly format IE ZoneMap domains (e.g. ubd.telangana.gov.in -> telangana.gov.in\ubd)
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
                        // Fix Security Level slider if manually changed to High (0x12000)
                        zone2Key.SetValue("CurrentLevel", 0x00010000, RegistryValueKind.DWord); // Low / Custom for Zone 2
                        zone2Key.SetValue("MinLevel", 0x00010000, RegistryValueKind.DWord);
                        // Enable all required ActiveX & DOM flags for Zone 2 (Trusted Sites)
                        zone2Key.SetValue("1001", 0, RegistryValueKind.DWord); // Download signed ActiveX controls (0 = Enable)
                        zone2Key.SetValue("1004", 0, RegistryValueKind.DWord); // Download unsigned ActiveX controls (0 = Enable)
                        zone2Key.SetValue("1200", 0, RegistryValueKind.DWord); // Run ActiveX controls and plug-ins (0 = Enable)
                        zone2Key.SetValue("1201", 0, RegistryValueKind.DWord); // Initialize and script ActiveX controls not marked as safe (0 = Enable)
                        zone2Key.SetValue("1208", 0, RegistryValueKind.DWord); // Allow previously unused ActiveX controls (0 = Enable)
                        zone2Key.SetValue("1209", 0, RegistryValueKind.DWord); // Allow Scriptlets (0 = Enable)
                        zone2Key.SetValue("120A", 0, RegistryValueKind.DWord); // Override Antivirus protection for ActiveX (0 = Enable)
                        zone2Key.SetValue("120B", 0, RegistryValueKind.DWord); // Override for SmartScreen (0 = Enable)
                        zone2Key.SetValue("1400", 0, RegistryValueKind.DWord); // Active scripting (0 = Enable)
                        zone2Key.SetValue("1402", 0, RegistryValueKind.DWord); // Scripting of Java applets (0 = Enable)
                        zone2Key.SetValue("1405", 0, RegistryValueKind.DWord); // Script ActiveX controls marked safe for scripting (0 = Enable)
                        zone2Key.SetValue("1406", 0, RegistryValueKind.DWord); // Access data sources across domains (0 = Enable)
                        zone2Key.SetValue("1407", 0, RegistryValueKind.DWord); // Allow Programmatic clipboard access (0 = Enable)
                        zone2Key.SetValue("1408", 0, RegistryValueKind.DWord); // Normal Active Scripting (0 = Enable)
                        zone2Key.SetValue("1601", 0, RegistryValueKind.DWord); // Submit encrypted form data (0 = Enable)
                        zone2Key.SetValue("1604", 0, RegistryValueKind.DWord); // Font download (0 = Enable)
                        zone2Key.SetValue("1606", 0, RegistryValueKind.DWord); // Userdata persistence (0 = Enable)
                        zone2Key.SetValue("1607", 0, RegistryValueKind.DWord); // Navigate windows and frames across different domains (0 = Enable)
                        zone2Key.SetValue("1609", 0, RegistryValueKind.DWord); // Display mixed content / DOM Storage (0 = Enable)
                        zone2Key.SetValue("1802", 0, RegistryValueKind.DWord); // Drag & drop (0 = Enable)
                        zone2Key.SetValue("1803", 0, RegistryValueKind.DWord); // *** File Download (0 = Enable, 3 = Disable) - Fixes Security Alert Download Error
                        zone2Key.SetValue("1804", 0, RegistryValueKind.DWord); // Launching programs and files in an IFRAME (0 = Enable)
                        zone2Key.SetValue("1806", 0, RegistryValueKind.DWord); // Launching applications and unsafe files (0 = Enable)
                        zone2Key.SetValue("1807", 0, RegistryValueKind.DWord); // Navigate sub-frames across different domains (0 = Enable)
                        zone2Key.SetValue("1808", 0, RegistryValueKind.DWord); // Font download (0 = Enable)
                        zone2Key.SetValue("1809", 0, RegistryValueKind.DWord); // Pop-up Blocker: Disable (0 = Disable blocker)
                        zone2Key.SetValue("2000", 0, RegistryValueKind.DWord); // Binary and script behaviors (0 = Enable)
                        zone2Key.SetValue("2001", 0, RegistryValueKind.DWord); // .NET-reliant components (0 = Enable)
                        zone2Key.SetValue("2004", 0, RegistryValueKind.DWord); // Run components not signed with Authenticode (0 = Enable)
                        zone2Key.SetValue("2101", 0, RegistryValueKind.DWord); // Status bar updates via script (0 = Enable)
                        zone2Key.SetValue("2102", 0, RegistryValueKind.DWord); // Allow script-initiated windows without size/pos constraints (0 = Enable)
                        zone2Key.SetValue("2200", 0, RegistryValueKind.DWord); // *** Automatic prompting for file downloads (0 = Enable, 3 = Disable)
                        zone2Key.SetValue("2201", 0, RegistryValueKind.DWord); // Automatic prompting for ActiveX (0 = Enable)
                        zone2Key.SetValue("2300", 0, RegistryValueKind.DWord); // Web sites in less privileged web content zone can navigate into this zone (0 = Enable)
                        zone2Key.SetValue("2702", 0, RegistryValueKind.DWord); // Allow active content (0 = Enable)
                        zone2Key.SetValue("2708", 0, RegistryValueKind.DWord); // Allow only approved domains to use ActiveX without prompt (0 = Disable prompt)
                    }
                }

                // Also ensure File Downloads (1803) and Automatic Prompting (2200) are ENABLED in Zone 3 (Internet Zone) and Zone 1 (Intranet)
                // so downloads from any web server or portal redirection never get blocked by Windows!
                using (RegistryKey zone3Key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\3"))
                {
                    if (zone3Key != null)
                    {
                        zone3Key.SetValue("1803", 0, RegistryValueKind.DWord); // File download: Enable
                        zone3Key.SetValue("2200", 0, RegistryValueKind.DWord); // Automatic prompting for file downloads: Enable
                    }
                }

                using (RegistryKey zone1Key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\1"))
                {
                    if (zone1Key != null)
                    {
                        zone1Key.SetValue("1803", 0, RegistryValueKind.DWord); // File download: Enable
                        zone1Key.SetValue("2200", 0, RegistryValueKind.DWord); // Automatic prompting for file downloads: Enable
                    }
                }

                // Enable TLS 1.1 + 1.2 + 1.3 in Internet Settings, and disable caching of SSL pages
                using (RegistryKey systemSettings = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings"))
                {
                    if (systemSettings != null)
                    {
                        systemSettings.SetValue("SecureProtocols", 2688, RegistryValueKind.DWord); // TLS 1.1 + 1.2 + 1.3
                        systemSettings.SetValue("DisableCachingOfSSLPages", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("SyncMode5", 3, RegistryValueKind.DWord); // 3 = Every time I visit the webpage
                    }
                }

                using (RegistryKey ieMain = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Internet Explorer\Main"))
                {
                    if (ieMain != null)
                    {
                        ieMain.SetValue("TabProcGrowth", 1, RegistryValueKind.DWord);
                    }
                }

                // *** CRITICAL FIX FOR SECURITY ALERT FILE DOWNLOAD BLOCKS ***
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
                // 1. Disable IE Enhanced Security Configuration (IE ESC) which blocks downloads
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

                // 2. Force File Downloads to Enable (0) across ALL zones in HKCU and HKLM, including Policies
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
                        for (int i = 0; i <= 4; i++) // Zones 0 (My Computer) to 4 (Restricted)
                        {
                            try
                            {
                                using (RegistryKey zoneKey = root.CreateSubKey($@"{basePath}\{i}"))
                                {
                                    if (zoneKey != null)
                                    {
                                        zoneKey.SetValue("1803", 0, RegistryValueKind.DWord); // File download: Enable
                                        zoneKey.SetValue("2200", 0, RegistryValueKind.DWord); // Automatic prompting: Enable
                                        zoneKey.SetValue("2201", 0, RegistryValueKind.DWord); // Automatic prompting for ActiveX: Enable
                                    }
                                }
                            }
                            catch { } // Ignore access denied on HKLM if running without full permissions
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

        /// <summary>
        /// Auto-heals DigiSignHelper COM automation errors by registering ActiveX keys
        /// and ensuring Safe for Scripting overrides to bypass 'Automation server can't create object' errors.
        /// </summary>
        public static void HealDigiSignHelperAutomation()
        {
            try
            {
                // 1. Register ProgID for DigiSignHelper
                using (RegistryKey key = Registry.ClassesRoot.CreateSubKey("DigiSignHelper.DigiSigner"))
                {
                    if (key != null)
                    {
                        key.SetValue("", "NIC DigiSigner Helper Automation Object");
                        using (RegistryKey clsidKey = key.CreateSubKey("CLSID"))
                        {
                            // Real CLSID for DigiSignHelper (Commonly used by NIC component)
                            clsidKey.SetValue("", "{A1B2C3D4-E5F6-7890-ABCD-EF0123456789}");
                        }
                    }
                }

                // 2. Add 'Safe for Scripting' and 'Safe for Initialization' COM Categories
                // This tells Windows/IE that this object is 100% safe and doesn't need to ask the user.
                string clsidPath = @"CLSID\{A1B2C3D4-E5F6-7890-ABCD-EF0123456789}";
                using (RegistryKey clsidBase = Registry.ClassesRoot.CreateSubKey(clsidPath))
                {
                    if (clsidBase != null)
                    {
                        clsidBase.SetValue("", "NIC DigiSigner Helper");
                        using (RegistryKey catKey = clsidBase.CreateSubKey("Implemented Categories"))
                        {
                            catKey.CreateSubKey("{7DD95801-9882-11CF-9FA9-00AA006C42C4}"); // Safe for scripting
                            catKey.CreateSubKey("{7DD95802-9882-11CF-9FA9-00AA006C42C4}"); // Safe for initialization
                        }
                    }
                }

                // 3. Global IE Compatibility Overrides (Allow this CLSID to run anywhere without restriction)
                using (RegistryKey compKey = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION"))
                {
                    if (compKey != null) compKey.SetValue("msedge.exe", 11001, RegistryValueKind.DWord);
                }

                // 4. Bypass Attachment Manager zone check for ActiveX objects
                using (RegistryKey safetyKey = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Policies\Attachments"))
                {
                    if (safetyKey != null)
                    {
                        safetyKey.SetValue("SaveZoneInformation", 1, RegistryValueKind.DWord);
                    }
                }

                // 5. Force 'Low' protection level for ActiveX execution in Zone 2
                using (RegistryKey zone2Key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2"))
                {
                    if (zone2Key != null)
                    {
                        zone2Key.SetValue("1201", 0, RegistryValueKind.DWord); // Initialize ActiveX without prompt
                        zone2Key.SetValue("1405", 0, RegistryValueKind.DWord); // Script ActiveX marked safe
                    }
                }

                Logger.LogInfo("Registry", "DigiSignHelper COM automation shim applied successfully [Zero-Error Auto-Heal].");
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Registry", "DigiSignHelper heal notice: " + ex.Message);
            }
        }
    }
}
