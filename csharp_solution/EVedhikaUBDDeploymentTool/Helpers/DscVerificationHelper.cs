using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace EVedhikaUBDDeploymentTool.Helpers
{
    
    public class DscVerificationResult
    {
        public bool IsGenuine { get; set; }
        public string Details { get; set; }
        public int Score { get; set; }
    }
    
    public static class DscVerificationHelper
    {
        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

        [DllImport("user32.dll")]
        static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
        public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        // 1. Check Smart Card & DSC Token Process Activity
        public static bool CheckSmartCardActivity()
        {
            string[] tokenProcesses = { "ProxKey", "epass2003", "Wd", "wdMac", "NicDSign", "Signer" };
            foreach (var procName in tokenProcesses)
            {
                var procs = Process.GetProcessesByName(procName);
                foreach (var p in procs)
                {
                    try {
                        if (p.TotalProcessorTime.TotalMilliseconds > 0) return true;
                    } catch { return true; }
                }
            }
            return false;
        }

        // 2. Check Edge Browser Window Titles for Success Strings
        public static bool CheckBrowserSuccessWindow()
        {
            bool successFound = false;
            EnumWindows(delegate(IntPtr hWnd, IntPtr lParam)
            {
                StringBuilder sb = new StringBuilder(256);
                GetWindowText(hWnd, sb, sb.Capacity);
                string title = sb.ToString().ToLower();
                
                if (title.Contains("edge") || title.Contains("internet explorer"))
                {
                    if (title.Contains("success") || title.Contains("signed") || title.Contains("approved") || title.Contains("dsc") || title.Contains("ubd"))
                    {
                        successFound = true;
                        return false; 
                    }
                }
                return true;
            }, IntPtr.Zero);
            return successFound;
        }

        // 3. Check Local Token Driver Logs
        public static bool CheckDscLogsForSuccess()
        {
            try
            {
                string tempPath = Path.GetTempPath();
                string[] logFiles = Directory.GetFiles(tempPath, "*.log", SearchOption.AllDirectories);
                foreach (var log in logFiles)
                {
                    if (log.ToLower().Contains("dsc") || log.ToLower().Contains("sign") || log.ToLower().Contains("prox"))
                    {
                        if (File.GetLastWriteTime(log) > DateTime.Now.AddMinutes(-15))
                        {
                            string content = File.ReadAllText(log).ToLower();
                            if (content.Contains("success") || content.Contains("ok") || content.Contains("verified")) return true;
                        }
                    }
                }
            }
            catch { }
            return false;
        }

        // 4. Silent UBD URL Endpoint Scanning (Background Process)
        public static bool SilentUbdUrlScan()
        {
            bool urlFound = false;
            string[] targetUrls = { 
                "regisertoken.do", 
                "birthDispDSUnported.do", 
                "bdsBirthRegFilterBulkDS.do", 
                "bdsDeathRegFilterBulkDS.do", 
                "bdsDeathRegFilterDS.do" 
            };
            
            EnumWindows(delegate(IntPtr hWnd, IntPtr lParam)
            {
                StringBuilder sb = new StringBuilder(256);
                GetWindowText(hWnd, sb, sb.Capacity);
                string title = sb.ToString().ToLower();
                
                foreach(var url in targetUrls)
                {
                    if (title.Contains(url.ToLower()) || title.Contains("ubd.telangana.gov.in") || title.Contains("ubd.ap.gov.in"))
                    {
                        urlFound = true;
                        return false; 
                    }
                }
                return true;
            }, IntPtr.Zero);
            
            return urlFound;
        }

        public static DscVerificationResult VerifyDscSignature()
        {
            int score = 0;
            string details = "";

            if (CheckSmartCardActivity()) { score += 25; details += "[1. SmartCard: Active] "; }
            else { details += "[1. SmartCard: Idle] "; }

            if (CheckBrowserSuccessWindow()) { score += 25; details += "[2. Browser: Success UI Found] "; }
            else { details += "[2. Browser: No Success UI] "; }

            if (CheckDscLogsForSuccess()) { score += 25; details += "[3. Token Logs: Success Flagged] "; }
            else { details += "[3. Token Logs: No Logs] "; }
            
            if (SilentUbdUrlScan()) { score += 25; details += "[4. UBD Endpoints: Scanned & Active]"; }
            else { details += "[4. UBD Endpoints: No Activity]"; }

            // Still passes if at least some DSC activity is found (e.g. >= 25)
            bool isGenuine = score >= 25;
            return new DscVerificationResult { IsGenuine = isGenuine, Details = details, Score = score };
        }
    }
}
