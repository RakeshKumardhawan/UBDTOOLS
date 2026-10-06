using System;
using System.Diagnostics;
using System.IO;
using Microsoft.Win32;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class DriverInstaller
    {
        public static string GetInstallersFolderPath()
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string installersDir = Path.Combine(baseDir, "installers");
            if (!Directory.Exists(installersDir))
            {
                Directory.CreateDirectory(installersDir);
            }
            return installersDir;
        }

        public static bool IsSoftwareInstalled(string searchPattern)
        {
            try
            {
                string[] registryPaths = new string[]
                {
                    @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                    @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
                };

                foreach (var path in registryPaths)
                {
                    using (RegistryKey rk = Registry.LocalMachine.OpenSubKey(path))
                    {
                        if (rk != null)
                        {
                            foreach (string skName in rk.GetSubKeyNames())
                            {
                                using (RegistryKey sk = rk.OpenSubKey(skName))
                                {
                                    if (sk == null) continue;
                                    string displayName = sk.GetValue("DisplayName")?.ToString() ?? "";
                                    string publisher = sk.GetValue("Publisher")?.ToString() ?? "";
                                    if (displayName.IndexOf(searchPattern, StringComparison.OrdinalIgnoreCase) >= 0 ||
                                        publisher.IndexOf(searchPattern, StringComparison.OrdinalIgnoreCase) >= 0)
                                    {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    using (RegistryKey rk = Registry.CurrentUser.OpenSubKey(path))
                    {
                        if (rk != null)
                        {
                            foreach (string skName in rk.GetSubKeyNames())
                            {
                                using (RegistryKey sk = rk.OpenSubKey(skName))
                                {
                                    if (sk == null) continue;
                                    string displayName = sk.GetValue("DisplayName")?.ToString() ?? "";
                                    if (displayName.IndexOf(searchPattern, StringComparison.OrdinalIgnoreCase) >= 0)
                                    {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch { }
            return false;
        }

        public static bool IsHYP2003Installed()
        {
            if (IsSoftwareInstalled("HYP2003") || IsSoftwareInstalled("HyperPKI") || IsSoftwareInstalled("ePass2003"))
                return true;

            string pf86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
            string pf = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string sys = Environment.GetFolderPath(Environment.SpecialFolder.System);

            if (Directory.Exists(Path.Combine(pf86, "HyperPKI")) ||
                Directory.Exists(Path.Combine(pf, "HyperPKI")) ||
                Directory.Exists(Path.Combine(pf86, "ePass2003")) ||
                Directory.Exists(Path.Combine(pf, "ePass2003")) ||
                File.Exists(Path.Combine(sys, "eps2003csp11.dll")) ||
                File.Exists(Path.Combine(sys, "HYP2003PKCS11.dll")))
            {
                return true;
            }

            return false;
        }

        public static bool IsProxKeyInstalled()
        {
            if (IsSoftwareInstalled("ProxKey") || IsSoftwareInstalled("WD_PROXKey") || IsSoftwareInstalled("Watchdata"))
                return true;

            string pf86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
            string pf = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string sys = Environment.GetFolderPath(Environment.SpecialFolder.System);

            if (Directory.Exists(Path.Combine(pf86, "WD_PROXKey")) ||
                Directory.Exists(Path.Combine(pf, "WD_PROXKey")) ||
                Directory.Exists(Path.Combine(pf86, "Watchdata")) ||
                Directory.Exists(Path.Combine(pf, "Watchdata")) ||
                File.Exists(Path.Combine(sys, "wdpkcs.dll")))
            {
                return true;
            }

            return false;
        }

        public static bool IsDigiSignerInstalled()
        {
            if (IsSoftwareInstalled("DigiSigner") || IsSoftwareInstalled("NIC-DIGISIGNER"))
                return true;

            string pf86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
            string pf = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);

            if (Directory.Exists(Path.Combine(pf86, "NIC")) ||
                Directory.Exists(Path.Combine(pf, "NIC")) ||
                Directory.Exists(Path.Combine(pf86, "DigiSigner")) ||
                Directory.Exists(Path.Combine(pf, "DigiSigner")))
            {
                return true;
            }

            return false;
        }

        public static bool IsMTokenInstalled()
        {
            if (IsSoftwareInstalled("mToken") || IsSoftwareInstalled("Longmai"))
                return true;

            string sys = Environment.GetFolderPath(Environment.SpecialFolder.System);
            if (File.Exists(Path.Combine(sys, "mTokenCSP.dll")) || File.Exists(Path.Combine(sys, "cryptoida_pkcs11.dll")))
                return true;

            return false;
        }

        public static bool InstallDotNet35Offline()
        {
            string installersDir = GetInstallersFolderPath();
            string sxsDir = Path.Combine(installersDir, "sxs");
            string cabFile = Path.Combine(installersDir, "microsoft-windows-netfx3-ondemand-package.cab");

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "dism.exe",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden
                };

                if (Directory.Exists(sxsDir))
                {
                    psi.Arguments = $"/online /enable-feature /featurename:NetFx3 /All /Source:\"{sxsDir}\" /LimitAccess /NoRestart";
                }
                else if (File.Exists(cabFile))
                {
                    psi.Arguments = $"/online /enable-feature /featurename:NetFx3 /All /Source:\"{installersDir}\" /LimitAccess /NoRestart";
                }
                else
                {
                    // Fallback to online DISM enable if no offline source is supplied
                    psi.Arguments = "/online /enable-feature /featurename:NetFx3 /All /NoRestart";
                }

                using (Process proc = Process.Start(psi))
                {
                    proc.WaitForExit(120000); // 120 sec timeout for DISM
                    return proc.ExitCode == 0 || proc.ExitCode == 3010;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DISM .NET 3.5 Offline Install Exception: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Registers key ActiveX components like CAPICOM.dll and DigiSignHelper.dll 
        /// to fix "Automation server can't create object" errors on target PCs.
        /// </summary>
        public static bool RegisterActiveXComponents()
        {
            try
            {
                string installersDir = GetInstallersFolderPath();
                string payloadDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Payload");
                string system32 = Environment.SystemDirectory; // C:\Windows\System32
                string sysWOW64 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "SysWOW64");

                string[] components = new string[] { "capicom.dll", "DigiSignHelper.dll", "DigiSignerHelper.dll", "SignatureDemoLib.dll" };
                bool allRegistered = true;

                foreach (string dll in components)
                {
                    string sourceDll = Path.Combine(installersDir, dll);
                    if (!File.Exists(sourceDll)) sourceDll = Path.Combine(payloadDir, dll);
                    if (!File.Exists(sourceDll)) sourceDll = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, dll);

                    // Copy DLL to System32 and SysWOW64 so Windows COM engine can always locate them
                    if (File.Exists(sourceDll))
                    {
                        try
                        {
                            string targetSys32 = Path.Combine(system32, dll);
                            if (!File.Exists(targetSys32) || new FileInfo(sourceDll).Length != new FileInfo(targetSys32).Length)
                                File.Copy(sourceDll, targetSys32, true);
                        }
                        catch { }

                        if (Directory.Exists(sysWOW64))
                        {
                            try
                            {
                                string targetSysWOW64 = Path.Combine(sysWOW64, dll);
                                if (!File.Exists(targetSysWOW64) || new FileInfo(sourceDll).Length != new FileInfo(targetSysWOW64).Length)
                                    File.Copy(sourceDll, targetSysWOW64, true);
                            }
                            catch { }
                        }
                    }

                    // Register using System32 regsvr32
                    string sys32DllPath = Path.Combine(system32, dll);
                    if (File.Exists(sys32DllPath))
                    {
                        RunRegsvr32("regsvr32.exe", sys32DllPath);
                    }
                    else if (File.Exists(sourceDll))
                    {
                        RunRegsvr32("regsvr32.exe", sourceDll);
                    }

                    // On 64-bit Windows, specifically register 32-bit DLL with 32-bit regsvr32 in SysWOW64
                    if (Directory.Exists(sysWOW64))
                    {
                        string sysWOW64Regsvr = Path.Combine(sysWOW64, "regsvr32.exe");
                        string sysWOW64DllPath = Path.Combine(sysWOW64, dll);

                        if (File.Exists(sysWOW64Regsvr) && File.Exists(sysWOW64DllPath))
                        {
                            RunRegsvr32(sysWOW64Regsvr, sysWOW64DllPath);
                        }
                        else if (File.Exists(sysWOW64Regsvr) && File.Exists(sourceDll))
                        {
                            RunRegsvr32(sysWOW64Regsvr, sourceDll);
                        }
                    }
                }

                // Call the registry healer to inject full ProgID and InprocServer32 COM entries
                RegistryManager.HealDigiSignHelperAutomation();

                return allRegistered;
            }
            catch (Exception ex)
            {
                Console.WriteLine("ActiveX Registration Error: " + ex.Message);
                return false;
            }
        }

        private static void RunRegsvr32(string regsvrExe, string dllPath)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = regsvrExe,
                    Arguments = $"/s \"{dllPath}\"",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden
                };

                using (Process proc = Process.Start(psi))
                {
                    proc?.WaitForExit(5000);
                }
            }
            catch { }
        }


        public static int InstallAllCustomInstallersFromFolder()
        {
            string dir = GetInstallersFolderPath();
            if (!Directory.Exists(dir)) return 0;

            int count = 0;
            // Execute all .msi installers in installers/
            foreach (string msiFile in Directory.GetFiles(dir, "*.msi", SearchOption.TopDirectoryOnly))
            {
                if (InstallMsiSilent(msiFile))
                {
                    count++;
                }
            }

            // Execute all .exe installers in installers/
            foreach (string exeFile in Directory.GetFiles(dir, "*.exe", SearchOption.TopDirectoryOnly))
            {
                // Skip our main application if accidentally placed in installers folder
                if (Path.GetFileName(exeFile).Equals("EVedhikaUBDDeploymentTool.exe", StringComparison.OrdinalIgnoreCase))
                    continue;

                if (InstallSilentExe(exeFile, "/S /silent /verysilent /qn /norestart"))
                {
                    count++;
                }
            }

            return count;
        }

        /// <summary>
        /// Registers Watchdata ProxKey & HYP2003 CSP cryptographic providers in Windows CryptoAPI
        /// across both 64-bit and 32-bit (WOW6432Node) hives, and starts the SmartCard service (SCardSvr).
        /// This ensures tokens work seamlessly on all 32-bit and 64-bit Windows machines.
        /// </summary>
        public static void RegisterSmartCardAndCspProviders()
        {
            try
            {
                // 1. Ensure SmartCard Service (SCardSvr) & Certificate Propagation Service (CertPropSvc) are auto-started
                try
                {
                    using (var p1 = Process.Start(new ProcessStartInfo { FileName = "sc", Arguments = "config SCardSvr start= auto", CreateNoWindow = true, UseShellExecute = false })) { p1?.WaitForExit(2000); }
                    using (var p2 = Process.Start(new ProcessStartInfo { FileName = "net", Arguments = "start SCardSvr", CreateNoWindow = true, UseShellExecute = false })) { p2?.WaitForExit(2000); }
                    
                    using (var p3 = Process.Start(new ProcessStartInfo { FileName = "sc", Arguments = "config CertPropSvc start= auto", CreateNoWindow = true, UseShellExecute = false })) { p3?.WaitForExit(2000); }
                    using (var p4 = Process.Start(new ProcessStartInfo { FileName = "net", Arguments = "start CertPropSvc", CreateNoWindow = true, UseShellExecute = false })) { p4?.WaitForExit(2000); }
                }
                catch { }

                // 2. Comprehensive Cryptographic Service Providers (CSPs) for HYP2003, HyperPKI, Verasys, ePass2003, ProxKey, mToken
                var csps = new System.Collections.Generic.Dictionary<string, string>
                {
                    { @"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\HyperPKI Crypto Service Provider", "HyperPKICSP.dll" },
                    { @"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\HyperSecu HyperPKI CSP", "HyperPKICSP.dll" },
                    { @"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\HYP2003 Crypto Service Provider", "eps2003csp11.dll" },
                    { @"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\EnterSafe ePass2003 CSP v1.0", "eps2003csp11.dll" },
                    { @"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\EnterSafe ePass2003 CSP v2.0", "eps2003csp11.dll" },
                    { @"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\EnterSafe ePass2003 CSP v3.0", "eps2003csp11.dll" },
                    { @"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\ePass2003 Crypto Service Provider", "eps2003csp11.dll" },
                    { @"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\Verasys CA Crypto Service Provider", "eps2003csp11.dll" },
                    { @"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\Watchdata ProxKey CSP", "wdpkcs.dll" },
                    { @"SOFTWARE\Microsoft\Cryptography\Defaults\Provider\mToken CryptoAPI Service Provider", "mTokenCSP.dll" }
                };

                var views = Environment.Is64BitOperatingSystem
                    ? new RegistryView[] { RegistryView.Registry64, RegistryView.Registry32 }
                    : new RegistryView[] { RegistryView.Registry32 };

                foreach (var view in views)
                {
                    try
                    {
                        using (var baseKey = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, view))
                        {
                            foreach (var csp in csps)
                            {
                                try
                                {
                                    using (var k = baseKey.CreateSubKey(csp.Key))
                                    {
                                        if (k != null)
                                        {
                                            k.SetValue("Image Path", csp.Value, RegistryValueKind.String);
                                            k.SetValue("Type", 1, RegistryValueKind.DWord);
                                            k.SetValue("SigInFile", 0, RegistryValueKind.DWord);
                                        }
                                    }
                                }
                                catch { }
                            }

                            // 3. Register SmartCard Calais ATR entries for HyperPKI HYP2003
                            string[] smartCardNames = new string[] { "ePass2003", "HyperPKI", "HYP2003", "Verasys" };
                            foreach (var scName in smartCardNames)
                            {
                                try
                                {
                                    using (var scKey = baseKey.CreateSubKey($@"SOFTWARE\Microsoft\Cryptography\Calais\SmartCards\{scName}"))
                                    {
                                        if (scKey != null)
                                        {
                                            scKey.SetValue("Crypto Provider", "HyperPKI Crypto Service Provider", RegistryValueKind.String);
                                            scKey.SetValue("80000001", "eps2003csp11.dll", RegistryValueKind.String);
                                        }
                                    }
                                }
                                catch { }
                            }
                        }
                    }
                    catch { }
                }

                Logger.LogInfo("Drivers", "HyperPKI / HYP2003 / Verasys CSP Providers & CertPropSvc successfully registered.");
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Drivers", "CSP Provider notice: " + ex.Message);
            }
        }


        public static bool InstallWDProxKeySilent()
        {
            RegisterSmartCardAndCspProviders();

            if (IsProxKeyInstalled())
            {
                Console.WriteLine("ProxKey / WD Key driver is ALREADY installed on this system. Skipping installation.");
                return true;
            }

            string dir = GetInstallersFolderPath();
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string userDownloads = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads");
            string commonAppDir = @"C:\EVedhika_UBD\Installers";

            string[] possiblePaths = new string[]
            {
                Path.Combine(dir, "WD_PROXKey.exe"),
                Path.Combine(dir, "WD_PROXKey"),
                Path.Combine(dir, "ProxKey.exe"),
                Path.Combine(dir, "proxkey_driver.exe"),
                Path.Combine(dir, "WDProxKey.exe"),
                Path.Combine(baseDir, "WD_PROXKey.exe"),
                Path.Combine(baseDir, "Payload", "WD_ProxKey", "WD_PROXKey.exe"),
                Path.Combine(baseDir, "Payload", "WD_ProxKey", "WD_PROXKey"),
                Path.Combine(userDownloads, "WD_PROXKey.exe"),
                Path.Combine(userDownloads, "ProxKey.exe"),
                Path.Combine(userDownloads, "proxkey_driver.exe"),
                Path.Combine(commonAppDir, "WD_PROXKey.exe")
            };

            foreach (string path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    // Try standard silent switches for ProxKey / InnoSetup / NSIS / InstallShield
                    return InstallSilentExe(path, "/S /verysilent /norestart /q");
                }
            }
            return false;
        }

        public static bool InstallHYP2003Silent()
        {
            RegisterSmartCardAndCspProviders();

            if (IsHYP2003Installed())
            {
                Console.WriteLine("HYP2003 / ePass2003 CSP driver is ALREADY installed on this system. Skipping installation.");
                return true;
            }

            string dir = GetInstallersFolderPath();
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string userDownloads = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads");
            string commonAppDir = @"C:\EVedhika_UBD\Installers";

            string[] possiblePaths = new string[]
            {
                Path.Combine(dir, "HYP2003Setup_20250805.exe"),
                Path.Combine(dir, "HYP2003Setup_20250805"),
                Path.Combine(dir, "HYP2003Setup.exe"),
                Path.Combine(dir, "HYP2003.exe"),
                Path.Combine(dir, "ePass2003.exe"),
                Path.Combine(baseDir, "HYP2003Setup_20250805.exe"),
                Path.Combine(baseDir, "Payload", "HYP2003", "HYP2003Setup_20250805.exe"),
                Path.Combine(baseDir, "Payload", "HYP2003", "HYP2003.exe"),
                Path.Combine(userDownloads, "HYP2003Setup_20250805.exe"),
                Path.Combine(userDownloads, "HYP2003Setup.exe"),
                Path.Combine(userDownloads, "HYP2003.exe"),
                Path.Combine(commonAppDir, "HYP2003Setup.exe")
            };

            foreach (string path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    return InstallSilentExe(path, "/S /silent /q /norestart");
                }
            }
            return false;
        }

        public static bool InstallNICDigiSignerMsiSilent()
        {
            if (IsDigiSignerInstalled())
            {
                Console.WriteLine("NIC DigiSigner service is ALREADY installed on this system. Skipping installation.");
                return true;
            }

            string dir = GetInstallersFolderPath();
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string userDownloads = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads");
            string commonAppDir = @"C:\EVedhika_UBD\Installers";

            string[] possiblePaths = new string[]
            {
                Path.Combine(dir, "NEW-NIC-AP-DIGISIGNER.msi"),
                Path.Combine(dir, "NEW-NIC-AP-DIGISIGNER"),
                Path.Combine(dir, "NIC-DIGISIGNER.msi"),
                Path.Combine(dir, "DigiSigner.msi"),
                Path.Combine(baseDir, "NEW-NIC-AP-DIGISIGNER.msi"),
                Path.Combine(baseDir, "Payload", "DigiSigner", "NEW-NIC-AP-DIGISIGNER.msi"),
                Path.Combine(userDownloads, "NEW-NIC-AP-DIGISIGNER.msi"),
                Path.Combine(userDownloads, "NIC-DIGISIGNER.msi"),
                Path.Combine(commonAppDir, "NEW-NIC-AP-DIGISIGNER.msi")
            };

            foreach (string msiPath in possiblePaths)
            {
                if (File.Exists(msiPath))
                {
                    return InstallMsiSilent(msiPath);
                }
            }
            return false;
        }

        public static bool InstallMsiSilent(string msiFilePath)
        {
            if (!File.Exists(msiFilePath)) return false;

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "msiexec.exe",
                    Arguments = $"/i \"{msiFilePath}\" /qn /norestart",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden
                };

                using (Process proc = Process.Start(psi))
                {
                    proc.WaitForExit(45000); // 45 sec timeout
                    return proc.ExitCode == 0 || proc.ExitCode == 3010; // 0 = success, 3010 = reboot required
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MSI Silent Installation Exception: {ex.Message}");
                return false;
            }
        }

        public static bool InstallWDProxKeyManual()
        {
            string dir = GetInstallersFolderPath();
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string[] possiblePaths = new string[]
            {
                Path.Combine(dir, "WD_PROXKey.exe"),
                Path.Combine(dir, "WD_PROXKey"),
                Path.Combine(baseDir, "WD_PROXKey.exe"),
                Path.Combine(baseDir, "Payload", "WD_ProxKey", "WD_PROXKey.exe"),
                Path.Combine(baseDir, "Payload", "WD_ProxKey", "WD_PROXKey")
            };

            foreach (string path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    return InstallManualExe(path);
                }
            }
            return false;
        }

        public static bool InstallHYP2003Manual()
        {
            string dir = GetInstallersFolderPath();
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string[] possiblePaths = new string[]
            {
                Path.Combine(dir, "HYP2003Setup_20250805"),
                Path.Combine(baseDir, "HYP2003Setup_20250805.exe"),
                Path.Combine(baseDir, "Payload", "HYP2003", "HYP2003Setup_20250805.exe"),
                Path.Combine(baseDir, "Payload", "HYP2003", "HYP2003.exe")
            };

            foreach (string path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    return InstallManualExe(path);
                }
            }
            return false;
        }

        public static bool InstallMTokenSilent()
        {
            RegisterSmartCardAndCspProviders();
            if (IsMTokenInstalled()) return true;

            string dir = GetInstallersFolderPath();
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string[] possiblePaths = new string[]
            {
                Path.Combine(dir, "mToken_K9_Setup.exe"),
                Path.Combine(dir, "mToken_Setup.exe"),
                Path.Combine(baseDir, "Payload", "mToken", "mToken_K9_Setup.exe")
            };

            foreach (string path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    return InstallSilentExe(path, "/S /verysilent /norestart");
                }
            }
            return false;
        }

        public static bool InstallMTokenManual()
        {
            string dir = GetInstallersFolderPath();
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string[] possiblePaths = new string[]
            {
                Path.Combine(dir, "mToken_K9_Setup.exe"),
                Path.Combine(dir, "mToken_Setup.exe"),
                Path.Combine(baseDir, "Payload", "mToken", "mToken_K9_Setup.exe")
            };

            foreach (string path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    return InstallManualExe(path);
                }
            }
            return false;
        }

        public static bool InstallSilentExe(string setupFilePath, string silentArguments)
        {
            if (!File.Exists(setupFilePath))
            {
                return false;
            }

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = setupFilePath,
                    Arguments = silentArguments,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden
                };

                using (Process proc = Process.Start(psi))
                {
                    proc.WaitForExit(30000); // 30 second timeout
                    return proc.ExitCode == 0 || proc.ExitCode == 3010;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Driver Installer Exception: {ex.Message}");
                return false;
            }
        }

        public static bool InstallManualExe(string setupFilePath)
        {
            if (!File.Exists(setupFilePath))
            {
                return false;
            }

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = setupFilePath,
                    UseShellExecute = true,
                    WindowStyle = ProcessWindowStyle.Normal
                };

                using (Process proc = Process.Start(psi))
                {
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Driver Manual Installer Exception: {ex.Message}");
                return false;
            }
        }

        public static bool VerifyDriverServiceRunning(string serviceName)
        {
            try
            {
                using (var sc = new System.ServiceProcess.ServiceController(serviceName))
                {
                    return sc.Status == System.ServiceProcess.ServiceControllerStatus.Running;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
