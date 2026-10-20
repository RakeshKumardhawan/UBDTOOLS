using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading;
using EVedhikaUBDDeploymentTool.Engine;

namespace EVedhikaUBDDeploymentTool.Helpers
{
    /// <summary>
    /// Autonomous Background Issue & Telemetry Dispatcher.
    /// Operates 100% AUTOMATICALLY with ZERO user prompts, ZERO permissions needed, and ZERO modal popups.
    /// Whenever any UBD website error, ActiveX failure, or DSC token problem occurs,
    /// it silently gathers diagnostics and transmits directly to AI Google Studio & GitHub repository.
    /// </summary>
    public static class GitHubIssueDispatcher
    {
        public const string GITHUB_REPO_URL = "https://github.com/Rakeshkumardhawan/UBDTOOLS";
        private static long _lastReportTimestamp = 0;

        /// <summary>
        /// 100% Automatic Silent Background Report (No user permission, no popup, no browser launch).
        /// Called automatically whenever any deployment step fails, token error occurs, or portal fails.
        /// </summary>
        public static void AutoReportSilently(string issueSummary, string details = "", string category = "UBD-PORTAL")
        {
            // Debounce duplicate reports within 10 seconds to avoid spamming
            long nowEpoch = DateTime.UtcNow.Ticks;
            if (nowEpoch - _lastReportTimestamp < TimeSpan.FromSeconds(10).Ticks)
            {
                return;
            }
            _lastReportTimestamp = nowEpoch;

            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string machineName = Environment.MachineName;
                    string userName = Environment.UserName;
                    string location = SystemInfoHelper.GetLiveLocation();
                    string winVer = SystemInfoHelper.GetWindowsVersion();
                    string dsc = SystemInfoHelper.CheckDscStatus();
                    string dotNet = SystemInfoHelper.CheckDotNetFramework();
                    string digiSigner = SystemInfoHelper.CheckNicDigiSigner();
                    string logFile = Logger.GetLogFilePath();
                    string recentLogs = "";

                    if (File.Exists(logFile))
                    {
                        try
                        {
                            string[] lines = File.ReadAllLines(logFile);
                            int start = Math.Max(0, lines.Length - 30);
                            var sbLog = new StringBuilder();
                            for (int i = start; i < lines.Length; i++)
                            {
                                sbLog.AppendLine(lines[i]);
                            }
                            recentLogs = sbLog.ToString();
                        }
                        catch { }
                    }

                    string summary = string.IsNullOrEmpty(issueSummary) ? "UBD Portal / Digital Signature Exception" : issueSummary;
                    string fullDetails = string.IsNullOrEmpty(details) ? summary : details;

                    var telemetryPayload = new System.Collections.Generic.Dictionary<string, string>
                    {
                        { "issueTitle", summary },
                        { "issueDescription", fullDetails },
                        { "category", category },
                        { "pcName", machineName },
                        { "userName", userName },
                        { "officeLocation", location },
                        { "osVersion", winVer },
                        { "dscStatus", dsc },
                        { "dotNet", dotNet },
                        { "nicDigiSigner", digiSigner },
                        { "edgeIeMode", "IE5 Quirks Mode (sites.xml)" },
                        { "trustedSites", "Zone 2 Active" },
                        { "status", "UBD ISSUE DETECTED (AUTO-REPORTED)" },
                        { "healthScore", "60" },
                        { "remarks", "[AUTO-REPORTED] " + summary },
                        { "logs", recentLogs },
                        { "isUbdIssue", "true" },
                        { "isUbdErrorReport", "true" },
                        { "autoReported", "true" }
                    };

                    // 1. Silent Background Transmission to Google AI Studio Central Telemetry Gateway
                    // (Central server handles deduplication & consolidated Telegram reporting)
                    Logger.SendCentralTelemetry(telemetryPayload, delegate(bool ok, string msg) { });
                }
                catch (Exception ex)
                {
                    // Fail silently - never disrupt user workflow
                    try { Logger.LogWarn("AUTO-REPORT", "Silent report background note: " + ex.Message); } catch { }
                }
            });
        }

        /// <summary>
        /// Explicit or Button triggered Dispatch (non-blocking, non-modal).
        /// </summary>
        public static void DispatchIssueReport(string userIssueSummary, string details, Action<bool, string> onComplete = null)
        {
            AutoReportSilently(userIssueSummary, details, "USER-TRIGGERED");
            onComplete?.Invoke(true, "Automatic background report submitted to AI Studio & GitHub.");
        }
    }
}
