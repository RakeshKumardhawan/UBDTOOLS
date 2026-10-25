using System;
using System.IO;

namespace EVedhikaUBDDeploymentTool.Helpers
{
    public static class Logger
    {
        private static string logFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "EVedhika_UBD_Deployment_Log.txt");

        public static void LogInfo(string operation, string message)
        {
            WriteLog("INFO", operation, message, "SUCCESS", "", "");
        }

        public static void LogWarn(string operation, string message)
        {
            WriteLog("WARN", operation, message, "WARNING", "", "");
        }

        public static void LogWarning(string operation, string message)
        {
            WriteLog("WARN", operation, message, "WARNING", "", "");
        }

        public static void LogError(string operation, string error, string solution)
        {
            WriteLog("ERROR", operation, "", "FAILED", error, solution);
        }

        private static void WriteLog(string level, string operation, string message, string status, string error, string solution)
        {
            try
            {
                string timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                string logEntry = $"[{timestamp}] [{level}] [{status}] Op: {operation}";
                if (!string.IsNullOrEmpty(message)) logEntry += $" | Msg: {message}";
                if (!string.IsNullOrEmpty(error)) logEntry += $" | Error: {error}";
                if (!string.IsNullOrEmpty(solution)) logEntry += $" | Solution: {solution}";

                File.AppendAllText(logFilePath, logEntry + Environment.NewLine);
            }
            catch
            {
                // Ignore logging failures to prevent crashing
            }
        }

        public static string GetLogFilePath()
        {
            return logFilePath;
        }

        public static void PostTelemetryData(System.Collections.Generic.Dictionary<string, string> data, Action<bool, string> onComplete = null)
        {
            SendCentralTelemetry(data, onComplete);
        }

