using System;
using System.IO;
using System.Diagnostics;
using System.Net;
using Microsoft.Win32;

namespace EVedhikaUBDDeploymentTool.Engine
{
    /// <summary>
    /// Manages Microsoft Edge detection, silent updates, and auto-installation/reinstallation
    /// for systems where Edge was uninstalled, removed, or is running an outdated version.
    /// Supports both local offline installers (inside 'installers/' folder) and silent official web installs.
    /// </summary>
    public static class EdgeManagementEngine
    {
        private static readonly string[] PossibleEdgePaths = new string[]
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe")
        };

        private static readonly string[] PossibleEdgeUpdatePaths = new string[]
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\EdgeUpdate\MicrosoftEdgeUpdate.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\EdgeUpdate\MicrosoftEdgeUpdate.exe")
        };

        public static bool IsEdgeInstalled()
        {
            foreach (var path in PossibleEdgePaths)
            {
                if (File.Exists(path)) return true;
            }

            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe"))
                {
                    if (key != null) return true;
                }
            }
            catch { }

            return false;
        }

        public static string GetInstalledEdgePath()
        {
            foreach (var path in PossibleEdgePaths)
            {
                if (File.Exists(path)) return path;
            }

            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe"))
                {
                    if (key != null)
                    {
                        object valObj = key.GetValue(null);
                        string val = valObj != null ? valObj.ToString() : null;
                        if (!string.IsNullOrEmpty(val) && File.Exists(val)) return val;
                    }
                }
            }
            catch { }

            return null;
        }

        public static int GetEdgeMajorVersion()
        {
            try
            {
                string path = GetInstalledEdgePath();
                if (!string.IsNullOrEmpty(path) && File.Exists(path))
                {
                    var versionInfo = FileVersionInfo.GetVersionInfo(path);
                    return versionInfo.FileMajorPart;
                }

                // Check registry
                using (RegistryKey key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{56EB18F8-B008-4CBD-B6D2-8C97FE7E9062}"))
                {
                    if (key != null)
                    {
                        object pv = key.GetValue("pv");
                        if (pv != null)
                        {
                            string versionStr = pv.ToString();
                            string major = versionStr.Split('.')[0];
                            int result;
                            if (int.TryParse(major, out result)) return result;
                        }
                    }
                }
            }
            catch { }

            return 0; // Not installed or unknown
        }

        /// <summary>
        /// Ensures Microsoft Edge is present and updated for IE Mode compatibility.
        /// If missing or outdated (< 95), installs or triggers update automatically.
        /// </summary>
        public static bool EnsureEdgeInstalledAndUpdated(Action<string> logCallback)
        {
            try
            {
                bool installed = IsEdgeInstalled();
                int majorVersion = GetEdgeMajorVersion();

                if (!installed)
                {
                    if (logCallback != null) logCallback("[EDGE MISSING] Microsoft Edge was not found on this system (it may have been removed or stripped).");
                    if (logCallback != null) logCallback("[EDGE INSTALL] Initiating automated installation of Microsoft Edge...");
                    return InstallOrReinstallEdge(logCallback);
                }

                if (logCallback != null) logCallback(string.Format("[EDGE DETECTED] Microsoft Edge Version: {0}.x found.", majorVersion));

                // If Edge is very old (e.g. earlier than version 95), trigger silent update
                if (majorVersion > 0 && majorVersion < 95)
                {
                    if (logCallback != null) logCallback(string.Format("[EDGE OUTDATED] Edge version ({0}) is outdated. Triggering Microsoft Edge Update...", majorVersion));
                    TriggerEdgeUpdate(logCallback);
                }
                else
                {
                    if (logCallback != null) logCallback("[EDGE STATUS] Microsoft Edge is modern and fully compatible with IE5 Quirks Mode.");
                }

                return true;
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[EDGE WARNING] Edge validation notice: {0}", ex.Message));
                return false;
            }
        }

        /// <summary>
        /// Installs or reinstalls Microsoft Edge.
        /// Automatically identifies whether the system is 32-Bit (x86) or 64-Bit (x64) and selects the matching package.
        /// First checks local 'installers/' directory for offline setups, then attempts official silent web download.
        /// </summary>
        public static bool InstallOrReinstallEdge(Action<string> logCallback)
        {
            bool is64BitOS = Environment.Is64BitOperatingSystem;
            string archName = is64BitOS ? "64-Bit (x64)" : "32-Bit (x86)";
            if (logCallback != null) logCallback(string.Format("[SYSTEM ARCHITECTURE] Detected Windows: {0}", archName));
            if (logCallback != null) logCallback(string.Format("[1/3] Searching for matching {0} Microsoft Edge installer in 'installers/' directory...", archName));

            // 1. Check local 'installers/' folder and current directory
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string installersDir = Path.Combine(appDir, "installers");

            string[] searchDirs = new string[] { installersDir, appDir };
            string[] installerPatterns = new string[]
            {
                "MicrosoftEdgeSetup*.exe",
                "MicrosoftEdgeEnterprise*.msi",
                "EdgeSetup*.exe",
                "MicrosoftEdge*.exe",
                "MicrosoftEdge*.msi"
            };

            var candidateFiles = new System.Collections.Generic.List<string>();
            foreach (var dir in searchDirs)
            {
                if (!Directory.Exists(dir)) continue;

                foreach (var pattern in installerPatterns)
                {
                    var files = Directory.GetFiles(dir, pattern);
                    foreach (var file in files)
                    {
                        string fileName = Path.GetFileName(file);
                        if (fileName.IndexOf("EVedhika", StringComparison.OrdinalIgnoreCase) >= 0) continue;
                        if (!candidateFiles.Contains(file)) candidateFiles.Add(file);
                    }
                }
            }

            // Sort candidates by compatibility with current architecture
            var prioritizedFiles = new System.Collections.Generic.List<string>();
            foreach (var file in candidateFiles)
            {
                string fn = Path.GetFileName(file).ToLowerInvariant();

                if (!is64BitOS && (fn.Contains("x64") || fn.Contains("64bit") || fn.Contains("amd64")))
                {
                    // 64-bit installer CANNOT run on 32-bit Windows!
                    if (logCallback != null) logCallback(string.Format("[ARCH SKIP] Skipping '{0}' - 64-bit packages cannot run on a 32-bit OS.", Path.GetFileName(file)));
                    continue;
                }

                if (is64BitOS)
                {
                    // On 64-bit OS: prioritize 64-bit specific packages first
                    if (fn.Contains("x64") || fn.Contains("64"))
                    {
                        prioritizedFiles.Insert(0, file);
                    }
                    else
                    {
                        prioritizedFiles.Add(file);
                    }
                }
                else
                {
                    // On 32-bit OS: prioritize x86 / 32-bit packages
                    if (fn.Contains("x86") || fn.Contains("32"))
                    {
                        prioritizedFiles.Insert(0, file);
                    }
                    else
                    {
                        prioritizedFiles.Add(file);
                    }
                }
            }

            foreach (var file in prioritizedFiles)
            {
                string fileName = Path.GetFileName(file);
                if (logCallback != null) logCallback(string.Format("[LOCAL INSTALLER] Found compatible package: {0}. Executing silent installation...", fileName));
                bool success = ExecuteInstaller(file, logCallback);
                if (success && IsEdgeInstalled())
                {
                    if (logCallback != null) logCallback(string.Format("[SUCCESS] Microsoft Edge ({0}) installed successfully from local package!", archName));
                    return true;
                }
            }

            // 2. If no local installer found, download and install official Microsoft Edge universal bootstrapper
            if (logCallback != null) logCallback(string.Format("[2/3] No matching local installer found. Downloading official Microsoft Edge {0} installer...", archName));
            try
            {
                string tempInstallerPath = Path.Combine(Path.GetTempPath(), "MicrosoftEdgeSetup.exe");
                
                // Ensure TLS 1.2
                ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | SecurityProtocolType.Tls;

                // Official Microsoft Universal Web Bootstrapper
                // When MicrosoftEdgeSetup.exe runs, it automatically queries the Windows Kernel (GetSystemInfo/IsWow64Process)
                // and downloads the exact matching 32-Bit or 64-Bit Edge payload directly from Microsoft CDN.
                string downloadUrl = "https://go.microsoft.com/fwlink/?linkid=2108834";

                using (WebClient client = new WebClient())
                {
                    client.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
                    client.DownloadFile(downloadUrl, tempInstallerPath);
                }

                if (File.Exists(tempInstallerPath) && new FileInfo(tempInstallerPath).Length > 1024)
                {
                    if (logCallback != null) logCallback(string.Format("[DOWNLOAD COMPLETE] Launching Microsoft Edge {0} silent installer...", archName));
                    var psi = new ProcessStartInfo
                    {
                        FileName = tempInstallerPath,
                        Arguments = "/silent /install",
                        CreateNoWindow = true,
                        UseShellExecute = false,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };

                    using (var proc = Process.Start(psi))
                    {
                        if (proc != null) proc.WaitForExit(90000); // Wait up to 90 seconds
                    }

                    try { File.Delete(tempInstallerPath); } catch { }

                    if (IsEdgeInstalled())
                    {
                        if (logCallback != null) logCallback(string.Format("[SUCCESS] Microsoft Edge ({0}) downloaded and installed successfully!", archName));
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("[DOWNLOAD NOTICE] Online Edge download failed: {0}", ex.Message));
            }

            // 3. Fallback: Try winget if available on Windows 10/11
            if (logCallback != null) logCallback("[3/3] Trying Windows Package Manager (winget) fallback...");
            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"winget install --id Microsoft.Edge --silent --accept-source-agreements --accept-package-agreements\"",
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    WindowStyle = ProcessWindowStyle.Hidden
                };

                using (var proc = Process.Start(psi))
                {
                    if (proc != null) proc.WaitForExit(60000);
                }

                if (IsEdgeInstalled())
                {
                    if (logCallback != null) logCallback("[SUCCESS] Microsoft Edge installed via Windows Package Manager!");
                    return true;
                }
            }
            catch { }

            if (IsEdgeInstalled())
            {
                if (logCallback != null) logCallback("[SUCCESS] Microsoft Edge is ready on the system.");
                return true;
            }

            if (logCallback != null) logCallback("[USER GUIDANCE] Could not automatically install Edge. Please place 'MicrosoftEdgeSetup.exe' in the 'installers/' folder and run the tool again.");
            return false;
        }

        /// <summary>
        /// Triggers Microsoft Edge Updater to silently fetch the latest Edge release.
        /// </summary>
        public static void TriggerEdgeUpdate(Action<string> logCallback)
        {
            foreach (var updateExe in PossibleEdgeUpdatePaths)
            {
                if (File.Exists(updateExe))
                {
                    try
                    {
                        if (logCallback != null) logCallback(string.Format("Launching Edge Update service from {0}...", Path.GetFileName(updateExe)));
                        var psi = new ProcessStartInfo
                        {
                            FileName = updateExe,
                            Arguments = "/silent /install \"appguid={56EB18F8-B008-4CBD-B6D2-8C97FE7E9062}&appname=Microsoft%20Edge&needsadmin=True\"",
                            CreateNoWindow = true,
                            UseShellExecute = false,
                            WindowStyle = ProcessWindowStyle.Hidden
                        };

                        using (var proc = Process.Start(psi))
                        {
                            if (proc != null) proc.WaitForExit(30000); // 30 seconds wait
                        }
                        if (logCallback != null) logCallback("[EDGE UPDATE] Update command triggered successfully.");
                        return;
                    }
                    catch (Exception ex)
                    {
                        if (logCallback != null) logCallback(string.Format("[EDGE UPDATE WARN] {0}", ex.Message));
                    }
                }
            }
        }

        private static bool ExecuteInstaller(string filePath, Action<string> logCallback)
        {
            try
            {
                string ext = Path.GetExtension(filePath).ToLowerInvariant();
                ProcessStartInfo psi;

                if (ext == ".msi")
                {
                    psi = new ProcessStartInfo
                    {
                        FileName = "msiexec.exe",
                        Arguments = string.Format("/i \"{0}\" /qn /norestart", filePath),
                        CreateNoWindow = true,
                        UseShellExecute = false,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };
                }
                else
                {
                    psi = new ProcessStartInfo
                    {
                        FileName = filePath,
                        Arguments = "/silent /install",
                        CreateNoWindow = true,
                        UseShellExecute = false,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };
                }

                using (var proc = Process.Start(psi))
                {
                    if (proc != null) proc.WaitForExit(90000);
                    return proc != null && (proc.ExitCode == 0 || proc.ExitCode == 3010);
                }
            }
            catch (Exception ex)
            {
                if (logCallback != null) logCallback(string.Format("Installer execution failed: {0}", ex.Message));
                return false;
            }
        }
    }
}
