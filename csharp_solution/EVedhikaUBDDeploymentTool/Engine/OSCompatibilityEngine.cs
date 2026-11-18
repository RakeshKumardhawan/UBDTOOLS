using System;
using Microsoft.Win32;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public static class OSCompatibilityEngine
    {
        public static string DetectOSVersion()
        {
            try
            {
                using (System.Management.ManagementObjectSearcher searcher = new System.Management.ManagementObjectSearcher("SELECT Caption, Version, BuildNumber, OSArchitecture FROM Win32_OperatingSystem"))
                {
                    foreach (System.Management.ManagementObject os in searcher.Get())
                    {
                        if (os != null)
                        {
                            string caption = os["Caption"] != null ? os["Caption"].ToString().Trim() : "Windows";
                            string build = os["BuildNumber"] != null ? os["BuildNumber"].ToString().Trim() : "";
                            string arch = os["OSArchitecture"] != null ? os["OSArchitecture"].ToString().Trim() : (Environment.Is64BitOperatingSystem ? "64-bit" : "32-bit");
                            if (caption.Contains("Microsoft")) caption = caption.Replace("Microsoft ", "");
                            return string.Format("{0} (Build {1}, {2})", caption, build, arch);
                        }
                    }
                }
            }
            catch { }

            var osEnv = Environment.OSVersion;
            string osName = "Unknown Windows";
            
            if (osEnv.Platform == PlatformID.Win32NT)
            {
                int major = osEnv.Version.Major;
                int minor = osEnv.Version.Minor;
                int build = osEnv.Version.Build;
                string arch = Environment.Is64BitOperatingSystem ? "64-bit" : "32-bit";

                if (major == 10)
                {
                    if (build >= 22000)
                        osName = $"Windows 11 Pro / Enterprise (Build {build}, {arch})";
                    else
                        osName = $"Windows 10 Pro / Enterprise (Build {build}, {arch})";
                }
                else if (major == 6)
                {
                    if (minor == 3)
                        osName = $"Windows 8.1 / Windows Server 2012 R2 (Build {build}, {arch})";
                    else if (minor == 2)
                        osName = $"Windows 8 / Windows Server 2012 (Build {build}, {arch})";
                    else if (minor == 1)
                        osName = $"Windows 7 SP1 / Windows Server 2008 R2 (Build {build}, {arch})";
                    else if (minor == 0)
                        osName = $"Windows Vista / Windows Server 2008 (Build {build}, {arch})";
                }
                else if (major == 5)
                {
                    osName = $"Windows XP (Build {build}, {arch})";
                }
            }
            return osName;
        }

        public static bool ApplyCompatibilityShims()
        {
            try
            {
                var os = Environment.OSVersion;
                // For Windows Vista/7/8/8.1 (Major == 6), ensure TLS 1.2 strong crypto is enabled for both 64-bit & 32-bit .NET 4.x
                if (os.Version.Major == 6)
                {
                    string[] netKeys = new string[]
                    {
                        @"SOFTWARE\Microsoft\.NETFramework\v4.0.30319",
                        @"SOFTWARE\WOW6432Node\Microsoft\.NETFramework\v4.0.30319"
                    };

                    foreach (string subKeyPath in netKeys)
                    {
                        try
                        {
                            using (var key = Registry.LocalMachine.OpenSubKey(subKeyPath, true))
                            {
                                if (key != null)
                                {
                                    key.SetValue("SchUseStrongCrypto", 1, RegistryValueKind.DWord);
                                    key.SetValue("SystemDefaultTlsVersions", 1, RegistryValueKind.DWord);
                                }
                            }
                        }
                        catch { }
                    }
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Configures the highest TLS protocols supported on the current Windows + .NET runtime
        /// without throwing NotSupportedException on unpatched Windows 7 RTM / .NET 4.0 PCs.
        /// </summary>
        public static void ConfigureResilientTls()
        {
            int[] preferredProtocols = new int[]
            {
                12288, // Tls13 (Win11 / modern .NET 4.8+)
                3072,  // Tls12 (Win7 SP1+ / Win8 / Win10 / Win11)
                768,   // Tls11 (Fallback)
                192    // Tls10 (Legacy .NET 4.0 baseline)
            };

            foreach (int proto in preferredProtocols)
            {
                try
                {
                    System.Net.ServicePointManager.SecurityProtocol |= (System.Net.SecurityProtocolType)proto;
                }
                catch { }
            }
        }

        /// <summary>
        /// Returns a guaranteed-writable log file path (BaseDirectory for Admin/Portable, or %LOCALAPPDATA%\EVedhika\Logs for Standard Users).
        /// </summary>
        public static string GetSafeLogFilePath(string fileName)
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string preferredPath = System.IO.Path.Combine(baseDir, fileName);
                string testProbe = System.IO.Path.Combine(baseDir, ".write_probe.tmp");
                System.IO.File.WriteAllText(testProbe, "ok");
                System.IO.File.Delete(testProbe);
                return preferredPath;
            }
            catch
            {
                try
                {
                    string localDir = System.IO.Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                        "EVedhika",
                        "Logs");
                    if (!System.IO.Directory.Exists(localDir))
                    {
                        System.IO.Directory.CreateDirectory(localDir);
                    }
                    return System.IO.Path.Combine(localDir, fileName);
                }
                catch
                {
                    return System.IO.Path.Combine(System.IO.Path.GetTempPath(), fileName);
                }
            }
        }
    }
}
