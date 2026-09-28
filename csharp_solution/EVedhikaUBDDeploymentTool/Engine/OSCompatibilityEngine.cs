using System;
using Microsoft.Win32;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public static class OSCompatibilityEngine
    {
        public static string DetectOSVersion()
        {
            var os = Environment.OSVersion;
            string osName = "Unknown Windows";
            
            if (os.Platform == PlatformID.Win32NT)
            {
                int major = os.Version.Major;
                int minor = os.Version.Minor;

                if (major == 10)
                {
                    if (os.Version.Build >= 22000)
                        osName = "Windows 11 Pro / Enterprise (x64)";
                    else
                        osName = "Windows 10 Pro / Enterprise (x64)";
                }
                else if (major == 6)
                {
                    if (minor == 3)
                        osName = "Windows 8.1 / Windows Server 2012 R2";
                    else if (minor == 2)
                        osName = "Windows 8 / Windows Server 2012";
                    else if (minor == 1)
                        osName = "Windows 7 SP1 / Windows Server 2008 R2";
                    else if (minor == 0)
                        osName = "Windows Vista / Windows Server 2008";
                }
                else if (major == 5)
                {
                    osName = "Windows XP (Legacy Fallback Mode)";
                }
            }
            return osName;
        }

        public static bool ApplyCompatibilityShims()
        {
            try
            {
                var os = Environment.OSVersion;
                // For Windows 7 and 8, ensure TLS 1.2 is enabled in registry
                if (os.Version.Major == 6)
                {
                    using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\.NETFramework\v4.0.30319", true))
                    {
                        if (key != null)
                        {
                            key.SetValue("SchUseStrongCrypto", 1, RegistryValueKind.DWord);
                        }
                    }
                }
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
