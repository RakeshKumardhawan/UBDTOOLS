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

                // Primary targets: Central e-vedhika API, live Google AI Studio cloud telemetry, and fallback relays
                string[] endpoints = new string[]
                {
                    "https://www.e-vedhika.in/api/telemetry",
                    "https://ais-dev-hsy4unuvg6gixi3y2y4acj-585783354343.asia-southeast1.run.app/api/telemetry",
                    "https://www.e-vedhika.in/admin/exe_ubd_live?action=telemetry",
                    "http://www.e-vedhika.in/admin/exe_ubd_live?action=telemetry"
                };

                bool delivered = false;
                string lastError = "";

                foreach (var url in endpoints)
                {
                    try
                    {
                        using (var wc = new TimeoutWebClient(5000))
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
                        // Continue trying next endpoint
                    }
                }

                if (!delivered)
                {
                    onComplete?.Invoke(false, lastError);
                }
            });
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
