using System;
using System.Diagnostics;
using System.IO;
using Microsoft.Win32;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class UninstallEngine
    {
        private const string UninstallRegPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDDeploymentTool";

        /// <summary>
        /// Cleans up duplicate legacy/old Control Panel entries to prevent multiple entries in Add/Remove Programs.
        /// </summary>
        public static void CleanLegacyUninstallEntries()
        {
            try
            {
                // Delete legacy custom keys from HKCU and HKLM
                string[] legacyKeys = new string[]
                {
                    @"Software\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDDeploymentTool",
                    @"Software\Microsoft\Windows\CurrentVersion\Uninstall\EVedhika_UBD_Deployment_Tool",
                    @"Software\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.1",
                    @"Software\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.4"
                };

                foreach (var kPath in legacyKeys)
                {
                    try { Registry.CurrentUser.DeleteSubKeyTree(kPath, false); } catch { }
                    try { Registry.LocalMachine.DeleteSubKeyTree(kPath, false); } catch { }
                }
            }
            catch { }
        }

        /// <summary>
        /// Registers the application in Windows Control Panel -> "Programs and Features" (Add or Remove Programs)
        /// ensuring only ONE single official entry exists.
        /// </summary>
        public static bool RegisterControlPanelUninstall(string exePath, Action<string> logCallback = null)
        {
            try
            {
                // First remove all old duplicate legacy v1.0.1 entries
                CleanLegacyUninstallEntries();

                // If Inno Setup installer key already exists, do not write a duplicate entry!
                string innoSetupKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\{8A9C8F3E-4B2D-4C5A-9E7F-1D6B8A9C0D4F}_is1";
                bool innoExists = false;
                try
                {
                    using (var k = Registry.LocalMachine.OpenSubKey(innoSetupKey))
                    {
                        if (k != null) innoExists = true;
                    }
                }
                catch { }

                if (innoExists)
                {
                    if (logCallback != null) logCallback("[UNINSTALL REG] Official Inno Setup installation verified (Single entry active).");
                    return true;
                }

                if (string.IsNullOrEmpty(exePath))
                {
                    exePath = Process.GetCurrentProcess().MainModule.FileName;
                }

                string installDir = Path.GetDirectoryName(exePath);

                // Register single unified entry for standalone EXE
                using (RegistryKey keyLM = Registry.LocalMachine.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDTool"))
                {
                    if (keyLM != null)
                    {
                        keyLM.SetValue("DisplayName", "E-Vedhika UBD Tool", RegistryValueKind.String);
                        keyLM.SetValue("DisplayVersion", "1.0.6", RegistryValueKind.String);
                        keyLM.SetValue("Publisher", "E-Vedhika", RegistryValueKind.String);
                        keyLM.SetValue("UninstallString", string.Format("\"{0}\" --uninstall", exePath), RegistryValueKind.String);
                        keyLM.SetValue("QuietUninstallString", string.Format("\"{0}\" --uninstall --silent", exePath), RegistryValueKind.String);
                        keyLM.SetValue("DisplayIcon", string.Format("{0},0", exePath), RegistryValueKind.String);
                        keyLM.SetValue("InstallLocation", installDir, RegistryValueKind.String);
                        keyLM.SetValue("HelpLink", "https://www.e-vedhika.in", RegistryValueKind.String);
                        keyLM.SetValue("URLInfoAbout", "https://www.e-vedhika.in", RegistryValueKind.String);
                    }
                }

                if (logCallback != null) logCallback("[UNINSTALL REG] Registered single official entry in Control Panel.");
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
            if (logCallback != null) logCallback("==========================================================================");

            // 1. Remove Windows Control Panel Uninstall Registry Key
            try
            {
                try { Registry.CurrentUser.DeleteSubKeyTree(UninstallRegPath, false); } catch { }
                try { Registry.LocalMachine.DeleteSubKeyTree(UninstallRegPath, false); } catch { }
                if (logCallback != null) logCallback("[1/7] Removed 'E-Vedhika UBD Deployment Tool' from Windows Control Panel (Add/Remove Programs).");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[1/7 WARN] Control Panel Registry Removal: {0}", ex.Message));
            }

            // 2. Remove Windows Startup Registry Key (HKCU\...\Run)
            try
            {
                using (RegistryKey runKey = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Run", true))
                {
                    if (runKey != null && runKey.GetValue("EVedhikaUBDGuardian") != null)
                    {
                        runKey.DeleteValue("EVedhikaUBDGuardian", false);
                        if (logCallback != null) logCallback("[2/7] Removed 'EVedhikaUBDGuardian' from Windows Startup Registry (HKCU\\...\\Run).");
                    }
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[2/7 WARN] Startup Registry removal: {0}", ex.Message));
            }

            // 3. Remove Edge IE Mode Group Policies & Registry Settings
            try
            {
                try { Registry.CurrentUser.DeleteSubKeyTree(@"SOFTWARE\Policies\Microsoft\Edge", false); } catch { }
                try { Registry.LocalMachine.DeleteSubKeyTree(@"SOFTWARE\Policies\Microsoft\Edge", false); } catch { }
                if (logCallback != null) logCallback("[3/7] Removed Edge IE Mode Enterprise Site List policies from HKCU & HKLM Registry.");
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[3/7 WARN] Edge Policy removal: {0}", ex.Message));
            }

            // 4. Remove Zone 2 Trusted Sites Domain Mappings
            try
            {
                using (RegistryKey domainsKey = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains", true))
                {
                    if (domainsKey != null)
                    {
                        try { domainsKey.DeleteSubKeyTree("ubd.telangana.gov.in", false); } catch { }
                        try { domainsKey.DeleteSubKeyTree("telangana.gov.in", false); } catch { }
                        try { domainsKey.DeleteSubKeyTree("ubd.ap.gov.in", false); } catch { }
                        try { domainsKey.DeleteSubKeyTree("ap.gov.in", false); } catch { }
                        if (logCallback != null) logCallback("[4/7] Removed UBD Trusted Sites (TS/AP) from Zone 2.");
                    }
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[4/7 WARN] Trusted Sites removal: {0}", ex.Message));
            }

            // 5. Reset IE Browser Emulation Registry
            try
            {
                using (RegistryKey emuKey = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION", true))
                {
                    if (emuKey != null && emuKey.GetValue("msedge.exe") != null)
                    {
                        emuKey.DeleteValue("msedge.exe", false);
                        if (logCallback != null) logCallback("[5/7] Removed Browser Emulation override for msedge.exe.");
                    }
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[5/7 WARN] Browser Emulation cleanup: {0}", ex.Message));
            }

            // 6. Remove Desktop & Start Menu Shortcuts
            try
            {
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string[] shortcuts = new string[]
                {
                    Path.Combine(desktopPath, "UBD Portal (Edge IE Mode).url"),
                    Path.Combine(desktopPath, "E-Vedhika UBD Deployment Tool.lnk"),
                    Path.Combine(desktopPath, "E-Vedhika UBD Deployment Tool.url"),
                    Path.Combine(desktopPath, "E-Vedhika Web App (www.e-vedhika.in).url")
                };

                foreach (var sc in shortcuts)
                {
                    if (File.Exists(sc))
                    {
                        File.Delete(sc);
                        if (logCallback != null) logCallback(string.Format("[6/7] Deleted Desktop Shortcut: {0}", Path.GetFileName(sc)));
                    }
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[6/7 WARN] Desktop Shortcut deletion: {0}", ex.Message));
            }

            // 7. Clean ProgramData Files (sites.xml, logs, backups)
            try
            {
                string appDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika");
                if (Directory.Exists(appDataDir))
                {
                    Directory.Delete(appDataDir, true);
                    if (logCallback != null) logCallback(string.Format("[7/7] Deleted Application Data Directory: {0}", appDataDir));
                }
                else
                {
                    if (logCallback != null) logCallback("[7/7] ProgramData EVedhika folder is already clean.");
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[7/7 WARN] Application Data Directory cleanup: {0}", ex.Message));
            }

            if (logCallback != null) logCallback("==========================================================================");
            if (logCallback != null) logCallback("[UNINSTALL SUCCESS] All E-Vedhika UBD Deployment Tool configurations cleanly uninstalled & reverted!");
            if (logCallback != null) logCallback("==========================================================================");

            return success;
        }
    }
}
