using System;
using System.Diagnostics;
using System.IO;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class BackupEngine
    {
        public static string LastBackupPath { get; set; }

        public static string CreatePreDeploymentBackup()
        {
            try
            {
                string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                string primaryDir = @"C:\EVedhika_UBD_Backups";
                string fallbackDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "EVedhika_Backups");
                
                string targetDir = primaryDir;
                try
                {
                    Directory.CreateDirectory(primaryDir);
                }
                catch
                {
                    targetDir = fallbackDir;
                    try { Directory.CreateDirectory(fallbackDir); } catch { }
                }

                string backupPath = Path.Combine(targetDir, $"Registry_PreDeploy_Backup_{timestamp}.reg");

                // Export HKCU Internet Settings (Zones 0-4, ZoneMap, Protocols)
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "reg.exe",
                    Arguments = $"export \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" \"{backupPath}\" /y",
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (Process proc = Process.Start(psi))
                {
                    proc?.WaitForExit(5000);
                    if (proc != null && proc.ExitCode == 0 && File.Exists(backupPath))
                    {
                        LastBackupPath = backupPath;
                        return backupPath;
                    }
                }

                // Fallback to export Zones directly
                string altBackup = Path.Combine(targetDir, $"Registry_Zone2_Backup_{timestamp}.reg");
                ProcessStartInfo psiZone = new ProcessStartInfo
                {
                    FileName = "reg.exe",
                    Arguments = $"export \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2\" \"{altBackup}\" /y",
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                using (Process proc = Process.Start(psiZone))
                {
                    proc?.WaitForExit(5000);
                    if (File.Exists(altBackup))
                    {
                        LastBackupPath = altBackup;
                        return altBackup;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Pre-deployment backup warning: " + ex.Message);
            }
            return string.Empty;
        }

        public static string ExportRegistrySnapshot(string snapshotName)
        {
            string backupFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "EVedhika_Backups");
            Directory.CreateDirectory(backupFolder);
            
            string timeStamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            string backupPath = Path.Combine(backupFolder, string.Format("EVedhika_RegBackup_{0}.reg", timeStamp));

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "reg.exe",
                    Arguments = string.Format("export \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" \"{0}\" /y", backupPath),
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (Process proc = Process.Start(psi))
                {
                    proc.WaitForExit();
                    if (proc.ExitCode == 0)
                    {
                        LastBackupPath = backupPath;
                        return backupPath;
                    }
                    return string.Empty;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(string.Format("Backup Exception: {0}", ex.Message));
                return string.Empty;
            }
        }

        public static bool RollbackLastBackup(string regFilePath = null)
        {
            string targetPath = regFilePath;
            if (string.IsNullOrEmpty(targetPath))
            {
                targetPath = LastBackupPath;
            }

            if (string.IsNullOrEmpty(targetPath) || !File.Exists(targetPath))
            {
                string[] searchDirs = new string[] { @"C:\EVedhika_UBD_Backups", Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "EVedhika_Backups") };
                DateTime latestTime = DateTime.MinValue;
                foreach (var dir in searchDirs)
                {
                    if (Directory.Exists(dir))
                    {
                        try
                        {
                            foreach (var file in Directory.GetFiles(dir, "*.reg"))
                            {
                                var fi = new FileInfo(file);
                                if (fi.LastWriteTime > latestTime)
                                {
                                    latestTime = fi.LastWriteTime;
                                    targetPath = file;
                                }
                            }
                        }
                        catch { }
                    }
                }
            }

            if (string.IsNullOrEmpty(targetPath) || !File.Exists(targetPath))
            {
                return false;
            }

            return RestoreRegistrySnapshot(targetPath);
        }

        public static bool RestoreRegistrySnapshot(string regFilePath)
        {
            if (!File.Exists(regFilePath)) return false;

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "reg.exe",
                    Arguments = string.Format("import \"{0}\"", regFilePath),
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (Process proc = Process.Start(psi))
                {
                    proc.WaitForExit(5000);
                    return proc.ExitCode == 0;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(string.Format("Restore Exception: {0}", ex.Message));
                return false;
            }
        }
    }
}
