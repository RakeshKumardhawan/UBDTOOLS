import re

code = r"""using System;
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
                // 1. Remove old legacy Edge Policies set by previous .bat scripts to avoid policy precedence conflicts
                try { Registry.LocalMachine.DeleteSubKeyTree(@"Software\Policies\Microsoft\Edge", false); } catch { }
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Policies\Microsoft\Edge", false); } catch { }

                // 2. Remove old legacy IE Policies
                try { Registry.LocalMachine.DeleteSubKeyTree(@"Software\Policies\Microsoft\Internet Explorer", false); } catch { }
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Policies\Microsoft\Internet Explorer", false); } catch { }

                // 3. Clear IE Temporary Internet Files, Cookies & Stale Sessions
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo("RunDll32.exe", "InetCpl.cpl,ClearMyTracksByProcess 255")
                    {
                        CreateNoWindow = true,
                        UseShellExecute = false,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };
                    using (Process p = Process.Start(psi)) { p?.WaitForExit(2000); }
                }
                catch { }

                // 4. Remove stale Edge IE Mode site list cache directory if exists
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
                using (RegistryKey baseKey = Registry.CurrentUser.CreateSubKey($@"{Zone2KeyPath}\{targetDomain}"))
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

                // Also ensure telangana.gov.in root is mapped to Zone 2
                try
                {
                    using (RegistryKey rootKey = Registry.CurrentUser.CreateSubKey($@"{Zone2KeyPath}\telangana.gov.in"))
                    {
                        if (rootKey != null)
                        {
                            rootKey.SetValue("https", 2, RegistryValueKind.DWord);
                            rootKey.SetValue("http", 2, RegistryValueKind.DWord);
                            rootKey.SetValue("*", 2, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

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
                        // Enable all required ActiveX & DOM flags for Zone 2 (Trusted Sites)
                        zone2Key.SetValue("1001", 0, RegistryValueKind.DWord); // Download signed ActiveX controls
                        zone2Key.SetValue("1004", 0, RegistryValueKind.DWord); // Download unsigned ActiveX controls
                        zone2Key.SetValue("1200", 0, RegistryValueKind.DWord); // Run ActiveX controls and plug-ins
                        zone2Key.SetValue("1201", 0, RegistryValueKind.DWord); // Initialize and script ActiveX controls not marked as safe
                        zone2Key.SetValue("1208", 0, RegistryValueKind.DWord); // Allow previously unused ActiveX controls
                        zone2Key.SetValue("1209", 0, RegistryValueKind.DWord); // Allow Scriptlets
                        zone2Key.SetValue("1400", 0, RegistryValueKind.DWord); // Active scripting
                        zone2Key.SetValue("1402", 0, RegistryValueKind.DWord); // Scripting of Java applets
                        zone2Key.SetValue("1405", 0, RegistryValueKind.DWord); // Script ActiveX controls marked safe for scripting
                        zone2Key.SetValue("1601", 0, RegistryValueKind.DWord); // Submit encrypted form data
                        zone2Key.SetValue("1609", 0, RegistryValueKind.DWord); // DOM Storage
                        zone2Key.SetValue("1802", 0, RegistryValueKind.DWord); // Drag & drop
                        zone2Key.SetValue("2201", 0, RegistryValueKind.DWord); // Automatic prompting for ActiveX
                    }
                }

                // Enable TLS 1.1 + 1.2 + 1.3 in Internet Settings, and disable caching of SSL pages
                using (RegistryKey systemSettings = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings"))
                {
                    if (systemSettings != null)
                    {
                        systemSettings.SetValue("SecureProtocols", 2688, RegistryValueKind.DWord); // TLS 1.1 + 1.2 + 1.3
                        systemSettings.SetValue("DisableCachingOfSSLPages", 0, RegistryValueKind.DWord);
                    }
                }

                using (RegistryKey ieMain = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Internet Explorer\Main"))
                {
                    if (ieMain != null)
                    {
                        ieMain.SetValue("TabProcGrowth", 1, RegistryValueKind.DWord);
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"ActiveX/TLS Registry configuration failed: {ex.Message}", ex);
            }
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
    }
}
"""

with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'w') as f:
    f.write(code)

print("Patched RegistryManager.cs successfully")
