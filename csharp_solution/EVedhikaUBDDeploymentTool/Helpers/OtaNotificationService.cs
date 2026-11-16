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

        public static void SendOtaTriggeredNotification(string oldVersion, string targetVersion, string downloadUrl, string releaseNotes)
        {
            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string pcId = Logger.GetUniqueMachineId();
                    string pcName = Environment.MachineName;
                    string stateName = SystemInfoHelper.GetConfiguredState("Telangana");
                    string district = SystemInfoHelper.GetConfiguredDistrict(stateName);
                    string officeLoc = SystemInfoHelper.GetLiveLocation(stateName);
                    string operatorName = SystemInfoHelper.GetConfiguredOperatorName();

                    var sb = new StringBuilder();
                    sb.AppendLine("🚀 <b>E-VEDHIKA OTA UPDATE TRIGGERED</b>");
                    sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    sb.AppendLine($"<b>PC Name:</b> <code>{EscapeHtml(pcName)}</code>");
                    sb.AppendLine($"<b>Machine ID:</b> <code>{EscapeHtml(pcId)}</code>");
                    sb.AppendLine($"<b>Operator:</b> <code>{EscapeHtml(operatorName)}</code>");
                    sb.AppendLine($"<b>District &amp; Office:</b> {EscapeHtml(district)} ({EscapeHtml(stateName)}) — {EscapeHtml(officeLoc)}");
                    sb.AppendLine($"<b>Version Transition:</b> <code>{EscapeHtml(oldVersion)}</code> ➔ <b>{EscapeHtml(targetVersion)}</b>");
                    sb.AppendLine($"<b>Payload URL:</b> <a href=\"{EscapeHtml(downloadUrl)}\">{EscapeHtml(Path.GetFileName(downloadUrl))}</a>");
                    if (!string.IsNullOrEmpty(releaseNotes))
                    {
                        sb.AppendLine($"<b>Release Notes:</b> {EscapeHtml(releaseNotes)}");
                    }
                    sb.AppendLine($"<b>Live Admin Dashboard:</b> {Logger.AdminDashboardUrl}");
                    sb.AppendLine($"<b>Timestamp:</b> {DateTime.Now:dd/MM/yyyy, hh:mm:ss tt}");

                    DispatchTelegramMessage(sb.ToString());
                    DispatchWebOtaEvent("OTA_TRIGGERED", oldVersion, targetVersion, downloadUrl, releaseNotes, "SUCCESS",
                        $"Upgrading {oldVersion} -> {targetVersion}");
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
                    string stateName = SystemInfoHelper.GetConfiguredState("Telangana");
                    string district = SystemInfoHelper.GetConfiguredDistrict(stateName);
                    string officeLoc = SystemInfoHelper.GetLiveLocation(stateName);
                    string operatorName = SystemInfoHelper.GetConfiguredOperatorName();

                    var sb = new StringBuilder();
                    sb.AppendLine("🔄 <b>E-VEDHIKA VERSION & STATUS CHANGED</b>");
                    sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    sb.AppendLine($"<b>Event Type:</b> <code>{EscapeHtml(eventType)}</code>");
                    sb.AppendLine($"<b>PC Name:</b> <code>{EscapeHtml(pcName)}</code>");
                    sb.AppendLine($"<b>Machine ID:</b> <code>{EscapeHtml(pcId)}</code>");
                    sb.AppendLine($"<b>Operator:</b> <code>{EscapeHtml(operatorName)}</code>");
                    sb.AppendLine($"<b>District &amp; Office:</b> {EscapeHtml(district)} ({EscapeHtml(stateName)}) — {EscapeHtml(officeLoc)}");
                    sb.AppendLine($"<b>Version Status:</b> <code>{EscapeHtml(oldVersion)}</code> ➔ <b>{EscapeHtml(newVersion)}</b>");
                    sb.AppendLine($"<b>Status:</b> <b>{EscapeHtml(status)}</b>");
                    if (!string.IsNullOrEmpty(details))
                    {
                        sb.AppendLine($"<b>Details:</b> {EscapeHtml(details)}");
                    }
                    sb.AppendLine($"<b>Live Admin Dashboard:</b> {Logger.AdminDashboardUrl}");
                    sb.AppendLine($"<b>Timestamp:</b> {DateTime.Now:dd/MM/yyyy, hh:mm:ss tt}");

                    DispatchTelegramMessage(sb.ToString());
                    DispatchWebOtaEvent(eventType, oldVersion, newVersion, "", details, status,
                        $"{oldVersion} -> {newVersion} ({status})");
                }
                catch { }
            });
        }

        /// <summary>
        /// Guarantees that every PC upgrading to a new version reports complete machine, location, and version-transition details
        /// to Google Cloud Firestore & Admin GitHub Hub (with optional deduplicated Telegram notification).
        /// </summary>
        public static void SendVersionUpgradeReport(
            string eventType,
            string prevVersion,
            string currVersion,
            string prevBuild,
            string currBuild,
            string upgradeMethod = "AUTO_OR_SETUP_UPGRADE",
            bool sendTelegram = true)
        {
            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string pcId = Logger.GetUniqueMachineId();
                    string pcName = Environment.MachineName ?? "GP-OFFICE-PC";
                    string operatorName = SystemInfoHelper.GetConfiguredOperatorName();
                    string stateName = SystemInfoHelper.GetConfiguredState("Telangana");
                    string district = SystemInfoHelper.GetConfiguredDistrict(stateName);
                    string officeLoc = SystemInfoHelper.GetLiveLocation(stateName);
                    string osVersion = SystemInfoHelper.GetWindowsVersion();
                    string winBuild = SystemInfoHelper.GetWindowsBuildNumber();
                    string ipAddr = SystemInfoHelper.GetIpAddress();
                    string dscStatus = SystemInfoHelper.CheckDscStatus();
                    string edgeIe = SystemInfoHelper.CheckEdgeIeMode();

                    string safePrevVer = string.IsNullOrEmpty(prevVersion) ? "Previous Version" : prevVersion;
                    string safeCurrVer = string.IsNullOrEmpty(currVersion) ? Engine.AutoUpdateEngine.CurrentVersion : currVersion;
                    string safePrevBuild = string.IsNullOrEmpty(prevBuild) ? "Legacy" : prevBuild;
                    string safeCurrBuild = string.IsNullOrEmpty(currBuild) ? Engine.AutoUpdateEngine.CurrentResourceBuild : currBuild;

                    string fullUpgradeDetails =
                        $"Upgraded {safePrevVer} ({safePrevBuild}) -> {safeCurrVer} ({safeCurrBuild}) | Method: {upgradeMethod} | Operator: {operatorName} | District: {district} ({stateName}) | Office: {officeLoc} | OS: {osVersion} (Build {winBuild}) | IP: {ipAddr}";
                    string verifSummary = $"Upgraded {safePrevVer} -> {safeCurrVer} ({safeCurrBuild})";

                    // 1. Always persist full VERSION_UPGRADE event to Google Cloud Firestore (installed_pcs + pc_reports)
                    DispatchWebOtaEvent(
                        string.IsNullOrEmpty(eventType) ? "VERSION_UPGRADE" : eventType,
                        safePrevVer,
                        safeCurrVer,
                        "",
                        fullUpgradeDetails,
                        "SUCCESS",
                        verifSummary
                    );

                    // 2. Dispatch single Telegram alert unless recently sent for this exact upgrade build
                    if (sendTelegram && !HasRecentlySentInstallOrUpgradeTg(safeCurrVer, safeCurrBuild))
                    {
                        var sb = new StringBuilder();
                        sb.AppendLine("🔄 <b>E-VEDHIKA NEW VERSION UPGRADE REPORT</b>");
                        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                        sb.AppendLine($"<b>PC Name:</b> <code>{EscapeHtml(pcName)}</code>");
                        sb.AppendLine($"<b>Machine ID:</b> <code>{EscapeHtml(pcId)}</code>");
                        sb.AppendLine($"<b>Operator:</b> <code>{EscapeHtml(operatorName)}</code>");
                        sb.AppendLine($"<b>District &amp; State:</b> {EscapeHtml(district)} ({EscapeHtml(stateName)})");
                        sb.AppendLine($"<b>Office Location:</b> {EscapeHtml(officeLoc)}");
                        sb.AppendLine($"<b>Windows OS:</b> {EscapeHtml(osVersion)} (Build {EscapeHtml(winBuild)})");
                        sb.AppendLine($"<b>IP Address:</b> <code>{EscapeHtml(ipAddr)}</code>");
                        sb.AppendLine($"<b>Version Upgraded:</b> <code>{EscapeHtml(safePrevVer)}</code> ➔ <b>{EscapeHtml(safeCurrVer)}</b>");
                        sb.AppendLine($"<b>Resource Build:</b> <code>{EscapeHtml(safePrevBuild)}</code> ➔ <b>{EscapeHtml(safeCurrBuild)}</b>");
                        sb.AppendLine($"<b>Upgrade Mode:</b> {EscapeHtml(upgradeMethod)}");
                        sb.AppendLine($"<b>DSC / Edge IE Mode:</b> {EscapeHtml(dscStatus)} | {EscapeHtml(edgeIe)}");
                        sb.AppendLine($"<b>GitHub Admin Live Link:</b> {Logger.AdminDashboardUrl}");
                        sb.AppendLine($"<b>Timestamp:</b> {DateTime.Now:dd/MM/yyyy, hh:mm:ss tt}");

                        DispatchTelegramMessage(sb.ToString());
                        MarkInstallOrUpgradeTgSent(safeCurrVer, safeCurrBuild);
                    }
                }
                catch { }
            });
        }

        private static bool HasRecentlySentInstallOrUpgradeTg(string currVer, string currBuild)
        {
            try
            {
                string vaultDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika");
                string installCooldownFile = Path.Combine(vaultDir, "install_tg_cooldown.marker");
                if (File.Exists(installCooldownFile))
                {
                    DateTime lastWrite = File.GetLastWriteTimeUtc(installCooldownFile);
                    if ((DateTime.UtcNow - lastWrite).TotalMinutes < 3.0)
                    {
                        return true;
                    }
                }

                string upgradeTgMarker = Path.Combine(vaultDir, $"tg_upgrade_{Logger.SanitizeFirestoreId(currVer, "v")}_{Logger.SanitizeFirestoreId(currBuild, "b")}.marker");
                if (File.Exists(upgradeTgMarker)) return true;
            }
            catch { }
            return false;
        }

        private static void MarkInstallOrUpgradeTgSent(string currVer, string currBuild)
        {
            try
            {
                string vaultDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika");
                if (!Directory.Exists(vaultDir)) Directory.CreateDirectory(vaultDir);
                string upgradeTgMarker = Path.Combine(vaultDir, $"tg_upgrade_{Logger.SanitizeFirestoreId(currVer, "v")}_{Logger.SanitizeFirestoreId(currBuild, "b")}.marker");
                File.WriteAllText(upgradeTgMarker, $"{Environment.MachineName} upgraded to {currVer} ({currBuild}) at {DateTime.Now}");
            }
            catch { }
        }

        public static void SendUpdateHistoryLog(string eventType, string prevVersion, string currVersion, string prevBuild, string currBuild, string releaseId, string startTime, string completionTime, string integrityResult, string installResult, string restartResult, string finalResult, string errorDetails = "")
        {
            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string pcId = Logger.GetUniqueMachineId();
                    string pcName = Environment.MachineName;
                    string stateName = SystemInfoHelper.GetConfiguredState("Telangana");
                    string district = SystemInfoHelper.GetConfiguredDistrict(stateName);
                    string officeLoc = SystemInfoHelper.GetLiveLocation(stateName);
                    string operatorName = SystemInfoHelper.GetConfiguredOperatorName();
                    string osVersion = SystemInfoHelper.GetWindowsVersion();

                    string richDetails = $"Upgraded {prevVersion} ({prevBuild}) -> {currVersion} ({currBuild}) | ReleaseID: {releaseId} | Operator: {operatorName} | District: {district} ({stateName}) | Office: {officeLoc} | OS: {osVersion} | Integrity: {integrityResult} | Install: {installResult} | Restart: {restartResult}";
                    if (!string.IsNullOrEmpty(errorDetails)) richDetails += $" | Error: {errorDetails}";

                    if (!HasRecentlySentInstallOrUpgradeTg(currVersion, currBuild))
                    {
                        var sb = new StringBuilder();
                        sb.AppendLine("📜 <b>E-VEDHIKA OTA UPDATE HISTORY LOG</b>");
                        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                        sb.AppendLine($"<b>Event:</b> <code>{EscapeHtml(eventType)}</code>");
                        sb.AppendLine($"<b>PC Name:</b> <code>{EscapeHtml(pcName)}</code> ({EscapeHtml(pcId)})");
                        sb.AppendLine($"<b>Operator:</b> <code>{EscapeHtml(operatorName)}</code>");
                        sb.AppendLine($"<b>District &amp; Office:</b> {EscapeHtml(district)} ({EscapeHtml(stateName)}) — {EscapeHtml(officeLoc)}");
                        sb.AppendLine($"<b>Windows OS:</b> {EscapeHtml(osVersion)}");
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
                        sb.AppendLine($"<b>GitHub Admin Live Link:</b> {Logger.AdminDashboardUrl}");

                        DispatchTelegramMessage(sb.ToString());
                        MarkInstallOrUpgradeTgSent(currVersion, currBuild);
                    }

                    DispatchWebOtaEvent(
                        eventType,
                        prevVersion,
                        currVersion,
                        "",
                        richDetails,
                        finalResult,
                        $"Upgraded {prevVersion} -> {currVersion} ({currBuild})"
                    );
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

        private static void DispatchWebOtaEvent(
            string eventType,
            string oldVersion,
            string newVersion,
            string downloadUrl,
            string details,
            string status = "SUCCESS",
            string verificationText = "")
        {
            try
            {
                string pcId = Logger.GetUniqueMachineId();
                string pcName = Environment.MachineName ?? "GP-OFFICE-PC";
                string operatorName = SystemInfoHelper.GetConfiguredOperatorName();
                string stateName = SystemInfoHelper.GetConfiguredState("Telangana");
                string district = SystemInfoHelper.GetConfiguredDistrict(stateName);
                string officeLoc = SystemInfoHelper.GetLiveLocation(stateName);
                string osVersion = SystemInfoHelper.GetWindowsVersion();
                string dscStatus = SystemInfoHelper.CheckDscStatus();
                string edgeIe = SystemInfoHelper.CheckEdgeIeMode();
                string reportId = "UPG-" + DateTime.Now.ToString("yyyyMMddHHmmss") + "-" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

                string ver = string.IsNullOrEmpty(newVersion) ? Engine.AutoUpdateEngine.CurrentVersion : newVersion;
                string verif = string.IsNullOrEmpty(verificationText)
                    ? $"Upgraded {oldVersion} -> {ver} ({Engine.AutoUpdateEngine.CurrentResourceBuild})"
                    : verificationText;

                string jsonPayload = "{" +
                    $"\"reportId\":\"{EscapeJson(reportId)}\"," +
                    $"\"eventType\":\"{EscapeJson(eventType)}\"," +
                    $"\"pcId\":\"{EscapeJson(pcId)}\"," +
                    $"\"pcName\":\"{EscapeJson(pcName)}\"," +
                    $"\"userName\":\"{EscapeJson(operatorName)}\"," +
                    $"\"operatorName\":\"{EscapeJson(operatorName)}\"," +
                    $"\"state\":\"{EscapeJson(stateName)}\"," +
                    $"\"district\":\"{EscapeJson(district)}\"," +
                    $"\"officeLocation\":\"{EscapeJson(officeLoc)}\"," +
                    $"\"osVersion\":\"{EscapeJson(osVersion)}\"," +
                    $"\"winEdition\":\"{EscapeJson(osVersion)}\"," +
                    $"\"dscStatus\":\"{EscapeJson(dscStatus)}\"," +
                    $"\"edgeIeMode\":\"{EscapeJson(edgeIe)}\"," +
                    $"\"verification\":\"{EscapeJson(verif)}\"," +
                    $"\"version\":\"{EscapeJson(ver)}\"," +
                    $"\"appVersion\":\"{EscapeJson(ver)}\"," +
                    $"\"resourceBuild\":\"{EscapeJson(Engine.AutoUpdateEngine.CurrentResourceBuild)}\"," +
                    $"\"buildVersion\":\"{EscapeJson(Engine.AutoUpdateEngine.CurrentResourceBuild)}\"," +
                    $"\"oldVersion\":\"{EscapeJson(oldVersion)}\"," +
                    $"\"newVersion\":\"{EscapeJson(ver)}\"," +
                    $"\"downloadUrl\":\"{EscapeJson(downloadUrl)}\"," +
                    $"\"remarks\":\"{EscapeJson(details)}\"," +
                    $"\"details\":\"{EscapeJson(details)}\"," +
                    $"\"status\":\"{EscapeJson(status)}\"," +
                    "\"livePresence\":\"ONLINE\"," +
                    "\"appState\":\"RUNNING\"," +
                    "\"suppressTelegram\":\"true\"," +
                    "\"directTelegramSent\":\"true\"," +
                    $"\"lastReportUploadTime\":\"{DateTime.Now:yyyy-MM-dd HH:mm:ss}\"," +
                    $"\"timestamp\":\"{DateTime.Now:yyyy-MM-dd HH:mm:ss}\"" +
                    "}";

                string err;
                Logger.DeliverToWebsiteGuaranteed(jsonPayload, out err);
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
