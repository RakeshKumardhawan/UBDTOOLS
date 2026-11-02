using System;
using System.Diagnostics;
using System.IO;
using System.Management;
using System.Runtime.InteropServices;
using System.Text;

namespace EVedhikaUBDDeploymentTool.Helpers
{
    public static class AntivirusResolver
    {
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool DeleteFile(string lpFileName);

        /// <summary>
        /// Strips the Zone.Identifier alternate data stream attached by web browsers (SmartScreen / Defender Block)
        /// </summary>
        public static bool UnblockCurrentExecutable()
        {
            try {
                string currentExePath = Process.GetCurrentProcess().MainModule.FileName;
                string zoneStream = currentExePath + ":Zone.Identifier";

                if (File.Exists(zoneStream)) {
                    DeleteFile(zoneStream);
                    Logger.Log("AntivirusResolver", "Successfully removed Zone.Identifier stream from executable.", LogType.Success);
                }

                // Also execute PowerShell Unblock-File
                string psCommand = $"Unblock-File -Path '{currentExePath}' -ErrorAction SilentlyContinue";
                ExecutePowerShellSilent(psCommand);
                return true;
            } catch (Exception ex) {
                Logger.Log("AntivirusResolver", "Unblock file warning: " + ex.Message, LogType.Warning);
                return false;
            }
        }

        /// <summary>
        /// Adds Windows Defender exclusions for E-Vedhika folder and process
        /// </summary>
        public static bool AddWindowsDefenderExclusions()
        {
            try {
                string currentDirectory = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\');
                string exeName = Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName);

                string psCommand = 
                    $"Add-MpPreference -ExclusionPath '{currentDirectory}' -ErrorAction SilentlyContinue; " +
                    $"Add-MpPreference -ExclusionPath 'C:\\EVedhikaUBD' -ErrorAction SilentlyContinue; " +
                    $"Add-MpPreference -ExclusionProcess '{exeName}' -ErrorAction SilentlyContinue";

                int exitCode = ExecutePowerShellSilent(psCommand);
                if (exitCode == 0) {
                    Logger.Log("AntivirusResolver", "Added E-Vedhika to Windows Defender Exclusions.", LogType.Success);
                    return true;
                }
            } catch (Exception ex) {
                Logger.Log("AntivirusResolver", "Defender exclusion warning: " + ex.Message, LogType.Warning);
            }
            return false;
        }

        /// <summary>
        /// Detects installed 3rd party Antivirus software (QuickHeal, NPAV, Avast, Kaspersky, Defender, etc.)
        /// </summary>
        public static string GetInstalledAntivirusName()
        {
            StringBuilder sb = new StringBuilder();
            try {
                using (ManagementObjectSearcher searcher = new ManagementObjectSearcher(@"root\SecurityCenter2", "SELECT * FROM AntiVirusProduct")) {
                    foreach (ManagementObject obj in searcher.Get()) {
                        string name = obj["displayName"]?.ToString();
                        if (!string.IsNullOrEmpty(name)) {
                            if (sb.Length > 0) sb.Append(", ");
                            sb.Append(name);
                        }
                    }
                }
            } catch {
                return "Windows Defender (Default)";
            }

            return sb.Length > 0 ? sb.ToString() : "Windows Defender / Standard Security";
        }

        private static int ExecutePowerShellSilent(string script)
        {
            try {
                ProcessStartInfo psi = new ProcessStartInfo {
                    FileName = "powershell.exe",
                    Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"{script}\"",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden
                };

                using (Process p = Process.Start(psi)) {
                    p.WaitForExit(3000);
                    return p.ExitCode;
                }
            } catch {
                return -1;
            }
        }
    }
}
