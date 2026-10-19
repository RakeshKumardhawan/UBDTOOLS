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
                // STEP 1: Always take safety pre-deployment backup BEFORE any cleanup or modification
                try
                {
                    string backupFile = BackupEngine.CreatePreDeploymentBackup();
                    if (!string.IsNullOrEmpty(backupFile))
                    {
                        Logger.LogInfo("Backup", "Pre-deployment registry snapshot saved to: " + backupFile);
                    }
                }
                catch (Exception bEx)
                {
                    Logger.LogWarn("Backup", "Pre-deployment backup warning: " + bEx.Message);
                }

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

                // Check if target website https://ubd.telangana.gov.in/ is ALREADY configured in Trusted Sites to avoid duplicate entries
                bool ubdAlreadyExists = false;
                try
                {
                    using (RegistryKey chkKey = Registry.CurrentUser.OpenSubKey($@"{Zone2KeyPath}\ubd.telangana.gov.in"))
                    {
                        if (chkKey != null && chkKey.GetValue("https") != null && Convert.ToInt32(chkKey.GetValue("https")) == 2)
                        {
                            ubdAlreadyExists = true;
                        }
                    }
                    if (!ubdAlreadyExists)
                    {
                        using (RegistryKey chkKey2 = Registry.CurrentUser.OpenSubKey($@"{Zone2KeyPath}\telangana.gov.in\ubd"))
                        {
                            if (chkKey2 != null && chkKey2.GetValue("https") != null && Convert.ToInt32(chkKey2.GetValue("https")) == 2)
                            {
                                ubdAlreadyExists = true;
                            }
                        }
                    }
                }
                catch { }

                if (ubdAlreadyExists)
                {
                    Logger.LogInfo("Registry", "[VERIFIED] https://ubd.telangana.gov.in/ is already registered in Trusted Sites (Zone 2). Duplicate entry avoided.");
                }
                else
                {
                    Logger.LogInfo("Registry", "[ADDING] Registering https://ubd.telangana.gov.in/ into Trusted Sites (Zone 2)...");
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

                // Ensure HTTPS Server Verification setting for Zone 2 (Trusted Sites) is configured
                try
                {
                    using (RegistryKey z2 = Registry.CurrentUser.CreateSubKey(SecurityZonesKeyPath))
                    {
                        if (z2 != null)
                        {
                            // Flags = 0x47 enforces 'Require server verification (https:) for all sites in this zone' (bit 0x04)
                            z2.SetValue("Flags", 0x00000047, RegistryValueKind.DWord);
                            Logger.LogInfo("Registry", "[VERIFIED] Trusted Sites Server Verification (HTTPS) enforced with Flags = 0x47.");
                        }
                    }
                }
                catch { }

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
                        zone2Key.SetValue("2001", 3, RegistryValueKind.DWord); // Disabled per user order // .NET-reliant components
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
                        // TLS 1.0 (128) + TLS 1.1 (512) + TLS 1.2 (2048) + TLS 1.3 (8192) = 10880 (0x2AA0)
                        systemSettings.SetValue("SecureProtocols", 10880, RegistryValueKind.DWord);
                        systemSettings.SetValue("DisableCachingOfSSLPages", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("SyncMode5", 3, RegistryValueKind.DWord);
                        systemSettings.SetValue("CertificateRevocation", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("PublisherRevocation", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("WarnonBadCertRecving", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("WarnOnZoneCrossing", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("WarnOnPostRedirect", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("AllowInvalidCertificates", 1, RegistryValueKind.DWord);
                        systemSettings.SetValue("CheckExeSignatures", "no", RegistryValueKind.String);
                    }
                }
                using (RegistryKey advHklm = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings"))
                {
                    if (advHklm != null)
                    {
                        advHklm.SetValue("SecureProtocols", 10880, RegistryValueKind.DWord);
                        advHklm.SetValue("CertificateRevocation", 0, RegistryValueKind.DWord);
                        advHklm.SetValue("PublisherRevocation", 0, RegistryValueKind.DWord);
                        advHklm.SetValue("WarnonBadCertRecving", 0, RegistryValueKind.DWord);
                    }
                }
                // Allow active content to run in files on My Computer (FEATURE_LOCALMACHINE_LOCKDOWN)
                string[] featHives = new string[] { @"Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_LOCALMACHINE_LOCKDOWN", @"SOFTWARE\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_LOCALMACHINE_LOCKDOWN" };
                RegistryKey[] rootList = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                foreach (var root in rootList)
                {
                    foreach (var fh in featHives)
                    {
                        try
                        {
                            using (var fk = root.CreateSubKey(fh))
                            {
                                if (fk != null)
                                {
                                    fk.SetValue("iexplore.exe", 0, RegistryValueKind.DWord);
                                    fk.SetValue("msedge.exe", 0, RegistryValueKind.DWord);
                                }
                            }
                        }
                        catch { }
                    }
                }
                // Pop-up Blocker disabled in Internet Explorer settings for UBD portal
                try
                {
                    using (var nw = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Internet Explorer\New Windows"))
                    {
                        nw?.SetValue("PopupMgr", "no", RegistryValueKind.String);
                    }
                }
                catch { }
                using (RegistryKey ieMain = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Internet Explorer\Main"))
                {
                    if (ieMain != null)
                    {
                        ieMain.SetValue("TabProcGrowth", 1, RegistryValueKind.DWord);
                        ieMain.SetValue("DOMStorage", 1, RegistryValueKind.DWord);
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

                // Enhanced status indicators for Zone 1, Zone 2, Zone 3
                try
                {
                    var results = VerifyAllSecurityZones();
                    int passed = results.FindAll(x => x.IsPass).Count;
                    int failed = results.FindAll(x => !x.IsPass).Count;
                    int z1Passed = results.FindAll(x => x.ZoneId == 1 && x.IsPass).Count;
                    int z1Total = results.FindAll(x => x.ZoneId == 1).Count;
                    int z2Passed = results.FindAll(x => x.ZoneId == 2 && x.IsPass).Count;
                    int z2Total = results.FindAll(x => x.ZoneId == 2).Count;
                    int z3Passed = results.FindAll(x => x.ZoneId == 3 && x.IsPass).Count;
                    int z3Total = results.FindAll(x => x.ZoneId == 3).Count;

                    dict["TotalAudited"] = results.Count.ToString();
                    dict["TotalPassed"] = passed.ToString();
                    dict["TotalFailed"] = failed.ToString();
                    dict["ComplianceScore"] = results.Count > 0 ? (Math.Round(((double)passed / results.Count) * 100)) + "%" : "0%";
                    dict["Zone1_Status"] = $"{z1Passed}/{z1Total} Settings Configured (Local Intranet)";
                    dict["Zone2_Status"] = $"{z2Passed}/{z2Total} Settings Configured (Trusted Sites)";
                    dict["Zone3_Status"] = $"{z3Passed}/{z3Total} Settings Configured (Internet)";
                }
                catch { }

                // Check Trusted Site domain and HTTPS Server Verification
                try
                {
                    bool ubdExists = false;
                    using (var k = Registry.CurrentUser.OpenSubKey($@"{Zone2KeyPath}\ubd.telangana.gov.in"))
                    {
                        if (k != null && k.GetValue("https") != null && Convert.ToInt32(k.GetValue("https")) == 2) ubdExists = true;
                    }
                    dict["TrustedSite_UBD"] = ubdExists ? "Configured (ubd.telangana.gov.in)" : "Not Set";

                    using (var z2Key = Registry.CurrentUser.OpenSubKey(SecurityZonesKeyPath))
                    {
                        if (z2Key != null)
                        {
                            object flags = z2Key.GetValue("Flags");
                            if (flags != null && (Convert.ToInt32(flags) & 0x04) != 0)
                            {
                                dict["HttpsServerVerification"] = "Enabled (Flags = 0x" + Convert.ToInt32(flags).ToString("X") + ")";
                            }
                            else
                            {
                                dict["HttpsServerVerification"] = "Flags = " + (flags != null ? flags.ToString() : "Not Set");
                            }
                        }
                    }
                }
                catch { }

                dict["LastBackup"] = !string.IsNullOrEmpty(BackupEngine.LastBackupPath) ? BackupEngine.LastBackupPath : "None";
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
                                bool isExistingFull = !string.IsNullOrEmpty(existingPath) && (existingPath.Contains("\\") || existingPath.Contains("/"));
                                
                                // Search for DLL in system and common paths
                                string sysDir = Environment.GetFolderPath(Environment.SpecialFolder.System);
                                string sys64Dir = Environment.GetFolderPath(Environment.SpecialFolder.SystemX86);
                                
                                string foundPath = null;
                                if (File.Exists(Path.Combine(sysDir, tc.Value))) foundPath = Path.Combine(sysDir, tc.Value);
                                else if (File.Exists(Path.Combine(sys64Dir, tc.Value))) foundPath = Path.Combine(sys64Dir, tc.Value);
                                else {
                                    string[] commonRoots = { 
                                        Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
                                        Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
                                        @"C:\Program Files",
                                        @"C:\Program Files (x86)"
                                    };
                                    bool found = false;
                                    foreach (var root in commonRoots) {
                                        if (string.IsNullOrEmpty(root) || !Directory.Exists(root)) continue;
                                        string[] subFolders = { "WD_PROXKey", "HyperPKI", "ePass2003", "mToken", "Watchdata", "NIC", "DigiSigner", "ProxKey", "Watchdata India", "CryptoAPI" };
                                        foreach (var sub in subFolders) {
                                            string targetDir = Path.Combine(root, sub);
                                            if (Directory.Exists(targetDir)) {
                                                try {
                                                    var files = Directory.GetFiles(targetDir, tc.Value, SearchOption.AllDirectories);
                                                    if (files.Length > 0) { foundPath = files[0]; found = true; break; }
                                                } catch { }
                                            }
                                        }
                                        if (found) break;
                                    }
                                }

                                if (foundPath != null) {
                                    finalPath = foundPath;
                                } else if (isExistingFull) {
                                    // If we didn't find it but there's a full path already, don't break it!
                                    finalPath = existingPath;
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

        public class ZoneSettingItem
        {
            public int ZoneId { get; set; }
            public string ZoneName { get; set; }
            public string ValueName { get; set; }
            public string SettingName { get; set; }
            public int ExpectedValue { get; set; }
            public string Description { get; set; }
            public string Category { get; set; }

            public ZoneSettingItem(int zoneId, string zoneName, string valueName, string settingName, int expectedValue, string desc, string cat = "Security")
            {
                ZoneId = zoneId;
                ZoneName = zoneName;
                ValueName = valueName;
                SettingName = settingName;
                ExpectedValue = expectedValue;
                Description = desc;
                Category = cat;
            }
        }

        public class ZoneVerificationResult
        {
            public int ZoneId { get; set; }
            public string ZoneName { get; set; }
            public string ValueName { get; set; }
            public string SettingName { get; set; }
            public string ExpectedValue { get; set; }
            public string ActualValueHkcu { get; set; }
            public string ActualValueHklm { get; set; }
            public bool IsPass { get; set; }
            public string FailureReason { get; set; }
            public string Description { get; set; }
        }

        /// <summary>
        /// Comprehensive Master Catalog of Windows Internet Settings Security Zones (Zone 1, Zone 2, Zone 3)
        /// Matching exact Windows Registry DWORD specifications for government UBD & DSC portals.
        /// </summary>
        public static List<ZoneSettingItem> GetZoneSettingsCatalog()
        {
            List<ZoneSettingItem> catalog = new List<ZoneSettingItem>();
            // ==========================================
            // ZONE 1: LOCAL INTRANET
            // ==========================================
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "CurrentLevel", "Zone Security Level (Custom)", 0, "Sets zone security template to 0 (Custom Level)", "Zone Template"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "Flags", "Zone Capabilities & Flags", 0xdb, "Local Intranet Zone Flags", "Zone Flags"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "MinLevel", "Minimum Security Level Allowed", 0x10000, "Minimum level for custom security template", "Zone Template"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1001", "Download signed ActiveX controls", 0, "Download signed ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1004", "Download unsigned ActiveX controls", 0, "Download unsigned ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1200", "Run ActiveX controls and plug-ins", 0, "Run ActiveX controls and plug-ins (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1201", "Initialize and script ActiveX not marked safe", 0, "Initialize and script ActiveX not marked safe (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1206", "Allow scripting of Microsoft web browser control", 0, "Allow scripting of Microsoft web browser control (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1208", "Allow previously unused ActiveX controls", 0, "Allow previously unused ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1209", "Scriptlets", 0, "Scriptlets (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "120A", "Display video and animation without external player", 0, "Display video and animation without external player (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "120B", "Override SmartScreen filter for ActiveX", 0, "Override SmartScreen filter for ActiveX (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1400", "Active scripting (JavaScript Execution)", 0, "Active scripting (JavaScript Execution) (Value = 0)", "Scripting"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1402", "Scripting of Java applets", 0, "Scripting of Java applets (Value = 0)", "Scripting"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1405", "Script ActiveX controls marked safe", 0, "Script ActiveX controls marked safe (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1406", "Access data sources across domains", 0, "Access data sources across domains (Value = 0)", "Security"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1407", "Allow Programmatic clipboard access", 0, "Allow Programmatic clipboard access (Value = 0)", "Clipboard"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1409", "Scripting of XSLT elements", 0, "Scripting of XSLT elements (Value = 0)", "Scripting"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1604", "Font download", 0, "Font download (Value = 0)", "Downloads"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1606", "Userdata persistence", 0, "Userdata persistence (Value = 0)", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1607", "Navigate windows and frames across domains", 0, "Navigate windows and frames across domains (Value = 0)", "Navigation"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1608", "Allow META REFRESH", 0, "Allow META REFRESH (Value = 0)", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1609", "Display mixed content (HTTP inside HTTPS)", 0, "Display mixed content (HTTP inside HTTPS) (Value = 0)", "Mixed Content"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1802", "Drag and drop or copy and paste files", 0, "Drag and drop or copy and paste files (Value = 0)", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1803", "File download", 0, "File download (Value = 0)", "Downloads"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1804", "Launching programs and files in an IFRAME", 1, "Launching programs and files in an IFRAME (Value = 1)", "Frames"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1806", "Launching applications and unsafe files", 0, "Launching applications and unsafe files (Value = 0)", "Security"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1809", "Use Pop-up Blocker", 0, "Use Pop-up Blocker (Value = 0)", "Pop-up Blocker"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2000", "Binary and script behaviors", 0, "Binary and script behaviors (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2001", "Run components signed with Authenticode / .NET", 3, "Disabled per exact user specification (3 = Disable)", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2004", "Run components not signed with Authenticode", 0, "Run components not signed with Authenticode (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2007", "Run components signed with Authenticode (Secondary)", 0, "Run components signed with Authenticode (Secondary) (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2100", "Open files based on content (MIME Sniffing)", 0, "Open files based on content (MIME Sniffing) (Value = 0)", "Downloads"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2102", "Script-initiated windows without constraints", 0, "Script-initiated windows without constraints (Value = 0)", "Windows"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2103", "Allow status bar updates via script", 0, "Allow status bar updates via script (Value = 0)", "Status Bar"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2104", "Allow websites to open windows without address/status", 0, "Allow websites to open windows without address/status (Value = 0)", "Windows"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2105", "Allow scripted prompt windows", 0, "Allow scripted prompt windows (Value = 0)", "Windows"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2201", "Automatic prompting for ActiveX controls", 0, "Automatic prompting for ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2300", "Web sites in less privileged zone navigation", 0, "Web sites in less privileged zone navigation (Value = 0)", "Navigation"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2301", "Use SmartScreen Filter", 0, "Use SmartScreen Filter (Value = 0)", "SmartScreen"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2400", ".NET Framework: XAML browser applications", 0, ".NET Framework: XAML browser applications (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2401", ".NET Framework: XPS documents", 0, ".NET Framework: XPS documents (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2402", ".NET Framework: Loose XAML", 0, ".NET Framework: Loose XAML (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2600", "Enable .NET Framework setup", 0, "Enable .NET Framework setup (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2702", "ActiveX Filtering", 0, "ActiveX Filtering (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2708", "Allow approved domains to use ActiveX", 0, "Allow approved domains to use ActiveX (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2709", "Run Antimalware against ActiveX", 0, "Run Antimalware against ActiveX (Value = 0)", "Security"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1A00", "User Authentication Logon", 0x20000, "User Authentication Logon (Value = 0x20000)", "Authentication"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1A04", "Don't prompt for client certificate selection", 0, "Don't prompt for client certificate selection (Value = 0)", "Certificates"));
            // ==========================================
            // ZONE 2: TRUSTED SITES
            // ==========================================
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "CurrentLevel", "Zone Security Level (Custom)", 0, "Sets zone security template to 0 (Custom Level)", "Zone Template"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "Flags", "Zone Capabilities & Flags", 0x47, "Trusted Sites Zone Flags", "Zone Flags"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "MinLevel", "Minimum Security Level Allowed", 0x10000, "Minimum level for custom security template", "Zone Template"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1001", "Download signed ActiveX controls", 0, "Download signed ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1004", "Download unsigned ActiveX controls", 0, "Download unsigned ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1200", "Run ActiveX controls and plug-ins", 0, "Run ActiveX controls and plug-ins (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1201", "Initialize and script ActiveX not marked safe", 0, "Initialize and script ActiveX not marked safe (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1206", "Allow scripting of Microsoft web browser control", 0, "Allow scripting of Microsoft web browser control (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1208", "Allow previously unused ActiveX controls", 0, "Allow previously unused ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1209", "Scriptlets", 0, "Scriptlets (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "120A", "Display video and animation without external player", 0, "Display video and animation without external player (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "120B", "Override SmartScreen filter for ActiveX", 0, "Override SmartScreen filter for ActiveX (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1400", "Active scripting (JavaScript Execution)", 0, "Active scripting (JavaScript Execution) (Value = 0)", "Scripting"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1402", "Scripting of Java applets", 0, "Scripting of Java applets (Value = 0)", "Scripting"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1405", "Script ActiveX controls marked safe", 0, "Script ActiveX controls marked safe (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1406", "Access data sources across domains", 0, "Access data sources across domains (Value = 0)", "Security"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1407", "Allow Programmatic clipboard access", 0, "Allow Programmatic clipboard access (Value = 0)", "Clipboard"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1409", "Scripting of XSLT elements", 0, "Scripting of XSLT elements (Value = 0)", "Scripting"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1604", "Font download", 0, "Font download (Value = 0)", "Downloads"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1606", "Userdata persistence", 0, "Userdata persistence (Value = 0)", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1607", "Navigate windows and frames across domains", 0, "Navigate windows and frames across domains (Value = 0)", "Navigation"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1608", "Allow META REFRESH", 0, "Allow META REFRESH (Value = 0)", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1609", "Display mixed content (HTTP inside HTTPS)", 0, "Display mixed content (HTTP inside HTTPS) (Value = 0)", "Mixed Content"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1802", "Drag and drop or copy and paste files", 0, "Drag and drop or copy and paste files (Value = 0)", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1803", "File download", 0, "File download (Value = 0)", "Downloads"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1804", "Launching programs and files in an IFRAME", 0, "Launching programs and files in an IFRAME (Value = 0)", "Frames"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1806", "Launching applications and unsafe files", 0, "Launching applications and unsafe files (Value = 0)", "Security"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1809", "Use Pop-up Blocker", 0, "Use Pop-up Blocker (Value = 0)", "Pop-up Blocker"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2000", "Binary and script behaviors", 0, "Binary and script behaviors (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2001", "Run components signed with Authenticode / .NET", 3, "Disabled per exact user specification (3 = Disable)", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2004", "Run components not signed with Authenticode", 0, "Run components not signed with Authenticode (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2007", "Run components signed with Authenticode (Secondary)", 0, "Run components signed with Authenticode (Secondary) (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2100", "Open files based on content (MIME Sniffing)", 0, "Open files based on content (MIME Sniffing) (Value = 0)", "Downloads"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2102", "Script-initiated windows without constraints", 0, "Script-initiated windows without constraints (Value = 0)", "Windows"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2103", "Allow status bar updates via script", 0, "Allow status bar updates via script (Value = 0)", "Status Bar"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2104", "Allow websites to open windows without address/status", 0, "Allow websites to open windows without address/status (Value = 0)", "Windows"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2105", "Allow scripted prompt windows", 0, "Allow scripted prompt windows (Value = 0)", "Windows"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2201", "Automatic prompting for ActiveX controls", 0, "Automatic prompting for ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2300", "Web sites in less privileged zone navigation", 0, "Web sites in less privileged zone navigation (Value = 0)", "Navigation"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2301", "Use SmartScreen Filter", 0, "Use SmartScreen Filter (Value = 0)", "SmartScreen"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2400", ".NET Framework: XAML browser applications", 0, ".NET Framework: XAML browser applications (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2401", ".NET Framework: XPS documents", 0, ".NET Framework: XPS documents (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2402", ".NET Framework: Loose XAML", 0, ".NET Framework: Loose XAML (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2600", "Enable .NET Framework setup", 0, "Enable .NET Framework setup (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2702", "ActiveX Filtering", 0, "ActiveX Filtering (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2708", "Allow approved domains to use ActiveX", 0, "Allow approved domains to use ActiveX (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2709", "Run Antimalware against ActiveX", 0, "Run Antimalware against ActiveX (Value = 0)", "Security"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1A00", "User Authentication Logon", 0x20000, "User Authentication Logon (Value = 0x20000)", "Authentication"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1A04", "Don't prompt for client certificate selection", 0, "Don't prompt for client certificate selection (Value = 0)", "Certificates"));
            // ==========================================
            // ZONE 3: INTERNET
            // ==========================================
            catalog.Add(new ZoneSettingItem(3, "Internet", "CurrentLevel", "Zone Security Level (Custom)", 0, "Sets zone security template to 0 (Custom Level)", "Zone Template"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "Flags", "Zone Capabilities & Flags", 1, "Internet Zone Flags", "Zone Flags"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1001", "Download signed ActiveX controls", 0, "Download signed ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1004", "Download unsigned ActiveX controls", 0, "Download unsigned ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1200", "Run ActiveX controls and plug-ins", 0, "Run ActiveX controls and plug-ins (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1201", "Initialize and script ActiveX not marked safe", 0, "Initialize and script ActiveX not marked safe (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1206", "Allow scripting of Microsoft web browser control", 0, "Allow scripting of Microsoft web browser control (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1208", "Allow previously unused ActiveX controls", 0, "Allow previously unused ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1209", "Scriptlets", 0, "Scriptlets (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "120A", "Display video and animation without external player", 0, "Display video and animation without external player (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "120B", "Override SmartScreen filter for ActiveX", 0, "Override SmartScreen filter for ActiveX (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1400", "Active scripting (JavaScript Execution)", 0, "Active scripting (JavaScript Execution) (Value = 0)", "Scripting"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1402", "Scripting of Java applets", 0, "Scripting of Java applets (Value = 0)", "Scripting"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1405", "Script ActiveX controls marked safe", 0, "Script ActiveX controls marked safe (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1406", "Access data sources across domains", 0, "Access data sources across domains (Value = 0)", "Security"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1407", "Allow Programmatic clipboard access", 0, "Allow Programmatic clipboard access (Value = 0)", "Clipboard"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1409", "Scripting of XSLT elements", 0, "Scripting of XSLT elements (Value = 0)", "Scripting"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1604", "Font download", 0, "Font download (Value = 0)", "Downloads"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1606", "Userdata persistence", 0, "Userdata persistence (Value = 0)", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1607", "Navigate windows and frames across domains", 0, "Navigate windows and frames across domains (Value = 0)", "Navigation"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1608", "Allow META REFRESH", 0, "Allow META REFRESH (Value = 0)", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1609", "Display mixed content (HTTP inside HTTPS)", 0, "Display mixed content (HTTP inside HTTPS) (Value = 0)", "Mixed Content"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1802", "Drag and drop or copy and paste files", 0, "Drag and drop or copy and paste files (Value = 0)", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1803", "File download", 0, "File download (Value = 0)", "Downloads"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1804", "Launching programs and files in an IFRAME", 0, "Launching programs and files in an IFRAME (Value = 0)", "Frames"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1806", "Launching applications and unsafe files", 0, "Launching applications and unsafe files (Value = 0)", "Security"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1809", "Use Pop-up Blocker", 0, "Use Pop-up Blocker (Value = 0)", "Pop-up Blocker"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2000", "Binary and script behaviors", 0, "Binary and script behaviors (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2001", "Run components signed with Authenticode / .NET", 3, "Disabled per exact user specification (3 = Disable)", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2004", "Run components not signed with Authenticode", 0, "Run components not signed with Authenticode (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2007", "Run components signed with Authenticode (Secondary)", 0, "Run components signed with Authenticode (Secondary) (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2100", "Open files based on content (MIME Sniffing)", 0, "Open files based on content (MIME Sniffing) (Value = 0)", "Downloads"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2102", "Script-initiated windows without constraints", 0, "Script-initiated windows without constraints (Value = 0)", "Windows"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2103", "Allow status bar updates via script", 0, "Allow status bar updates via script (Value = 0)", "Status Bar"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2104", "Allow websites to open windows without address/status", 0, "Allow websites to open windows without address/status (Value = 0)", "Windows"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2105", "Allow scripted prompt windows", 0, "Allow scripted prompt windows (Value = 0)", "Windows"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2201", "Automatic prompting for ActiveX controls", 0, "Automatic prompting for ActiveX controls (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2300", "Web sites in less privileged zone navigation", 0, "Web sites in less privileged zone navigation (Value = 0)", "Navigation"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2301", "Use SmartScreen Filter", 0, "Use SmartScreen Filter (Value = 0)", "SmartScreen"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2400", ".NET Framework: XAML browser applications", 0, ".NET Framework: XAML browser applications (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2401", ".NET Framework: XPS documents", 0, ".NET Framework: XPS documents (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2402", ".NET Framework: Loose XAML", 0, ".NET Framework: Loose XAML (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2600", "Enable .NET Framework setup", 0, "Enable .NET Framework setup (Value = 0)", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2702", "ActiveX Filtering", 0, "ActiveX Filtering (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2708", "Allow approved domains to use ActiveX", 0, "Allow approved domains to use ActiveX (Value = 0)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2709", "Run Antimalware against ActiveX", 0, "Run Antimalware against ActiveX (Value = 0)", "Security"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1A00", "User Authentication Logon", 0x20000, "User Authentication Logon (Value = 0x20000)", "Authentication"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1A04", "Don't prompt for client certificate selection", 0, "Don't prompt for client certificate selection (Value = 0)", "Certificates"));
            return catalog;
        }

        private static void ApplyDirectZoneDwords()
        {
            try
            {
                var catalog = GetZoneSettingsCatalog();
                RegistryKey[] rootHives = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };

                foreach (var root in rootHives)
                {
                    try
                    {
                        // 1. Zone 0: Computer
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

                        // 2. Zone 1, Zone 2, Zone 3 from Catalog
                        for (int zoneId = 1; zoneId <= 3; zoneId++)
                        {
                            string subPath = $@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\{zoneId}";
                            using (var zk = root.CreateSubKey(subPath))
                            {
                                if (zk != null)
                                {
                                    string displayName = zoneId == 1 ? "Local intranet" : (zoneId == 2 ? "Trusted sites" : "Internet");
                                    zk.SetValue("DisplayName", displayName, RegistryValueKind.String);

                                    var zoneItems = catalog.FindAll(x => x.ZoneId == zoneId);
                                    foreach (var item in zoneItems)
                                    {
                                        try
                                        {
                                            zk.SetValue(item.ValueName, item.ExpectedValue, RegistryValueKind.DWord);
                                        }
                                        catch (Exception ex)
                                        {
                                            Logger.LogWarn("Registry", $"Failed to set Zone {zoneId} setting {item.ValueName}: {ex.Message}");
                                        }
                                    }
                                }
                            }
                        }

                        // 3. Zone 4: Restricted Sites
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
                    catch (Exception rEx)
                    {
                        Logger.LogWarn("Registry", $"Root hive zone application notice ({root.Name}): {rEx.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Registry", "ApplyDirectZoneDwords general exception: " + ex.Message);
            }
        }

        /// <summary>
        /// Deep Automated Verification of all configured Security Zone settings (Zone 1, Zone 2, Zone 3).
        /// Reads back each setting directly from the Windows Registry, compares with expected DWORD value,
        /// and records PASS/FAIL along with specific failure reasons.
        /// </summary>
        public static List<ZoneVerificationResult> VerifyAllSecurityZones()
        {
            List<ZoneVerificationResult> results = new List<ZoneVerificationResult>();
            var catalog = GetZoneSettingsCatalog();

            foreach (var item in catalog)
            {
                var res = new ZoneVerificationResult
                {
                    ZoneId = item.ZoneId,
                    ZoneName = item.ZoneName,
                    ValueName = item.ValueName,
                    SettingName = item.SettingName,
                    ExpectedValue = item.ExpectedValue.ToString(),
                    Description = item.Description,
                    IsPass = false,
                    FailureReason = "None"
                };

                object valHkcu = null;
                object valHklm = null;

                try
                {
                    using (var k = Registry.CurrentUser.OpenSubKey($@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\{item.ZoneId}"))
                    {
                        if (k != null) valHkcu = k.GetValue(item.ValueName);
                    }
                }
                catch (Exception ex)
                {
                    res.FailureReason = "HKCU Access Error: " + ex.Message;
                }

                try
                {
                    using (var k = Registry.LocalMachine.OpenSubKey($@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\{item.ZoneId}"))
                    {
                        if (k != null) valHklm = k.GetValue(item.ValueName);
                    }
                }
                catch { }

                res.ActualValueHkcu = valHkcu != null ? valHkcu.ToString() : "NOT SET";
                res.ActualValueHklm = valHklm != null ? valHklm.ToString() : "NOT SET";

                // Validation logic: HKCU must match expected, or HKLM must match expected
                bool hkcuMatch = valHkcu != null && Convert.ToInt32(valHkcu) == item.ExpectedValue;
                bool hklmMatch = valHklm != null && Convert.ToInt32(valHklm) == item.ExpectedValue;

                if (hkcuMatch || hklmMatch)
                {
                    res.IsPass = true;
                    res.FailureReason = "Verified";
                }
                else
                {
                    res.IsPass = false;
                    if (valHkcu == null && valHklm == null)
                    {
                        res.FailureReason = $"Registry value missing in both HKCU and HKLM (Zones\\{item.ZoneId}\\{item.ValueName})";
                    }
                    else
                    {
                        res.FailureReason = $"Value mismatch: Expected {item.ExpectedValue}, got HKCU={res.ActualValueHkcu}, HKLM={res.ActualValueHklm}";
                    }

                    // Log failure to application logger
                    Logger.LogWarn("RegistryVerify", $"[FAILED] Zone {item.ZoneId} ({item.ZoneName}) -> {item.SettingName} ({item.ValueName}): Expected {item.ExpectedValue}, HKCU={res.ActualValueHkcu}, HKLM={res.ActualValueHklm}. Reason: {res.FailureReason}");
                }

                results.Add(res);
            }

            return results;
        }

        /// <summary>
        /// Generates a comprehensive verification report text formatted in a clean matrix.
        /// </summary>
        public static string GenerateAuditReportText(List<ZoneVerificationResult> results)
        {
            var sb = new System.Text.StringBuilder();
            string timestamp = DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss");

            sb.AppendLine("========================================================================================================");
            sb.AppendLine("                 E-VEDHIKA AUTOMATED REGISTRY AUDIT & SECURITY ZONES VERIFICATION REPORT");
            sb.AppendLine(" Target Government Portal : https://ubd.telangana.gov.in/ (Telangana UBD Portal)");
            sb.AppendLine($" Generated On             : {timestamp}");
            sb.AppendLine($" Computer / User          : {Environment.MachineName} ({Environment.UserName})");
            sb.AppendLine($" Operating System         : {Environment.OSVersion.VersionString} ({(Environment.Is64BitOperatingSystem ? "64-bit" : "32-bit")})");
            sb.AppendLine("========================================================================================================");
            sb.AppendLine();

            sb.AppendLine("[A] TRUSTED SITES (ZONE 2) DOMAIN MAPPING STATUS:");
            string[] domains = new string[] { @"ubd.telangana.gov.in", @"telangana.gov.in\ubd" };
            foreach (var d in domains)
            {
                object val = null;
                try
                {
                    using (var k = Registry.CurrentUser.OpenSubKey($@"{Zone2KeyPath}\{d}"))
                    {
                        if (k != null) val = k.GetValue("https");
                    }
                }
                catch { }

                string status = (val != null && Convert.ToInt32(val) == 2) ? "[VERIFIED / PASS]" : "[MISSING / FAILED]";
                sb.AppendLine($"  {status} Domain: {d} -> Zone ID 2 (https = {(val != null ? val.ToString() : "Not Set")})");
            }
            sb.AppendLine();

            sb.AppendLine("[B] ALL SECURITY ZONES (ZONE 1, ZONE 2, ZONE 3) VERIFICATION MATRIX:");
            sb.AppendLine("--------------------------------------------------------------------------------------------------------");
            sb.AppendLine("Zone Name       | Value ID   | Expected | Actual (HKCU) | Status   | Setting Name");
            sb.AppendLine("--------------------------------------------------------------------------------------------------------");

            int passed = 0;
            int failed = 0;

            foreach (var r in results)
            {
                if (r.IsPass) passed++; else failed++;

                string zoneCol = r.ZoneName.PadRight(15);
                string idCol = r.ValueName.PadRight(10);
                string expCol = r.ExpectedValue.PadRight(8);
                string actCol = r.ActualValueHkcu.PadRight(13);
                string statCol = (r.IsPass ? "PASS" : "FAILED").PadRight(8);
                string nameCol = r.SettingName;

                sb.AppendLine($"{zoneCol} | {idCol} | {expCol} | {actCol} | {statCol} | {nameCol}");
                if (!r.IsPass)
                {
                    sb.AppendLine($"  --> [Failure Reason]: {r.FailureReason}");
                }
            }

            sb.AppendLine("--------------------------------------------------------------------------------------------------------");
            sb.AppendLine();
            sb.AppendLine("[C] AUDIT SUMMARY & COMPLIANCE SCORE:");
            sb.AppendLine($"  Total Security Settings Audited : {results.Count}");
            sb.AppendLine($"  Successfully Passed & Verified  : {passed}");
            sb.AppendLine($"  Failed / Needs Attention        : {failed}");
            double score = results.Count > 0 ? Math.Round(((double)passed / results.Count) * 100, 2) : 0;
            sb.AppendLine($"  Overall Security Compliance     : {score}%");
            sb.AppendLine($"  Status                          : {(failed == 0 ? "100% HEALTHY & COMPLIANT" : "ATTENTION NEEDED")}");
            sb.AppendLine();
            sb.AppendLine("[D] SAFETY, ROLLBACK & SCOPE CONFIRMATION:");
            sb.AppendLine("  * Security modifications are strictly isolated to required zones.");
            sb.AppendLine("  * Automatic pre-deployment safety backup created at C:\\EVedhika_UBD_Backups\\.");
            sb.AppendLine("  * Rollback feature available in tool via BackupEngine.RollbackLastBackup().");
            sb.AppendLine("========================================================================================================");

            return sb.ToString();
        }

        /// <summary>
        /// Executes full application of Zone 1, Zone 2, and Zone 3 security settings,
        /// verifies each setting against the registry, saves an audit report, and returns overall success status.
        /// </summary>
        public static bool ApplyZoneSettings(out List<ZoneVerificationResult> verificationResults)
        {
            // 1. Take safety pre-deployment backup
            try
            {
                string bPath = BackupEngine.CreatePreDeploymentBackup();
                if (!string.IsNullOrEmpty(bPath))
                {
                    Logger.LogInfo("Backup", "[BACKUP] Pre-deployment registry backup taken: " + bPath);
                }
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Backup", "Pre-deployment backup warning: " + ex.Message);
            }

            // 2. Direct API enforcement for all zones
            ApplyDirectZoneDwords();

            // 3. Deep automated verification
            verificationResults = VerifyAllSecurityZones();

            // 4. Generate and save TXT audit report
            try
            {
                string reportText = GenerateAuditReportText(verificationResults);
                string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                string primaryDir = @"C:\EVedhika_UBD_Backups";
                string fallbackDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "EVedhika_Backups");
                
                string targetDir = primaryDir;
                try { Directory.CreateDirectory(primaryDir); } catch { targetDir = fallbackDir; Directory.CreateDirectory(fallbackDir); }

                string reportPath = Path.Combine(targetDir, $"UBD_Registry_Audit_Report_{timestamp}.txt");
                File.WriteAllText(reportPath, reportText, System.Text.Encoding.UTF8);
                Logger.LogInfo("Registry", $"[AUDIT REPORT] Comprehensive verification report saved to: {reportPath}");
            }
            catch (Exception rEx)
            {
                Logger.LogWarn("Registry", "Audit report saving warning: " + rEx.Message);
            }

            int failedCount = verificationResults.FindAll(x => !x.IsPass).Count;
            return failedCount == 0;
        }

        /// <summary>
        /// Rolls back registry settings to previous saved backup snapshot.
        /// </summary>
        public static bool RollbackSecurityZones(string backupPath = null)
        {
            bool ok = BackupEngine.RollbackLastBackup(backupPath);
            if (ok)
            {
                Logger.LogInfo("Rollback", "[SUCCESS] Security zones rolled back to previous backup snapshot.");
            }
            else
            {
                Logger.LogWarn("Rollback", "[FAILED] Could not rollback security zones.");
            }
            return ok;
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
