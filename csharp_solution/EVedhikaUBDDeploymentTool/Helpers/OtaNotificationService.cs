using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;

namespace EVedhikaUBDDeploymentTool.Helpers
{
    public static class OtaNotificationService
    {
        private const string TelegramBotToken = "9070613382:AAHgln-fTUEKk3RSAtOdRM0LitfndOcgC8E";
        private const string TelegramChatId = "431228008";

        private static readonly string[] WebEndpoints = new string[]
        {
            "https://www.e-vedhika.in/admin/ubd_monitoring.php?action=ingest_report",
            "https://www.e-vedhika.in/admin/ubd_monitoring?action=ingest_report",
            "https://www.e-vedhika.in/api/reports/ota",
            "https://www.e-vedhika.in/api/reports/sync"
        };

        public static void SendOtaTriggeredNotification(string oldVersion, string targetVersion, string downloadUrl, string releaseNotes)
        {
            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string pcId = Logger.GetUniqueMachineId();
                    string pcName = Environment.MachineName;
                    string officeLoc = SystemInfoHelper.GetLiveLocation("Telangana");

                    var sb = new StringBuilder();
                    sb.AppendLine("🚀 <b>E-VEDHIKA OTA UPDATE TRIGGERED</b>");
                    sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    sb.AppendLine($"<b>PC Name:</b> <code>{EscapeHtml(pcName)}</code>");
                    sb.AppendLine($"<b>Machine ID:</b> <code>{EscapeHtml(pcId)}</code>");
                    sb.AppendLine($"<b>Office Location:</b> {EscapeHtml(officeLoc)}");
                    sb.AppendLine($"<b>Version Transition:</b> <code>{EscapeHtml(oldVersion)}</code> ➔ <b>{EscapeHtml(targetVersion)}</b>");
                    sb.AppendLine($"<b>Payload URL:</b> <a href=\"{EscapeHtml(downloadUrl)}\">{EscapeHtml(Path.GetFileName(downloadUrl))}</a>");
                    if (!string.IsNullOrEmpty(releaseNotes))
                    {
                        sb.AppendLine($"<b>Release Notes:</b> {EscapeHtml(releaseNotes)}");
                    }
                    sb.AppendLine($"<b>Timestamp:</b> {DateTime.Now:dd/MM/yyyy, hh:mm:ss tt}");

                    DispatchTelegramMessage(sb.ToString());
                    DispatchWebOtaEvent("OTA_TRIGGERED", oldVersion, targetVersion, downloadUrl, releaseNotes);
                }
                catch { }
            });
        }

        public static void SendStatusChangedNotification(string eventType, string oldVersion, string newVersion, string status, string details = "")
        {
            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string pcId = Logger.GetUniqueMachineId();
                    string pcName = Environment.MachineName;
                    string officeLoc = SystemInfoHelper.GetLiveLocation("Telangana");

                    var sb = new StringBuilder();
                    sb.AppendLine("🔄 <b>E-VEDHIKA VERSION & STATUS CHANGED</b>");
                    sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    sb.AppendLine($"<b>Event Type:</b> <code>{EscapeHtml(eventType)}</code>");
                    sb.AppendLine($"<b>PC Name:</b> <code>{EscapeHtml(pcName)}</code>");
                    sb.AppendLine($"<b>Machine ID:</b> <code>{EscapeHtml(pcId)}</code>");
                    sb.AppendLine($"<b>Office Location:</b> {EscapeHtml(officeLoc)}");
                    sb.AppendLine($"<b>Version Status:</b> <code>{EscapeHtml(oldVersion)}</code> ➔ <b>{EscapeHtml(newVersion)}</b>");
                    sb.AppendLine($"<b>Status:</b> <b>{EscapeHtml(status)}</b>");
                    if (!string.IsNullOrEmpty(details))
                    {
                        sb.AppendLine($"<b>Details:</b> {EscapeHtml(details)}");
                    }
                    sb.AppendLine($"<b>Timestamp:</b> {DateTime.Now:dd/MM/yyyy, hh:mm:ss tt}");

                    DispatchTelegramMessage(sb.ToString());
                    DispatchWebOtaEvent(eventType, oldVersion, newVersion, "", details, status);
                }
                catch { }
            });
        }

        public static void SendUpdateHistoryLog(string eventType, string prevVersion, string currVersion, string prevBuild, string currBuild, string releaseId, string startTime, string completionTime, string integrityResult, string installResult, string restartResult, string finalResult, string errorDetails = "")
        {
            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string pcId = Logger.GetUniqueMachineId();
                    string pcName = Environment.MachineName;

                    var sb = new StringBuilder();
                    sb.AppendLine("📜 <b>E-VEDHIKA OTA UPDATE HISTORY LOG</b>");
                    sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    sb.AppendLine($"<b>Event:</b> <code>{EscapeHtml(eventType)}</code>");
                    sb.AppendLine($"<b>PC Name:</b> <code>{EscapeHtml(pcName)}</code> ({EscapeHtml(pcId)})");
                    sb.AppendLine($"<b>Version Transition:</b> <code>{EscapeHtml(prevVersion)}</code> ➔ <b>{EscapeHtml(currVersion)}</b>");
                    sb.AppendLine($"<b>Resource Build:</b> <code>{EscapeHtml(prevBuild)}</code> ➔ <b>{EscapeHtml(currBuild)}</b>");
                    sb.AppendLine($"<b>Release ID:</b> {EscapeHtml(releaseId)}");
                    sb.AppendLine($"<b>Timestamps:</b> Start: {EscapeHtml(startTime)} | End: {EscapeHtml(completionTime)}");
                    sb.AppendLine($"<b>Integrity Audit:</b> <b>{EscapeHtml(integrityResult)}</b>");
                    sb.AppendLine($"<b>Installation Result:</b> <b>{EscapeHtml(installResult)}</b>");
                    sb.AppendLine($"<b>Restart Result:</b> <b>{EscapeHtml(restartResult)}</b>");
                    sb.AppendLine($"<b>Final Verification:</b> <b>{EscapeHtml(finalResult)}</b>");
                    if (!string.IsNullOrEmpty(errorDetails))
                    {
                        sb.AppendLine($"<b>Error Details:</b> <code>{EscapeHtml(errorDetails)}</code>");
                    }

                    DispatchTelegramMessage(sb.ToString());
                    DispatchWebOtaEvent(eventType, prevVersion, currVersion, "", $"ReleaseID: {releaseId} | Integrity: {integrityResult} | Install: {installResult} | Restart: {restartResult} | Error: {errorDetails}", finalResult);
                }
                catch { }
            });
        }

        private static void DispatchTelegramMessage(string message)
        {
            try
            {
                try { ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | (SecurityProtocolType)768 | SecurityProtocolType.Tls; }
                catch { try { ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls; } catch { } }
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                string url = $"https://api.telegram.org/bot{TelegramBotToken}/sendMessage";
                string jsonPayload = $"{{\"chat_id\":\"{TelegramChatId}\",\"text\":\"{EscapeJson(message)}\",\"parse_mode\":\"HTML\",\"disable_web_page_preview\":true}}";

                using (var wc = new Logger.TimeoutWebClient(6000))
                {
                    wc.Headers[HttpRequestHeader.ContentType] = "application/json";
                    wc.Encoding = Encoding.UTF8;
                    wc.UploadString(url, "POST", jsonPayload);
                }
            }
            catch { }
        }

        private static void DispatchWebOtaEvent(string eventType, string oldVersion, string newVersion, string downloadUrl, string details, string status = "SUCCESS")
        {
            try
            {
                string pcId = Logger.GetUniqueMachineId();
                string pcName = Environment.MachineName;
                string jsonPayload = $"{{\"eventType\":\"{EscapeJson(eventType)}\",\"pcId\":\"{EscapeJson(pcId)}\",\"pcName\":\"{EscapeJson(pcName)}\",\"userName\":\"{EscapeJson(Environment.UserName)}\",\"version\":\"v1.0.9\",\"resourceBuild\":\"{EscapeJson(Engine.AutoUpdateEngine.CurrentResourceBuild)}\",\"buildVersion\":\"{EscapeJson(Engine.AutoUpdateEngine.CurrentResourceBuild)}\",\"oldVersion\":\"{EscapeJson(oldVersion)}\",\"newVersion\":\"{EscapeJson(newVersion)}\",\"downloadUrl\":\"{EscapeJson(downloadUrl)}\",\"remarks\":\"{EscapeJson(details)}\",\"details\":\"{EscapeJson(details)}\",\"status\":\"{EscapeJson(status)}\",\"livePresence\":\"ONLINE\",\"appState\":\"RUNNING\",\"timestamp\":\"{DateTime.Now:yyyy-MM-dd HH:mm:ss}\"}}";

                string err;
                if (Logger.DeliverToWebsiteGuaranteed(jsonPayload, out err)) return;

                foreach (var ep in WebEndpoints)
                {
                    try
                    {
                        using (var wc = new Logger.TimeoutWebClient(4000))
                        {
                            wc.Headers[HttpRequestHeader.ContentType] = "application/json";
                            wc.Encoding = Encoding.UTF8;
                            wc.UploadString(ep, "POST", jsonPayload);
                            break;
                        }
                    }
                    catch { }
                }
            }
            catch { }
        }

        private static string EscapeHtml(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";
            return text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");
        }

        private static string EscapeJson(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";
            return text.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "").Replace("\n", "\\n");
        }
    }
}
