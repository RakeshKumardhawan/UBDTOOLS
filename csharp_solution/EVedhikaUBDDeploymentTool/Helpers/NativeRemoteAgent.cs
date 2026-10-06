using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace EVedhikaUBDDeploymentTool.Helpers
{
    public static class NativeRemoteAgent
    {
        public static string CurrentState = "Telangana";
        private static bool isStreaming = false;
        private static Thread streamThread = null;
        private static Thread commandThread = null;
        private static string[] serverUrls = new string[]
        {
            "https://www.e-vedhika.in"
        };
        private static string sessionPcName = Environment.MachineName;
        private static string activeServerUrl = null;

        // Win32 API for mouse and keyboard simulation
        [DllImport("user32.dll")]
        public static extern bool SetCursorPos(int X, int Y);

        [DllImport("user32.dll")]
        public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);

        [DllImport("user32.dll")]
        public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);

        private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
        private const uint MOUSEEVENTF_LEFTUP = 0x0004;
        private const uint MOUSEEVENTF_RIGHTDOWN = 0x0008;
        private const uint MOUSEEVENTF_RIGHTUP = 0x0010;
        private const uint MOUSEEVENTF_MIDDLEDOWN = 0x0020;
        private const uint MOUSEEVENTF_MIDDLEUP = 0x0040;
        private const uint KEYEVENTF_KEYUP = 0x0002;

        public static void StartRemoteSession()
        {
            if (isStreaming) return;
            isStreaming = true;

            streamThread = new Thread(ScreenCaptureLoop) { IsBackground = true };
            streamThread.Start();

            commandThread = new Thread(CommandPollLoop) { IsBackground = true };
            commandThread.Start();

            // Register session with central web server
            RegisterRemoteSession();
        }

        public static void StopRemoteSession()
        {
            isStreaming = false;
        }

        private static void RegisterRemoteSession()
        {
            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string liveLocation = SystemInfoHelper.GetLiveLocation();
                    string json = string.Format("{{\"pcName\":\"{0}\",\"userName\":\"{1}\",\"office\":\"{2}\",\"district\":\"{3} Zone\",\"issue\":\"Active Live Session\",\"status\":\"live_online\",\"remoteType\":\"Native_EVedhika_BuiltIn\"}}", sessionPcName, Environment.UserName, liveLocation, CurrentState);
                    foreach (var url in serverUrls)
                    {
                        try {
                            using (var wc = new TimeoutWebClient(2500)) {
                                wc.Headers[HttpRequestHeader.ContentType] = "application/json";
                                wc.Encoding = System.Text.Encoding.UTF8;
                                wc.UploadString(string.Format("{0}/admin/exe_ubd_live?action=remote_queue", url), "POST", json);
                                break;
                            }
                        } catch { }
                    }
                }
                catch { }
            });
        }

        private static void ScreenCaptureLoop()
        {
            while (isStreaming)
            {
                try
                {
                    byte[] screenBytes = CaptureScreenJpeg(1024, 576, 50); // Scale down for high-performance low latency streaming
                    if (screenBytes != null && screenBytes.Length > 0)
                    {
                        string base64Image = Convert.ToBase64String(screenBytes);
                        long unixMs = (long)(DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
                        string jsonPayload = string.Format("{{\"pcName\":\"{0}\",\"image\":\"{1}\",\"timestamp\":{2}}}", sessionPcName, base64Image, unixMs);
                        
                        string[] targets = activeServerUrl != null ? new string[] { activeServerUrl } : serverUrls;
                        foreach (var url in targets)
                        {
                            try {
                                using (var wc = new TimeoutWebClient(2500)) {
                                    wc.Headers[HttpRequestHeader.ContentType] = "application/json";
                                    wc.Encoding = System.Text.Encoding.UTF8;
                                    wc.UploadString(string.Format("{0}/admin/exe_ubd_live?action=remote_stream", url), "POST", jsonPayload);
                                    activeServerUrl = url;
                                    break;
                                }
                            } catch { }
                        }
                    }
                }
                catch { }
                Thread.Sleep(300); // Send ~3.3 fps screen frames
            }
        }

        private static void CommandPollLoop()
        {
            while (isStreaming)
            {
                try
                {
                    string[] targets = activeServerUrl != null ? new string[] { activeServerUrl } : serverUrls;
                    foreach (var url in targets)
                    {
                        try {
                            using (var wc = new TimeoutWebClient(2000)) {
                                wc.Encoding = System.Text.Encoding.UTF8;
                                string json = wc.DownloadString(string.Format("{0}/admin/exe_ubd_live?action=remote_commands&pcName={1}", url, sessionPcName));
                                if (!string.IsNullOrEmpty(json) && json != "[]" && json != "{}")
                                {
                                    ProcessRemoteCommand(json);
                                }
                                activeServerUrl = url;
                                break;
                            }
                        } catch { }
                    }
                }
                catch { }
                Thread.Sleep(200); // Poll commands every 200ms
            }
        }

        private static byte[] CaptureScreenJpeg(int targetWidth, int targetHeight, long quality)
        {
            try
            {
                if (Screen.PrimaryScreen == null) return null;
                Rectangle bounds = Screen.PrimaryScreen.Bounds;
                if (bounds.Width <= 0 || bounds.Height <= 0) return null;

                using (Bitmap bitmap = new Bitmap(bounds.Width, bounds.Height))
                {
                    using (Graphics g = Graphics.FromImage(bitmap))
                    {
                        g.CopyFromScreen(Point.Empty, Point.Empty, bounds.Size);
                    }

                    // Resize for network efficiency
                    using (Bitmap resized = new Bitmap(bitmap, new Size(targetWidth, targetHeight)))
                    {
                        using (MemoryStream ms = new MemoryStream())
                        {
                            ImageCodecInfo jpgEncoder = GetEncoder(ImageFormat.Jpeg);
                            if (jpgEncoder == null) return null;

                            System.Drawing.Imaging.Encoder myEncoder = System.Drawing.Imaging.Encoder.Quality;
                            EncoderParameters myEncoderParameters = new EncoderParameters(1);
                            EncoderParameter myEncoderParameter = new EncoderParameter(myEncoder, quality);
                            myEncoderParameters.Param[0] = myEncoderParameter;

                            resized.Save(ms, jpgEncoder, myEncoderParameters);
                            return ms.ToArray();
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        private static ImageCodecInfo GetEncoder(ImageFormat format)
        {
            ImageCodecInfo[] codecs = ImageCodecInfo.GetImageEncoders();
            foreach (ImageCodecInfo codec in codecs)
            {
                if (codec.FormatID == format.Guid)
                    return codec;
            }
            return null;
        }

        private static void ProcessRemoteCommand(string json)
        {
            if (string.IsNullOrEmpty(json)) return;
            if (Screen.PrimaryScreen == null) return;

            int screenW = Screen.PrimaryScreen.Bounds.Width;
            int screenH = Screen.PrimaryScreen.Bounds.Height;
            if (screenW <= 0 || screenH <= 0) return;

            // Simple command parser for mouse and keyboard simulation
            if (json.Contains("\"type\":\"click\""))
            {
                int x = ExtractInt(json, "x");
                int y = ExtractInt(json, "y");

                int actualX = (int)((x / 100.0) * screenW);
                int actualY = (int)((y / 100.0) * screenH);

                SetCursorPos(actualX, actualY);
                mouse_event(MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_LEFTUP, (uint)actualX, (uint)actualY, 0, 0);
            }
            else if (json.Contains("\"type\":\"right_click\""))
            {
                int x = ExtractInt(json, "x");
                int y = ExtractInt(json, "y");

                int actualX = (int)((x / 100.0) * screenW);
                int actualY = (int)((y / 100.0) * screenH);

                SetCursorPos(actualX, actualY);
                mouse_event(MOUSEEVENTF_RIGHTDOWN | MOUSEEVENTF_RIGHTUP, (uint)actualX, (uint)actualY, 0, 0);
            }
            else if (json.Contains("\"type\":\"keypress\""))
            {
                string key = ExtractString(json, "key");
                if (!string.IsNullOrEmpty(key) && key.Length == 1)
                {
                    byte vk = (byte)VkKeyScan(key[0]);
                    keybd_event(vk, 0, 0, 0);
                    keybd_event(vk, 0, KEYEVENTF_KEYUP, 0);
                }
            }
        }

        [DllImport("user32.dll")]
        private static extern short VkKeyScan(char ch);

        private static int ExtractInt(string json, string key)
        {
            try {
                int pos = json.IndexOf(string.Format("\"{0}\":", key));
                if (pos == -1) return 0;
                int start = pos + key.Length + 3;
                int end = json.IndexOf(',', start);
                if (end == -1) end = json.IndexOf('}', start);
                string val = json.Substring(start, end - start).Trim();
                return int.Parse(val);
            } catch { return 0; }
        }

        private static string ExtractString(string json, string key)
        {
            try {
                int pos = json.IndexOf(string.Format("\"{0}\":\"", key));
                if (pos == -1) return "";
                int start = pos + key.Length + 4;
                int end = json.IndexOf('"', start);
                return json.Substring(start, end - start);
            } catch { return ""; }
        }
    }

}
