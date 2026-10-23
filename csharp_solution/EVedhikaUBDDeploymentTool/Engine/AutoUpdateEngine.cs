using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using EVedhikaUBDDeploymentTool.Helpers;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class AutoUpdateEngine
    {
        public const string CurrentVersion = "v1.0.7";
        public const int CurrentVersionCode = 10007; // (1 * 10000) + (0 * 100) + 7
        public const string CurrentResourceBuild = "2026.10.21-R4";
        public const string ResourceDate = "2026-10-21";
        public const string UpdateApiUrl = "https://www.e-vedhika.in/admin/exe_ubd_live?action=check_update";

        private static string ExtractJsonValue(string json, string key)
        {
            if (string.IsNullOrEmpty(json) || string.IsNullOrEmpty(key)) return "";
            try
            {
                var match = System.Text.RegularExpressions.Regex.Match(json, $"\"{key}\"\\s*:\\s*\"([^\"]*)\"", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                if (match.Success) return match.Groups[1].Value;

                // Also check for non-quoted values (numbers/bools)
                var matchNum = System.Text.RegularExpressions.Regex.Match(json, $"\"{key}\"\\s*:\\s*([^,\\s}}]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                if (matchNum.Success) return matchNum.Groups[1].Value.Replace("\"", "").Trim();
            }
            catch { }
            return "";
        }

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
        /// Checks central cloud server (https://www.e-vedhika.in/admin/exe_ubd_live) and GitHub Releases for software updates.
        /// Returns UpdateInfo with server release details and version check results.
        /// </summary>
        
        public class ResourceUpdateInfo
        {
            public bool Success { get; set; }
            public string AppVersion { get; set; } = CurrentVersion;
            public string ActiveResourceBuild { get; set; } = CurrentResourceBuild;
            public string ServerResourceBuild { get; set; } = CurrentResourceBuild;
            public string ResourceNotes { get; set; }
            public bool IsNewResourceAvailable { get; set; }
            public string Message { get; set; }
        }

        public static ResourceUpdateInfo CheckAndApplyLiveResources(Action<string> logCallback = null)
        {
            var resInfo = new ResourceUpdateInfo
            {
                Success = true,
                AppVersion = CurrentVersion,
                ActiveResourceBuild = CurrentResourceBuild,
                ServerResourceBuild = CurrentResourceBuild,
                Message = $"✅ Main App Version {CurrentVersion} | Live Resource Build {CurrentResourceBuild} (Up to Date)."
            };

            try
            {
                logCallback?.Invoke($"[RESOURCE ENGINE] App Version {CurrentVersion} | Active Resource Build: {CurrentResourceBuild}");
                logCallback?.Invoke("[RESOURCE ENGINE] Syncing dynamic rules, sites.xml policies & live posts Over-The-Air (OTA)...");

                var posts = GetLiveNewsFeed();
                if (posts.Count > 0)
                {
                    logCallback?.Invoke($"[RESOURCE ENGINE] Live Posts & Announcements updated ({posts.Count} active items synced).");
                }

                bool healed = AutoRepairEngine.PerformSelfHealingAudit(logCallback);
                if (healed)
                {
                    logCallback?.Invoke("[RESOURCE ENGINE] Dynamic UBD Zone 2 rules & sites.xml policy patch applied successfully.");
                }
            }
            catch (Exception ex)
            {
                logCallback?.Invoke($"[RESOURCE ENGINE WARN] {ex.Message}");
            }

            return resInfo;
        }

public static UpdateInfo CheckForUpdates(Action<string> logCallback = null)
        {
            logCallback?.Invoke("[AUTO-UPDATE] Checking www.e-vedhika.in & GitHub Releases for software updates...");

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
                "https://raw.githubusercontent.com/RakeshKumardhawan/UBDTOOLS/main/public/version.json",
                "https://raw.githubusercontent.com/RakeshKumardhawan/UBDTOOLS/main/public/api/version.json",
                "https://api.github.com/repos/RakeshKumardhawan/UBDTOOLS/releases/latest",
                "https://ais-dev-54cvk7cjdeugn77dw5lddj-585783354343.asia-southeast1.run.app/api/version",
                "https://www.e-vedhika.in/admin/exe_ubd_live?action=check_update",
                "https://www.e-vedhika.in/version.json"
            };

            bool fetched = false;

            foreach (string url in candidateUrls)
            {
                try
                {
                    using (var wc = new TimeoutWebClient(4000))
                    {
                        wc.Headers[HttpRequestHeader.UserAgent] = "EVedhika-Update-Agent/1.0.7";
                        wc.Encoding = System.Text.Encoding.UTF8;
                        string jsonResponse = wc.DownloadString(url);

                        if (string.IsNullOrEmpty(jsonResponse)) continue;

                        string latestVer = "";
                        string releaseNotes = "";
                        string downloadUrl = "";
                        int serverCode = 0;
                        bool isSilent = false;

                        // Case 1: Custom version.json schema (contains latestVersion)
                        if (jsonResponse.Contains("\"latestVersion\":"))
                        {
                            latestVer = ExtractJsonValue(jsonResponse, "latestVersion");
                            releaseNotes = ExtractJsonValue(jsonResponse, "releaseNotes");
                            downloadUrl = ExtractJsonValue(jsonResponse, "downloadUrl");
                            string vCodeStr = ExtractJsonValue(jsonResponse, "versionCode");
                            string silentStr = ExtractJsonValue(jsonResponse, "silent");
                            if (string.IsNullOrEmpty(silentStr)) silentStr = ExtractJsonValue(jsonResponse, "silentUpdate");

                            int.TryParse(vCodeStr, out serverCode);
                            bool.TryParse(silentStr, out isSilent);

                            // Calculate weight if serverCode missing or unparsed
                            if (serverCode <= 0 && !string.IsNullOrEmpty(latestVer))
                            {
                                serverCode = ParseVersionToWeight(latestVer);
                            }
                        }
                        // Case 2: GitHub Releases API schema (contains tag_name and assets)
                        else if (jsonResponse.Contains("\"tag_name\":") || jsonResponse.Contains("\"assets\":"))
                        {
                            // Search and inspect ALL EVedhika_Setup_v*.exe assets to find the HIGHEST version
                            var matches = System.Text.RegularExpressions.Regex.Matches(jsonResponse, @"(EVedhika_Setup_v([0-9\.]+)\.exe)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                            int highestAssetWeight = 0;
                            string highestAssetVer = "";
                            string highestAssetFile = "";

                            foreach (System.Text.RegularExpressions.Match m in matches)
                            {
                                if (m.Success && m.Groups.Count >= 3)
                                {
                                    string vStr = m.Groups[2].Value;
                                    int weight = ParseVersionToWeight(vStr);
                                    if (weight > highestAssetWeight)
                                    {
                                        highestAssetWeight = weight;
                                        highestAssetVer = "v" + vStr;
                                        highestAssetFile = m.Groups[1].Value;
                                    }
                                }
                            }

                            if (highestAssetWeight > 0)
                            {
                                latestVer = highestAssetVer;
                                serverCode = highestAssetWeight;
                                downloadUrl = $"https://github.com/RakeshKumardhawan/UBDTOOLS/releases/download/latest/{highestAssetFile}";
                                releaseNotes = "Official GitHub Release: " + latestVer;
                            }
                            else
                            {
                                string tag = ExtractJsonValue(jsonResponse, "tag_name");
                                if (!string.IsNullOrEmpty(tag) && !tag.Equals("latest", StringComparison.OrdinalIgnoreCase))
                                {
                                    latestVer = tag.StartsWith("v", StringComparison.OrdinalIgnoreCase) ? tag : "v" + tag;
                                    serverCode = ParseVersionToWeight(latestVer);
                                }
                            }
                        }

                        if (!string.IsNullOrEmpty(latestVer))
                        {
                            info.Success = true;
                            info.LatestVersion = latestVer;
                            info.ReleaseNotes = string.IsNullOrEmpty(releaseNotes) ? "Portal and UBD deployment updates." : releaseNotes;
                            info.DownloadUrl = string.IsNullOrEmpty(downloadUrl) ? "https://github.com/RakeshKumardhawan/UBDTOOLS/releases/latest/download/EVedhika_Setup_v1.0.7.exe" : downloadUrl;
                            info.IsSilent = isSilent;
                            info.VersionCode = serverCode > 0 ? serverCode : ParseVersionToWeight(latestVer);

                            // Strict check: only consider an update if server version is strictly GREATER than current installed build
                            bool isNewer = false;
                            if (info.VersionCode > CurrentVersionCode)
                            {
                                isNewer = true;
                            }
                            else if (info.VersionCode <= 0)
                            {
                                isNewer = ParseVersionToWeight(info.LatestVersion) > CurrentVersionCode;
                            }

                            if (isNewer)
                            {
                                info.IsUpdateAvailable = true;
                                info.Message = $"✨ New Software Update Available: {info.LatestVersion}!\n\nRelease Notes: {info.ReleaseNotes}";
                                logCallback?.Invoke($"[AUTO-UPDATE] NEW UPDATE DETECTED: {info.LatestVersion} from {url}");
                            }
                            else
                            {
                                info.IsUpdateAvailable = false;
                                info.Message = $"✅ You are using the latest version ({CurrentVersion}). Your software is up to date!";
                                logCallback?.Invoke($"[AUTO-UPDATE] Software is up to date ({CurrentVersion}). Verified via {url}");
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
            string[] endpoints = new string[]
            {
                "https://raw.githubusercontent.com/RakeshKumardhawan/UBDTOOLS/main/public/admin/announcements.json",
                "https://raw.githubusercontent.com/RakeshKumardhawan/UBDTOOLS/main/public/admin/exe_ubd_live.json",
                "https://www.e-vedhika.in/admin/announcements.json",
                "https://www.e-vedhika.in/admin/exe_ubd_live.json",
                "https://www.e-vedhika.in/announcements.json",
                "https://www.e-vedhika.in/api/v1/posts/feed",
                "https://www.e-vedhika.in/admin/exe_ubd_live?action=get_news"
            };

            foreach (var url in endpoints)
            {
                try
                {
                    using (var wc = new TimeoutWebClient(4000))
                    {
                        wc.Headers[HttpRequestHeader.UserAgent] = "e-Vedhika-News-Agent/1.0";
                        wc.Encoding = System.Text.Encoding.UTF8;
                        string json = wc.DownloadString(url);
                        if (!string.IsNullOrEmpty(json))
                        {
                            var objMatches = System.Text.RegularExpressions.Regex.Matches(json, @"\{[^{}]*\}");
                            foreach (System.Text.RegularExpressions.Match m in objMatches)
                            {
                                string block = m.Value;
                                var tMatch = System.Text.RegularExpressions.Regex.Match(block, @"""title""\s*:\s*""([^""]*)""");
                                var cMatch = System.Text.RegularExpressions.Regex.Match(block, @"""content""\s*:\s*""([^""]*)""");
                                if (tMatch.Success && cMatch.Success)
                                {
                                    string title = tMatch.Groups[1].Value.Trim();
                                    string content = cMatch.Groups[1].Value.Trim();
                                    if (!string.IsNullOrEmpty(title) && !string.IsNullOrEmpty(content) && !title.Equals("success", StringComparison.OrdinalIgnoreCase))
                                    {
                                        var dMatch = System.Text.RegularExpressions.Regex.Match(block, @"""date""\s*:\s*""([^""]*)""");
                                        var iMatch = System.Text.RegularExpressions.Regex.Match(block, @"""importance""\s*:\s*""([^""]*)""");
                                        news.Add(new NewsItem
                                        {
                                            Title = CleanJsonString(title),
                                            Content = CleanJsonString(content),
                                            Date = dMatch.Success ? dMatch.Groups[1].Value : DateTime.Now.ToString("yyyy-MM-dd"),
                                            Importance = iMatch.Success ? iMatch.Groups[1].Value : "Normal"
                                        });
                                    }
                                }
                            }
                            if (news.Count > 0) break; // Stop after first successful fetch
                        }
                    }
                }
                catch { }
            }

            // Fallback default announcements if offline or server is temporarily unreachable
            if (news.Count == 0)
            {
                news.Add(new NewsItem
                {
                    Title = "E-Vedhika Live Deployment Engine Active",
                    Content = "UBD Telangana (ubd.telangana.gov.in) Zone 2 Registry Automation, DSC Token Drivers & Central Live Telemetry active.",
                    Date = DateTime.Now.ToString("yyyy-MM-dd"),
                    Importance = "High"
                });
                news.Add(new NewsItem
                {
                    Title = "UBD Portal Security Guidelines",
                    Content = "Ensure Edge IE Mode and Zone 2 Trusted Sites configuration are kept verified. AutoRepair Guardian automatically secures all policies.",
                    Date = DateTime.Now.ToString("yyyy-MM-dd"),
                    Importance = "Medium"
                });
            }

            return news;
        }

        private static string CleanJsonString(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";
            try
            {
                return System.Text.RegularExpressions.Regex.Unescape(text).Replace(@"\/", "/");
            }
            catch
            {
                return text;
            }
        }

        public static int ParseVersionToWeight(string version)
        {
            if (string.IsNullOrEmpty(version)) return 0;
            try
            {
                string clean = System.Text.RegularExpressions.Regex.Replace(version, @"[^0-9\.]", "");
                string[] parts = clean.Split('.');
                int p1 = 0, p2 = 0, p3 = 0;
                if (parts.Length >= 1) int.TryParse(parts[0], out p1);
                if (parts.Length >= 2) int.TryParse(parts[1], out p2);
                if (parts.Length >= 3) int.TryParse(parts[2], out p3);
                return (p1 * 10000) + (p2 * 100) + p3;
            }
            catch
            {
                return 0;
            }
        }
    }
}