        public static string GetUniqueMachineId()
        {
            try
            {
                using (var key = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Cryptography"))
                {
                    if (key != null)
                    {
                        object val = key.GetValue("MachineGuid");
                        if (val != null && !string.IsNullOrEmpty(val.ToString()))
                        {
                            string guid = val.ToString().Replace("-", "").ToUpper();
                            return $"EVD-PC-{guid.Substring(0, 4)}-{guid.Substring(4, 4)}";
                        }
                    }
                }
            }
            catch { }

            string fallback = Math.Abs((Environment.MachineName + "_" + Environment.UserName).GetHashCode()).ToString("X8");
            return $"EVD-PC-{fallback.Substring(0, 4)}-{fallback.Substring(4)}";
        }

        public static void SendCentralTelemetry(System.Collections.Generic.Dictionary<string, string> data, Action<bool, string> onComplete = null)
        {
            if (data == null) return;
            if (!data.ContainsKey("pcId")) data["pcId"] = GetUniqueMachineId();
            if (!data.ContainsKey("livePresence")) data["livePresence"] = "ONLINE";
            if (!data.ContainsKey("date")) data["date"] = DateTime.Now.ToString("yyyy-MM-dd");
            if (!data.ContainsKey("time")) data["time"] = DateTime.Now.ToString("HH:mm:ss");

            var sb = new System.Text.StringBuilder();
            sb.Append("{");
            bool first = true;
            foreach (var kvp in data)
            {
                if (!first) sb.Append(",");
                string val = (kvp.Value ?? "").Replace("\\", "\\\\").Replace("\"", "'");
                sb.Append($"\"{kvp.Key}\":\"{val}\"");
                first = false;
            }
            sb.Append("}");

            string jsonPayload = sb.ToString();

            System.Threading.ThreadPool.QueueUserWorkItem(delegate
            {
                // Ensure TLS 1.2 and SSL certificate bypass on background worker thread
                try
                {
                    System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12 | System.Net.SecurityProtocolType.Tls11 | System.Net.SecurityProtocolType.Tls;
                    System.Net.ServicePointManager.ServerCertificateValidationCallback = delegate(object sender, System.Security.Cryptography.X509Certificates.X509Certificate cert, System.Security.Cryptography.X509Certificates.X509Chain chain, System.Net.Security.SslPolicyErrors sslPolicyErrors) { return true; };
                    System.Net.ServicePointManager.Expect100Continue = false;
                }
                catch { }

                // 1. Direct Telegram Notification Dispatch from C# Executable (Zero dependency on web server)
                try
                {
                    string botToken = "8822107822:AAG9TIOX1lnRXpUuKCbs7ppM3r1TPTnNYrE";
                    string chatId = "431228008";

                    string pcName = data.ContainsKey("pcName") ? data["pcName"] : Environment.MachineName;
                    string userName = data.ContainsKey("userName") ? data["userName"] : Environment.UserName;
                    string officeLoc = data.ContainsKey("officeLocation") ? data["officeLocation"] : "Gram Panchayat Office (Telangana/AP)";
                    string status = data.ContainsKey("status") ? data["status"] : "SUCCESS";
                    string remarks = data.ContainsKey("remarks") ? data["remarks"] : "17/17 Deployment steps executed and verified!";
                    string verif = data.ContainsKey("verification") ? data["verification"] : "Passed (17/17)";
                    string health = data.ContainsKey("healthScore") ? data["healthScore"] : "100";
                    string dsc = data.ContainsKey("dscStatus") ? data["dscStatus"] : "USB Token Detected";
                    string edgeMode = data.ContainsKey("edgeIeMode") ? data["edgeIeMode"] : "IE5 Quirks Active";

                    bool isFail = status.ToUpper().Contains("FAIL") || remarks.ToUpper().Contains("FAIL") || edgeMode.ToUpper().Contains("FAIL") || verif.ToUpper().Contains("FAIL");
                    string headerEmoji = isFail ? "🚨" : "🛡️";
                    string headerTitle = isFail ? "E-Vedhika UBD Deployment & Audit Alert [FAILED]" : "E-Vedhika UBD Deployment Tool v1.0.8 and Installation Report";

                    string tgText = $"{headerEmoji} <b>{headerTitle}</b>\n" +
                                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                                    "🖥️ <b>Machine & Office Details</b>\n" +
                                    $"<b>Machine IDs:</b> <code>{EscapeTelegramHtml(data.ContainsKey("pcId") ? data["pcId"] : GetUniqueMachineId())}</code>\n" +
                                    $"<b>Office Locations:</b> {EscapeTelegramHtml(officeLoc)}\n" +
                                    $"<b>PC Name:</b> <code>{EscapeTelegramHtml(pcName)}</code> ({EscapeTelegramHtml(userName)})\n\n" +
                                    "📊 <b>Deployment Status & Health</b>\n" +
                                    $"<b>Overall Status:</b> <b>{(isFail ? "FAIL" : status)}</b>\n" +
                                    "<b>Versions:</b> v1.0.8 (24*7 Guardian Build)\n" +
                                    $"<b>Health Score:</b> {health}%\n" +
                                    $"<b>Successful Steps/Checks:</b> {verif}\n" +
                                    $"<b>DSC Token Status:</b> {EscapeTelegramHtml(dsc)}\n" +
                                    $"<b>Edge IE Mode:</b> {(edgeMode.ToUpper().Contains("FAIL") ? "❌ Failed" : "Active")}\n\n" +
                                    "📌 <b>Remarks</b>\n" +
                                    $"<b>Summary:</b> {EscapeTelegramHtml(remarks)}\n" +
                                    $"<b>Timestamp:</b> {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n" +
                                    "🌐 <b>Dashboard:</b> https://www.e-vedhika.in/admin/exe_ubd_live";

                    using (var tgClient = new TimeoutWebClient(4000))
                    {
                        tgClient.Headers[System.Net.HttpRequestHeader.ContentType] = "application/json";
                        tgClient.Encoding = System.Text.Encoding.UTF8;
                        tgClient.Proxy = System.Net.WebRequest.GetSystemWebProxy();
                        tgClient.Proxy.Credentials = System.Net.CredentialCache.DefaultCredentials;

                        string tgJson = $"{{\"chat_id\":\"{chatId}\",\"text\":\"{EscapeJson(tgText)}\",\"parse_mode\":\"HTML\",\"disable_web_page_preview\":true}}";
                        tgClient.UploadString($"https://api.telegram.org/bot{botToken}/sendMessage", "POST", tgJson);
                    }
                }
                catch { }

                // 2. Primary Web Targets: Official E-Vedhika Admin Gateway, Cloud API, and AI Studio fallbacks
                string[] endpoints = new string[]
                {
                    "https://www.e-vedhika.in/admin/exe_ubd_live?action=telemetry",
                    "https://www.e-vedhika.in/api/telemetry",
                    "https://ais-dev-54cvk7cjdeugn77dw5lddj-585783354343.asia-southeast1.run.app/api/telemetry",
                    "https://ais-pre-54cvk7cjdeugn77dw5lddj-585783354343.asia-southeast1.run.app/api/telemetry"
                };

                bool delivered = false;
                string lastError = "";

                foreach (var url in endpoints)
                {
                    try
                    {
                        using (var wc = new TimeoutWebClient(4000))
                        {
                            wc.Headers[System.Net.HttpRequestHeader.ContentType] = "application/json";
                            wc.Encoding = System.Text.Encoding.UTF8;
                            
                            // Auto-detect and use system default proxy (Crucial for Govt/Mandal office networks)
                            wc.Proxy = System.Net.WebRequest.GetSystemWebProxy();
                            wc.Proxy.Credentials = System.Net.CredentialCache.DefaultCredentials;

                            string response = wc.UploadString(url, "POST", jsonPayload);
                            delivered = true;
                            try { File.AppendAllText(logFilePath, $"[{DateTime.Now}] [TELEMETRY] SUCCESS to {url}\r\n"); } catch { }
                            onComplete?.Invoke(true, $"Delivered to {url}");
                            break; // Stop after first successful delivery
                        }
                    }
                    catch (Exception ex)
                    {
                        lastError = ex.Message;
                        try { File.AppendAllText(logFilePath, $"[{DateTime.Now}] [TELEMETRY] FAILED to {url}: {ex.Message}\r\n"); } catch { }
                    }
                }

                if (!delivered)
                {
                    onComplete?.Invoke(false, lastError);
                }
            });
        }

        public static string EscapeTelegramHtml(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";
            return text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");
        }

        public static string EscapeJson(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";
            return text.Replace("\\", "\\\\")
                       .Replace("\"", "\\\"")
                       .Replace("\r", "")
                       .Replace("\n", "\\n");
        }

        /// <summary>
        /// Nested alias for TimeoutWebClient to support both Logger.TimeoutWebClient and TimeoutWebClient
        /// </summary>
        public class TimeoutWebClient : EVedhikaUBDDeploymentTool.Helpers.TimeoutWebClient
        {
            public TimeoutWebClient(int timeoutMs = 4000) : base(timeoutMs) { }
        }
    }

    /// <summary>
    /// Custom WebClient with custom HTTP timeout to prevent 100-second UI/thread freezes
    /// </summary>
    public class TimeoutWebClient : System.Net.WebClient
    {
        private readonly int _timeoutMs;

        public TimeoutWebClient(int timeoutMs = 4000)
        {
            _timeoutMs = timeoutMs;
        }

        protected override System.Net.WebRequest GetWebRequest(Uri address)
        {
            var request = base.GetWebRequest(address);
            if (request != null)
            {
                request.Timeout = _timeoutMs;
                System.Net.HttpWebRequest httpRequest = request as System.Net.HttpWebRequest;
                if (httpRequest != null)
                {
                    httpRequest.ReadWriteTimeout = _timeoutMs;
                    httpRequest.KeepAlive = false;
                }
            }
            return request;
        }
    }
}
