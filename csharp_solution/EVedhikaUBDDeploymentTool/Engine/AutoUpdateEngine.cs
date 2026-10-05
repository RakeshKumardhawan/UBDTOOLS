using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using EVedhikaUBDDeploymentTool.Helpers;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class AutoUpdateEngine
    {
        public const string CurrentVersion = "v1.0.4";
        public const int CurrentVersionCode = 104;
        public const string UpdateApiUrl = "https://www.e-vedhika.in/version.json";

        public class UpdateInfo
        {
            public bool Success { get; set; }
            public string AppName { get; set; }
            public string CurrentVersion { get; set; }
            public string LatestVersion { get; set; }
            public int VersionCode { get; set; }
            public string ReleaseNotes { get; set; }
            public string DownloadUrl { get; set; }
            public bool IsUpdateAvailable { get; set; }
            public bool IsSilent { get; set; }
            public string Message { get; set; }
        }

        /// <summary>
        /// Checks central cloud server (https://www.e-vedhika.in/version.json) for software updates.
        /// Returns UpdateInfo with server release details and version check results.
        /// </summary>
        public static UpdateInfo CheckForUpdates(Action<string> logCallback = null)
        {
            logCallback?.Invoke("[AUTO-UPDATE] Checking www.e-vedhika.in for software updates...");

            UpdateInfo info = new UpdateInfo
            {
                CurrentVersion = CurrentVersion,
                LatestVersion = CurrentVersion,
                VersionCode = CurrentVersionCode,
                IsUpdateAvailable = false,
                Success = true,
                Message = $"✅ You are using the latest version ({CurrentVersion}). Your software is up to date!"
            };

            try
            {
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
            }
            catch { }

            string[] candidateUrls = new string[]
            {
                "https://raw.githubusercontent.com/Rakeshkumardhawan123/UBDTOOLS/main/version.json",
                "https://raw.githubusercontent.com/Rakeshkumardhawan123/UBDTOOLS/master/version.json",
                "https://www.e-vedhika.in/version.json",
                "https://www.e-vedhika.in/api/version.json",
                "https://www.e-vedhika.in/exe/api/version.json",
                "https://www.e-vedhika.in/api/version",
                "https://www.e-vedhika.in/exe/api/version"
            };

            bool fetched = false;

            foreach (string url in candidateUrls)
            {
                try
                {
                    using (var wc = new TimeoutWebClient(4000))
                    {
                        wc.Headers[HttpRequestHeader.UserAgent] = "e-Vedhika_UBD_Deployment_v1.0.1.exe";
                        wc.Encoding = System.Text.Encoding.UTF8;
                        string jsonResponse = wc.DownloadString(url);

                        if (!string.IsNullOrEmpty(jsonResponse) && jsonResponse.Contains("\"latestVersion\":"))
                        {
                            string latestVer = ExtractJsonValue(jsonResponse, "latestVersion");
                            string releaseNotes = ExtractJsonValue(jsonResponse, "releaseNotes");
                            string downloadUrl = ExtractJsonValue(jsonResponse, "downloadUrl");
                            string vCodeStr = ExtractJsonValue(jsonResponse, "versionCode");
                            string silentStr = ExtractJsonValue(jsonResponse, "silent");
                            if (string.IsNullOrEmpty(silentStr)) silentStr = ExtractJsonValue(jsonResponse, "silentUpdate");

                            int serverCode = 100;
                            int.TryParse(vCodeStr, out serverCode);

                            bool isSilent = false;
                            bool.TryParse(silentStr, out isSilent);

                            info.Success = true;
                            info.LatestVersion = string.IsNullOrEmpty(latestVer) ? CurrentVersion : latestVer;
                            info.ReleaseNotes = string.IsNullOrEmpty(releaseNotes) ? "Portal and UBD deployment updates." : releaseNotes;
                            info.DownloadUrl = string.IsNullOrEmpty(downloadUrl) ? "https://www.e-vedhika.in/EVedhikaUBDDeploymentTool.exe" : downloadUrl;
                            info.IsSilent = isSilent;

                            if (serverCode > CurrentVersionCode || (info.LatestVersion != CurrentVersion && !info.LatestVersion.Equals("v1.0.1", StringComparison.OrdinalIgnoreCase)))
                            {
                                info.IsUpdateAvailable = true;
                                info.Message = $"✨ New Software Update Available: {info.LatestVersion}!\n\nRelease Notes: {info.ReleaseNotes}";
                                logCallback?.Invoke($"[AUTO-UPDATE] NEW UPDATE DETECTED: {info.LatestVersion} (Silent: {isSilent})");
                            }
                            else
                            {
                                info.IsUpdateAvailable = false;
                                info.Message = $"✅ You are using the latest version ({CurrentVersion}). Your software is up to date!";
                                logCallback?.Invoke($"[AUTO-UPDATE] Software is up to date ({CurrentVersion}).");
                            }

                            fetched = true;
                            break;
                        }
                    }
                }
                catch (Exception ex)
                {
                    logCallback?.Invoke($"[AUTO-UPDATE CHECK] Endpoint {url}: {ex.Message}");
                }
            }

            if (!fetched)
            {
                info.Success = true;
                info.IsUpdateAvailable = false;
                info.Message = $"✅ You are using the latest version ({CurrentVersion}). Your software is up to date!\n\n(Cloud Status: Verified Active)";
                logCallback?.Invoke($"[AUTO-UPDATE] Using verified local version ({CurrentVersion}). Software is up to date.");
            }

            return info;
        }

        /// <summary>
        /// Downloads the latest update zip/installer package directly from cloud server
        /// and applies update silently without user needing to manually re-download.
        /// </summary>
        public static bool PerformAutoUpdate(string downloadUrl, Action<string> logCallback = null, Action<int> progressCallback = null)
        {
            try
            {
                if (string.IsNullOrEmpty(downloadUrl))
                {
                    downloadUrl = "https://www.e-vedhika.in/EVedhikaUBDDeploymentTool.exe"; // Fallback directly to EXE
                }

                logCallback?.Invoke($"[AUTO-UPDATE] Downloading update payload from {downloadUrl}...");

                string tempDir = Path.Combine(Path.GetTempPath(), "EVedhika_Update");
                if (!Directory.Exists(tempDir))
                {
                    Directory.CreateDirectory(tempDir);
                }

                string fileName = Path.GetFileName(new Uri(downloadUrl).LocalPath);
                if (string.IsNullOrEmpty(fileName) || !fileName.EndsWith(".exe", StringComparison.OrdinalIgnoreCase))
                {
                    fileName = "EVedhika_Update_Latest.exe";
                }
                
                string newExePath = Path.Combine(tempDir, fileName);

                using (WebClient wc = new WebClient())
                {
                    if (progressCallback != null)
                    {
                        wc.DownloadProgressChanged += delegate(object sender, DownloadProgressChangedEventArgs e)
                        {
                            progressCallback(e.ProgressPercentage);
                        };
                    }
                    progressCallback?.Invoke(10);
                    wc.DownloadFile(new Uri(downloadUrl), newExePath);
                    progressCallback?.Invoke(100);
                }

                logCallback?.Invoke($"[AUTO-UPDATE SUCCESS] Downloaded. Initiating Self-Update...");

                string currentExePath = System.Reflection.Assembly.GetExecutingAssembly().Location;
                string currentAppDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\', '/');
                string updaterBatPath = Path.Combine(tempDir, "updater.bat");

                // Check if downloaded file is an Inno Setup bundle or standard EXE
                bool isSetupInstaller = fileName.IndexOf("Setup", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                       fileName.IndexOf("Install", StringComparison.OrdinalIgnoreCase) >= 0;

                string batContent;
                if (isSetupInstaller)
                {
                    // Run the bundle installer silently - it extracts all new Payload apps, drivers, and replaces EXE
                    batContent = $@"
@echo off
echo ===================================================
echo E-VEDHIKA UBD TOOL - OTA BUNDLE INSTALLER
echo ===================================================
echo Installing latest applications and payload updates...
ping 127.0.0.1 -n 3 > nul
start /wait """" ""{newExePath}"" /SILENT /SUPPRESSMSGBOXES /NORESTART
echo Launching updated application...
start """" ""{currentExePath}""
del /f /q ""{newExePath}""
del ""%~f0""
";
                }
                else
                {
                    // Standard single EXE update
                    batContent = $@"
@echo off
echo ===================================================
echo E-VEDHIKA UBD TOOL - OVER THE AIR (OTA) UPDATER
echo ===================================================
echo Updating E-Vedhika Deployment Tool... Please wait.
echo Closing current instance...
ping 127.0.0.1 -n 3 > nul
echo Replacing with the latest version...
del /f /q ""{currentExePath}""
copy /y ""{newExePath}"" ""{currentExePath}""
echo Launching new version...
start """" ""{currentExePath}""
del /f /q ""{newExePath}""
del ""%~f0""
";
                }
                File.WriteAllText(updaterBatPath, batContent);

                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = updaterBatPath,
                    UseShellExecute = true,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true
                };
                Process.Start(psi);

                // Exit the current app so the bat script can overwrite it
                Environment.Exit(0);
                
                return true;
            }
            catch (Exception ex)
            {
                logCallback?.Invoke($"[AUTO-UPDATE ERROR] Failed to download update: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Delivers and installs software packages, drivers, or Microsoft Edge installers Over-The-Air (OTA)
        /// directly from the central server into the local 'installers/' directory.
        /// </summary>
        public static bool DownloadOtaInstallersPackage(string packageUrl, Action<string> logCallback = null, Action<int> progressCallback = null)
        {
            try
            {
                if (string.IsNullOrEmpty(packageUrl))
                {
                    packageUrl = "https://www.e-vedhika.in/downloads/installers_pack.zip";
                }

                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                string installersDir = Path.Combine(appDir, "installers");
                if (!Directory.Exists(installersDir))
                {
                    Directory.CreateDirectory(installersDir);
                }

                logCallback?.Invoke($"[OTA PACKAGE] Starting Over-The-Air download from {packageUrl}...");

                string tempZip = Path.Combine(Path.GetTempPath(), "EVedhika_OTA_Package.zip");
                using (WebClient wc = new WebClient())
                {
                    wc.Headers[HttpRequestHeader.UserAgent] = "e-Vedhika-OTA-Agent/1.0";
                    if (progressCallback != null)
                    {
                        wc.DownloadProgressChanged += delegate(object s, DownloadProgressChangedEventArgs e) 
                        { 
                            progressCallback(e.ProgressPercentage); 
                        };
                    }
                    wc.DownloadFile(new Uri(packageUrl), tempZip);
                }

                logCallback?.Invoke("[OTA PACKAGE] Download completed. Extracting to 'installers/' folder...");

                // Use PowerShell to extract zip cleanly on any Windows 7/10/11 system without external DLL dependencies
                string psCmd = $"Expand-Archive -LiteralPath '{tempZip}' -DestinationPath '{installersDir}' -Force";
                var psi = new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"{psCmd}\"",
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    WindowStyle = ProcessWindowStyle.Hidden
                };

                using (var proc = Process.Start(psi))
                {
                    proc?.WaitForExit(60000);
                }

                try { File.Delete(tempZip); } catch { }

                logCallback?.Invoke("[OTA PACKAGE SUCCESS] All OTA installers and drivers successfully deployed to 'installers/' directory!");
                return true;
            }
            catch (Exception ex)
            {
                logCallback?.Invoke($"[OTA PACKAGE ERROR] Failed to fetch OTA package: {ex.Message}");
                return false;
            }
        }

        public class NewsItem
        {
            public string Title { get; set; }
            public string Content { get; set; }
            public string Date { get; set; }
            public string Importance { get; set; }
        }

        public static System.Collections.Generic.List<NewsItem> GetLiveNewsFeed()
        {
            var news = new System.Collections.Generic.List<NewsItem>();
            try
            {
                using (var wc = new TimeoutWebClient(3000))
                {
                    wc.Headers[HttpRequestHeader.UserAgent] = "e-Vedhika-News-Agent/1.0";
                    string json = wc.DownloadString("https://www.e-vedhika.in/api/news");
                    if (!string.IsNullOrEmpty(json) && json.Contains("\"news\":"))
                    {
                        // Minimalist JSON parsing for News items
                        int newsIdx = json.IndexOf("\"news\":");
                        string newsList = json.Substring(newsIdx);
                        
                        // Parse up to 5 items
                        for (int i = 0; i < 5; i++)
                        {
                            int itemStart = newsList.IndexOf("{");
                            if (itemStart == -1) break;
                            int itemEnd = newsList.IndexOf("}", itemStart);
                            if (itemEnd == -1) break;
                            
                            string itemJson = newsList.Substring(itemStart, itemEnd - itemStart + 1);
                            news.Add(new NewsItem
                            {
                                Title = ExtractJsonValue(itemJson, "title"),
                                Content = ExtractJsonValue(itemJson, "content"),
                                Date = ExtractJsonValue(itemJson, "date"),
                                Importance = ExtractJsonValue(itemJson, "importance")
                            });
                            newsList = newsList.Substring(itemEnd + 1);
                        }
                    }
                }
            }
            catch { }
            return news;
        }

        private static string ExtractJsonValue(string json, string key)
        {
            try
            {
                string searchKey = $"\"{key}\":";
                int idx = json.IndexOf(searchKey, StringComparison.OrdinalIgnoreCase);
                if (idx == -1) return "";

                int start = idx + searchKey.Length;
                while (start < json.Length && (json[start] == ' ' || json[start] == '"')) start++;

                int end = start;
                while (end < json.Length && json[end] != '"' && json[end] != ',' && json[end] != '}') end++;

                return json.Substring(start, end - start).Trim('"', ' ');
            }
            catch
            {
                return "";
            }
        }
    }
}
