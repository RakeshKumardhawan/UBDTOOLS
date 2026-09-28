using System;
using System.Diagnostics;
using System.IO;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class BackupEngine
    {
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
                    return proc.ExitCode == 0 ? backupPath : string.Empty;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(string.Format("Backup Exception: {0}", ex.Message));
                return string.Empty;
            }
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
                    proc.WaitForExit();
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
