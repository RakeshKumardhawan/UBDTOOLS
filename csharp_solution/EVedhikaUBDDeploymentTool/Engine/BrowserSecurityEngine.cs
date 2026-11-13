using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Win32;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class BrowserSecurityEngine
    {
        private const string EdgePoliciesPath = @"SOFTWARE\Policies\Microsoft\Edge";
        private const string WindowsSystemPolicyPath = @"SOFTWARE\Policies\Microsoft\Windows\System";
        private const string ExplorerPath = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer";

        // Native Win32 API to remove NTFS Alternate Data Stream (:Zone.Identifier)
        // Necessary because .NET Framework 4.8 System.IO.File.Delete throws NotSupportedException on ':' in stream paths
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern bool DeleteFileW(string lpFileName);

        /// <summary>
        /// Natively strips Mark-of-the-Web (:Zone.Identifier) from a file at the Win32 kernel level
        /// without spawning PowerShell or requiring any manual user commands.
        /// </summary>
        public static bool RemoveZoneIdentifier(string filePath)
        {
            if (string.IsNullOrEmpty(filePath)) return false;
            try
            {
                return DeleteFileW(filePath + ":Zone.Identifier");
            }
            catch
            {
                return false;
            }
        }

        public static bool ApplyBrowserSecurityFixes()
        {
            try
            {
                const string exemptJson = "[{\"domains\": [\"ubd.telangana.gov.in\", \"ubd.ap.gov.in\", \"e-vedhika.in\", \"telangana.gov.in\", \"ap.gov.in\", \"github.com\", \"githubusercontent.com\"], \"file_extension\": \"xls\"}, {\"domains\": [\"ubd.telangana.gov.in\", \"ubd.ap.gov.in\", \"e-vedhika.in\", \"telangana.gov.in\", \"ap.gov.in\", \"github.com\", \"githubusercontent.com\"], \"file_extension\": \"xlsx\"}, {\"domains\": [\"e-vedhika.in\", \"github.com\", \"githubusercontent.com\"], \"file_extension\": \"exe\"}]";

                // 1. Configure Microsoft Edge Policies for Unrestricted Downloads & Legacy Handling
                using (RegistryKey edgeKey = Registry.CurrentUser.CreateSubKey(EdgePoliciesPath))
                {
                    if (edgeKey != null)
                    {
                        edgeKey.SetValue("SmartScreenEnabled", 0, RegistryValueKind.DWord);
                        edgeKey.SetValue("SmartScreenPuaEnabled", 0, RegistryValueKind.DWord);
                        edgeKey.SetValue("DownloadRestrictions", 0, RegistryValueKind.DWord);
                        edgeKey.SetValue("PromptForDownloadLocation", 0, RegistryValueKind.DWord);
                        edgeKey.SetValue("InsecureContentAllowedForUrls", new string[] { "http://*.telangana.gov.in", "https://*.telangana.gov.in", "http://*.gov.in", "https://*.gov.in", "https://*.e-vedhika.in" }, RegistryValueKind.MultiString);
                        edgeKey.SetValue("ExemptDomainFileTypePairsFromFileTypeDownloadWarnings", exemptJson, RegistryValueKind.String);
                    }
                }

                // Attempt HKLM for Edge Policies
                try
                {
                    using (RegistryKey edgeKeyHKLM = Registry.LocalMachine.CreateSubKey(EdgePoliciesPath))
                    {
                        if (edgeKeyHKLM != null)
                        {
                            edgeKeyHKLM.SetValue("SmartScreenEnabled", 0, RegistryValueKind.DWord);
                            edgeKeyHKLM.SetValue("SmartScreenPuaEnabled", 0, RegistryValueKind.DWord);
                            edgeKeyHKLM.SetValue("DownloadRestrictions", 0, RegistryValueKind.DWord);
                            edgeKeyHKLM.SetValue("InsecureContentAllowedForUrls", new string[] { "http://*.telangana.gov.in", "https://*.telangana.gov.in", "http://*.gov.in", "https://*.gov.in", "https://*.e-vedhika.in" }, RegistryValueKind.MultiString);
                            edgeKeyHKLM.SetValue("ExemptDomainFileTypePairsFromFileTypeDownloadWarnings", exemptJson, RegistryValueKind.String);
                        }
                    }
                }
                catch { }

                // 2. Configure Google Chrome Policies (HKCU & HKLM) to Unblock .xls / .xlsx / .exe Downloads
                const string ChromePoliciesPath = @"SOFTWARE\Policies\Google\Chrome";
                try
                {
                    using (RegistryKey chromeKey = Registry.CurrentUser.CreateSubKey(ChromePoliciesPath))
                    {
                        if (chromeKey != null)
                        {
                            chromeKey.SetValue("DownloadRestrictions", 0, RegistryValueKind.DWord);
                            chromeKey.SetValue("SafeBrowsingProtectionLevel", 0, RegistryValueKind.DWord);
                            chromeKey.SetValue("AllowFileSelectionDialogs", 1, RegistryValueKind.DWord);
                            chromeKey.SetValue("ExemptDomainFileTypePairsFromFileTypeDownloadWarnings", exemptJson, RegistryValueKind.String);
                            chromeKey.SetValue("InsecureContentAllowedForUrls", new string[] { "http://*.telangana.gov.in", "https://*.telangana.gov.in", "http://*.gov.in", "https://*.gov.in", "https://*.e-vedhika.in" }, RegistryValueKind.MultiString);
                        }
                    }
                }
                catch { }

                try
                {
                    using (RegistryKey chromeKeyHKLM = Registry.LocalMachine.CreateSubKey(ChromePoliciesPath))
                    {
                        if (chromeKeyHKLM != null)
                        {
                            chromeKeyHKLM.SetValue("DownloadRestrictions", 0, RegistryValueKind.DWord);
                            chromeKeyHKLM.SetValue("SafeBrowsingProtectionLevel", 0, RegistryValueKind.DWord);
                            chromeKeyHKLM.SetValue("AllowFileSelectionDialogs", 1, RegistryValueKind.DWord);
                            chromeKeyHKLM.SetValue("ExemptDomainFileTypePairsFromFileTypeDownloadWarnings", exemptJson, RegistryValueKind.String);
                            chromeKeyHKLM.SetValue("InsecureContentAllowedForUrls", new string[] { "http://*.telangana.gov.in", "https://*.telangana.gov.in", "http://*.gov.in", "https://*.gov.in", "https://*.e-vedhika.in" }, RegistryValueKind.MultiString);
                        }
                    }
                }
                catch { }

                // 3. Disable OS-level SmartScreen / Windows Defender SmartScreen blocks on files and downloads
                try
                {
                    using (RegistryKey sysPolicyKey = Registry.LocalMachine.CreateSubKey(WindowsSystemPolicyPath))
                    {
                        if (sysPolicyKey != null)
                        {
                            sysPolicyKey.SetValue("EnableSmartScreen", 0, RegistryValueKind.DWord);
                            sysPolicyKey.SetValue("ShellSmartScreenLevel", "Off", RegistryValueKind.String);
                        }
                    }
                }
                catch { }

                try
                {
                    using (RegistryKey sysPolicyUserKey = Registry.CurrentUser.CreateSubKey(WindowsSystemPolicyPath))
                    {
                        if (sysPolicyUserKey != null)
                        {
                            sysPolicyUserKey.SetValue("EnableSmartScreen", 0, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

                try
                {
                    using (RegistryKey explorerKey = Registry.CurrentUser.CreateSubKey(ExplorerPath))
                    {
                        if (explorerKey != null)
                        {
                            explorerKey.SetValue("SmartScreenEnabled", "Off", RegistryValueKind.String);
                        }
                    }
                }
                catch { }

                // 4. Automatically configure Windows Defender Self-Exclusion, Smart App Control Bypass & Error 4551 Fix
                ConfigureAntivirusSelfExclusion();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Browser Security repair failed: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// 100% Automatic Self-Protecting Engine:
        /// - Strips NTFS Zone.Identifier (Mark of the Web) using native Win32 DeleteFileW
        /// - Configures Windows 11 Smart App Control & Error 4551 Temp Execution Policies
        /// - Suppresses future Mark-of-the-Web attachment tagging on all downloaded files
        /// - Installs E-Vedhika Trusted Publisher Certificate into LocalMachine Root & TrustedPublisher
        /// - Registers Windows Defender Path, Process & Extension Exclusions automatically
        /// </summary>
        public static void ConfigureAntivirusSelfExclusion()
        {
            try
            {
                string exePath = System.Reflection.Assembly.GetExecutingAssembly().Location;
                string exeDir = Path.GetDirectoryName(exePath);
                string exeName = Path.GetFileName(exePath);
                string downloadsDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads");
                string userTempDir = Path.GetTempPath().TrimEnd('\\');
                string safeProgramData = @"C:\ProgramData\EVedhika";
                string safeSetupTemp = @"C:\ProgramData\EVedhika\SetupTemp";
                string safeUpdatesDir = @"C:\ProgramData\EVedhika\Updates";

                // 0. Ensure Trusted Directories exist
                try
                {
                    if (!Directory.Exists(safeProgramData)) Directory.CreateDirectory(safeProgramData);
                    if (!Directory.Exists(safeSetupTemp)) Directory.CreateDirectory(safeSetupTemp);
                    if (!Directory.Exists(safeUpdatesDir)) Directory.CreateDirectory(safeUpdatesDir);
                }
                catch { }

                // 1. Natively strip NTFS :Zone.Identifier from current EXE, App Dir, Downloads, and Temp
                try
                {
                    RemoveZoneIdentifier(exePath);
                    UnblockDirectoryFiles(exeDir);
                    UnblockDirectoryFiles(safeProgramData);
                    UnblockDirectoryFiles(downloadsDir);
                }
                catch { }

                // 2. Install E-Vedhika Trusted Root & Publisher Certificate automatically if present
                try
                {
                    string cerPath = Path.Combine(exeDir, "EVedhika_TrustedRoot.cer");
                    if (File.Exists(cerPath))
                    {
                        X509Certificate2 cert = new X509Certificate2(cerPath);
                        X509Store rootStore = new X509Store(StoreName.Root, StoreLocation.LocalMachine);
                        try
                        {
                            rootStore.Open(OpenFlags.ReadWrite);
                            if (!rootStore.Certificates.Contains(cert))
                            {
                                rootStore.Add(cert);
                            }
                        }
                        finally
                        {
                            rootStore.Close();
                        }

                        X509Store pubStore = new X509Store(StoreName.TrustedPublisher, StoreLocation.LocalMachine);
                        try
                        {
                            pubStore.Open(OpenFlags.ReadWrite);
                            if (!pubStore.Certificates.Contains(cert))
                            {
                                pubStore.Add(cert);
                            }
                        }
                        finally
                        {
                            pubStore.Close();
                        }
                    }
                }
                catch { }

                // 3. Disable Windows 11 Smart App Control & Error 4551 Temp Execution Block in Registry
                try
                {
                    using (RegistryKey ciKey = Registry.LocalMachine.CreateSubKey(@"SYSTEM\CurrentControlSet\Control\CI\Policy"))
                    {
                        if (ciKey != null)
                        {
                            ciKey.SetValue("VerifiedAndReputablePolicyState", 0, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

                try
                {
                    using (RegistryKey defSmartScreen = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Policies\Microsoft\Windows Defender\SmartScreen"))
                    {
                        if (defSmartScreen != null)
                        {
                            defSmartScreen.SetValue("ConfigureAppInstallControlEnabled", 0, RegistryValueKind.DWord);
                            defSmartScreen.SetValue("ConfigureAppInstallControl", "Anywhere", RegistryValueKind.String);
                        }
                    }
                }
                catch { }

                // Allow Software Restriction Policy Unrestricted Execution (Prevents Error 4551 in %TEMP%)
                try
                {
                    using (RegistryKey saferKey = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Policies\Microsoft\Windows\Safer\CodeIdentifiers"))
                    {
                        if (saferKey != null)
                        {
                            saferKey.SetValue("DefaultLevel", 0x00040000, RegistryValueKind.DWord); // Unrestricted
                            saferKey.SetValue("TransparentEnabled", 0, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

                // 4. Permanently disable Mark-of-the-Web (Zone.Identifier) tagging on all future downloads
                try
                {
                    using (RegistryKey attCu = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Policies\Attachments"))
                    {
                        if (attCu != null)
                        {
                            attCu.SetValue("SaveZoneInformation", 1, RegistryValueKind.DWord);
                            attCu.SetValue("ScanWithAntiVirus", 1, RegistryValueKind.DWord);
                            attCu.SetValue("HideZoneInfoOnProperties", 1, RegistryValueKind.DWord);
                        }
                    }
                    using (RegistryKey attLm = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Attachments"))
                    {
                        if (attLm != null)
                        {
                            attLm.SetValue("SaveZoneInformation", 1, RegistryValueKind.DWord);
                            attLm.SetValue("ScanWithAntiVirus", 1, RegistryValueKind.DWord);
                            attLm.SetValue("HideZoneInfoOnProperties", 1, RegistryValueKind.DWord);
                        }
                    }
                    using (RegistryKey assocCu = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Policies\Associations"))
                    {
                        if (assocCu != null)
                        {
                            assocCu.SetValue("LowRiskFileTypes", ".exe;.bat;.cmd;.ps1;.msi;.reg;.zip;.cab;.xls;.xlsx", RegistryValueKind.String);
                        }
                    }
                    using (RegistryKey assocLm = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Associations"))
                    {
                        if (assocLm != null)
                        {
                            assocLm.SetValue("LowRiskFileTypes", ".exe;.bat;.cmd;.ps1;.msi;.reg;.zip;.cab;.xls;.xlsx", RegistryValueKind.String);
                        }
                    }
                    // Allow launching applications and files in Internet Zone without prompt
                    using (RegistryKey zone3 = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\3"))
                    {
                        if (zone3 != null)
                        {
                            zone3.SetValue("1806", 0, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

                // 5. Configure LocalMachine Registry Policies for Windows Defender Exclusions
                try
                {
                    using (RegistryKey procKey = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Policies\Microsoft\Windows Defender\Exclusions\Processes"))
                    {
                        if (procKey != null)
                        {
                            if (!string.IsNullOrEmpty(exeName)) procKey.SetValue(exeName, 0, RegistryValueKind.DWord);
                            procKey.SetValue("EVedhikaUBDDeploymentTool.exe", 0, RegistryValueKind.DWord);
                            procKey.SetValue("EVedhika_Setup_v1.0.9.exe", 0, RegistryValueKind.DWord);
                            procKey.SetValue("EVedhikaAutoRepair.exe", 0, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

                try
                {
                    using (RegistryKey pathKey = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Policies\Microsoft\Windows Defender\Exclusions\Paths"))
                    {
                        if (pathKey != null)
                        {
                            if (!string.IsNullOrEmpty(exeDir)) pathKey.SetValue(exeDir, 0, RegistryValueKind.DWord);
                            pathKey.SetValue(safeProgramData, 0, RegistryValueKind.DWord);
                            pathKey.SetValue(safeSetupTemp, 0, RegistryValueKind.DWord);
                            pathKey.SetValue(safeUpdatesDir, 0, RegistryValueKind.DWord);
                            if (!string.IsNullOrEmpty(downloadsDir)) pathKey.SetValue(downloadsDir, 0, RegistryValueKind.DWord);
                            if (!string.IsNullOrEmpty(userTempDir)) pathKey.SetValue(userTempDir, 0, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

                try
                {
                    using (RegistryKey extKey = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Policies\Microsoft\Windows Defender\Exclusions\Extensions"))
                    {
                        if (extKey != null)
                        {
                            extKey.SetValue(".tmp", 0, RegistryValueKind.DWord);
                            extKey.SetValue(".reg", 0, RegistryValueKind.DWord);
                            extKey.SetValue(".xml", 0, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }
            }
            catch { }
        }

        public static void UnblockDirectoryFiles(string directoryPath)
        {
            if (string.IsNullOrEmpty(directoryPath) || !Directory.Exists(directoryPath)) return;
            try
            {
                string[] files = Directory.GetFiles(directoryPath);
                foreach (string file in files)
                {
                    RemoveZoneIdentifier(file);
                }
            }
            catch { }
        }
    }
}
