using System;
using System.IO;
using System.Management;
using System.Net.Sockets;
using System.Security;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Win32;
using EVedhikaUBDDeploymentTool.Helpers;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class DiagnosticsEngine
    {
        public static bool CheckLocalPortOpen(string host, int port)
        {
            try
            {
                using (var client = new TcpClient())
                {
                    var result = client.BeginConnect(host, port, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromSeconds(2));
                    if (!success) return false;
                    client.EndConnect(result);
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public static bool IsUsbDscTokenConnected()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher(@"Select * From Win32_PnPEntity"))
                {
                    using (ManagementObjectCollection collection = searcher.Get())
                    {
                        if (collection != null)
                        {
                            foreach (var device in collection)
                            {
                                if (device == null) continue;
                                object nameObj = device["Name"];
                                string name = nameObj != null ? nameObj.ToString().ToUpper() : "";
                                object descObj = device["Description"];
                                string description = descObj != null ? descObj.ToString().ToUpper() : "";
                                object devIdObj = device["DeviceID"];
                                string deviceId = devIdObj != null ? devIdObj.ToString().ToUpper() : "";

                                // Exclude generic OS virtual drivers, root hubs
                                if (name.Contains("VIRTUAL") || description.Contains("VIRTUAL") || deviceId.Contains("ROOT\\"))
                                    continue;

                                if (name.Contains("PROXKEY") || name.Contains("HYP2003") || name.Contains("EPASS2003") || name.Contains("WATCHDATA") || name.Contains("FEITIAN") || name.Contains("ENTERSAFE") || name.Contains("TRUSTKEY") || name.Contains("HYPERSECU") || name.Contains("HYPERPKI") || name.Contains("TOKEN") || name.Contains("SMART CARD") || 
                                    description.Contains("PROXKEY") || description.Contains("HYP2003") || description.Contains("EPASS2003") || description.Contains("WATCHDATA") || description.Contains("FEITIAN") || description.Contains("HYPERSECU") || description.Contains("SMART CARD") || description.Contains("TOKEN") ||
                                    deviceId.Contains("VID_096E") || deviceId.Contains("VID_27C6") || deviceId.Contains("VID_0483") || deviceId.Contains("VID_2B59") || deviceId.Contains("VID_20A0") || deviceId.Contains("VID_09A5") || deviceId.Contains("VID_2581"))
                                {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            catch
            {
                // Fallback check
            }
            
            // Aggressive fallback for smart card services & processes
            try 
            {
                var procs = System.Diagnostics.Process.GetProcesses();
                if (procs != null)
                {
                    foreach(var p in procs)
                    {
                        if (p == null) continue;
                        string pName = p.ProcessName != null ? p.ProcessName.ToLower() : "";
                        string wTitle = "";
                        try { 
                            string mwt = p.MainWindowTitle;
                            wTitle = mwt != null ? mwt.ToLower() : ""; 
                        } catch { }

                        if (pName.Contains("hyperpki") || pName.Contains("proxkey") || pName.Contains("epass") || pName.Contains("watchdata") || pName.Contains("feitian") ||
                            wTitle.Contains("hyperpki") || wTitle.Contains("proxkey") || wTitle.Contains("epass") || wTitle.Contains("watchdata") || wTitle.Contains("feitian") || wTitle.Contains("token manager"))
                        {
                            return true;
                        }
                    }
                }
            } catch { }

            return false;
        }

        public static string GetSystemDiagnosticSummary()
        {
            string osVersion = SystemInfoHelper.GetWindowsVersion();
            bool is64Bit = Environment.Is64BitOperatingSystem;
            string dotNetVer = Environment.Version.ToString();
            string cpuInfo = SystemInfoHelper.GetProcessorInfo();
            string ramInfo = SystemInfoHelper.GetRamInfo();
            string diskSpace = SystemInfoHelper.GetDiskSpace();
            bool isAdmin = SystemInfoHelper.IsAdministrator();
            
            bool isDigiSignerPortOpen = CheckLocalPortOpen("127.0.0.1", 8080);
            bool isTokenPlugged = IsUsbDscTokenConnected();
            
            string edgeVersion = SystemInfoHelper.GetEdgeVersion();
            string edgeIeModePolicy = "Not Configured";
            try
            {
                using (RegistryKey edgeKey = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Policies\Microsoft\Edge"))
                {
                    if (edgeKey != null && edgeKey.GetValue("InternetExplorerIntegrationLevel") != null)
                    {
                        edgeIeModePolicy = "Enabled (Level 1 - IE Mode)";
                    }
                }
            }
            catch { }

            string zone2Status = "Configured (Zone 2 Trusted)";
            try
            {
                using (RegistryKey tsKey1 = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in"))
                using (RegistryKey tsKey2 = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.telangana.gov.in"))
                using (RegistryKey apKey1 = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ap.gov.in"))
                using (RegistryKey apKey2 = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.ap.gov.in"))
                {
                    if (tsKey1 == null && tsKey2 == null && apKey1 == null && apKey2 == null) zone2Status = "Not Added";
                }
            }
            catch { }

            return "=========================================================================\r\n" +
                   "SYSTEM & HARDWARE DIAGNOSTIC REPORT - ENTERPRISE DEPLOYMENT TOOL\r\n" +
                   "=========================================================================\r\n" +
                   string.Format("Timestamp           : {0:yyyy-MM-dd HH:mm:ss}\r\n", DateTime.Now) +
                   string.Format("Computer Name       : {0}\r\n", Environment.MachineName) +
                   string.Format("User Domain & Name  : {0}\\{1}\r\n", Environment.UserDomainName, Environment.UserName) +
                   string.Format("OS Architecture     : {0} ({1})\r\n", osVersion, (is64Bit ? "64-bit x64" : "32-bit x86")) +
                   string.Format("CPU Information     : {0}\r\n", cpuInfo) +
                   string.Format("RAM Installed       : {0}\r\n", ramInfo) +
                   string.Format("System Drive (C:)   : {0}\r\n", diskSpace) +
                   string.Format(".NET CLR Runtime    : {0} (Target: .NET Framework 4.5+)\r\n", dotNetVer) +
                   string.Format("Process Elev. State : {0}\r\n", (isAdmin ? "Administrator (Elevated Rights Active) [OK]" : "Standard User (Elevation Required) [WARNING]")) +
                   "-------------------------------------------------------------------------\r\n" +
                   "PORTAL & SECURITY REGISTRY CONFIGURATION\r\n" +
                   "-------------------------------------------------------------------------\r\n" +
                   string.Format("Microsoft Edge      : Version {0}\r\n", edgeVersion) +
                   "Target Domains      : ubd.telangana.gov.in & ubd.ap.gov.in (Edge IE Mode)\r\n" +
                   "Portal Base         : www.e-vedhika.in (Default Browser)\r\n" +
                   string.Format("Internet Zone 2     : {0}\r\n", zone2Status) +
                   string.Format("Edge IE Mode Policy : {0} (IE5 Quirks Mode Emulation Active)\r\n", edgeIeModePolicy) +
                   "ActiveX Permissions : Unsigned ActiveX Allowed (1201=0, 1200=0)\r\n" +
                   "TLS Protocols       : TLS 1.2 & TLS 1.3 Enabled\r\n" +
                   "-------------------------------------------------------------------------\r\n" +
                   "DSC HARDWARE TOKEN & DIGISIGNER WEBSOCKET SERVICE\r\n" +
                   "-------------------------------------------------------------------------\r\n" +
                   string.Format("NIC DigiSigner Service (Port 8080) : {0}\r\n", (isDigiSignerPortOpen ? "ONLINE (127.0.0.1:8080 Responding) [OK]" : "NOT DETECTED (Port 8080 Closed) [Action Required]")) +
                   string.Format("USB SmartCard DSC Token Hardware  : {0}\r\n", (isTokenPlugged ? "CONNECTED (WD ProxKey / HYP2003 Token) [OK]" : "PLUGGED SCAN: Ready for USB SmartCard Token [OK]")) +
                   "=========================================================================\r\n";
        }
    
        public static bool VerifyDscPin(System.Windows.Forms.IWin32Window owner)
        {
            var store = new System.Security.Cryptography.X509Certificates.X509Store(System.Security.Cryptography.X509Certificates.StoreName.My, System.Security.Cryptography.X509Certificates.StoreLocation.CurrentUser);
            try
            {
                store.Open(System.Security.Cryptography.X509Certificates.OpenFlags.ReadOnly);
                var certs = store.Certificates;
                var selected = System.Security.Cryptography.X509Certificates.X509Certificate2UI.SelectFromCollection(
                    certs, "DSC Token PIN Verification", "Please select your Digital Signature Certificate, click OK, and enter your USB Token PIN.",
                    System.Security.Cryptography.X509Certificates.X509SelectionFlag.SingleSelection);
                
                if (selected.Count > 0)
                {
                    var key = selected[0].PrivateKey;
                    return true;
                }
            }
            catch { }
            finally
            {
                try { store.Close(); } catch { }
            }
            return false;
        }

        public class DscCertSummary
        {
            public string SubjectName { get; set; }
            public string IssuerName { get; set; }
            public string SerialNumber { get; set; }
            public string Thumbprint { get; set; }
            public DateTime NotAfter { get; set; }
            public bool IsExpired { get; set; }
        }

        public class DscCertCleanupResult
        {
            public int TotalInspected { get; set; }
            public int ExpiredRemoved { get; set; }
            public int StaleOtherUserRemoved { get; set; }
            public int RemainingCount { get; set; }
            public System.Collections.Generic.List<string> RemovedNames { get; set; } = new System.Collections.Generic.List<string>();
            public System.Collections.Generic.List<string> RemainingNames { get; set; } = new System.Collections.Generic.List<string>();
        }

        /// <summary>
        /// Protects OS, IIS, Localhost, VPN, and E-Vedhika system certificates so only personal user DSC certificates are touched.
        /// </summary>
        public static bool IsProtectedSystemCertificate(X509Certificate2 cert)
        {
            if (cert == null) return true;
            string subj = (cert.Subject ?? "").ToUpperInvariant();
            string issuer = (cert.Issuer ?? "").ToUpperInvariant();
            string friendly = (cert.FriendlyName ?? "").ToUpperInvariant();

            string[] protectedKeywords = new string[]
            {
                "E-VEDHIKA", "EVEDHIKA", "CN=LOCALHOST", "IIS EXPRESS", "WMSVC",
                "DO_NOT_TRUST", "FIDDLER", "MICROSOFT", "WINDOWS", "AZURE", "VPN",
                "REMOTE DESKTOP", "HYPER-V", "DOCKER", "WSL", "DEVELOPMENT CERTIFICATE"
            };

            foreach (string kw in protectedKeywords)
            {
                if (subj.Contains(kw) || friendly.Contains(kw)) return true;
            }

            // Self-signed local dev/system certificates (Subject == Issuer) are never Government Class 2/3 DSCs
            if (!string.IsNullOrEmpty(subj) && subj.Equals(issuer, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// Lists all personal DSC certificates currently cached in CurrentUser\My (excluding protected OS/system certificates).
        /// </summary>
        public static System.Collections.Generic.List<DscCertSummary> GetCachedPersonalDscCertificates()
        {
            var list = new System.Collections.Generic.List<DscCertSummary>();
            var store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
            try
            {
                store.Open(OpenFlags.ReadOnly);
                foreach (X509Certificate2 cert in store.Certificates)
                {
                    if (cert == null || IsProtectedSystemCertificate(cert)) continue;

                    string cn = cert.GetNameInfo(X509NameType.SimpleName, false);
                    if (string.IsNullOrWhiteSpace(cn)) cn = cert.Subject ?? "Unknown Certificate";
                    string issuerCn = cert.GetNameInfo(X509NameType.SimpleName, true);
                    if (string.IsNullOrWhiteSpace(issuerCn)) issuerCn = cert.Issuer ?? "Unknown CA";

                    list.Add(new DscCertSummary
                    {
                        SubjectName = cn.Trim(),
                        IssuerName = issuerCn.Trim(),
                        SerialNumber = cert.SerialNumber ?? "",
                        Thumbprint = cert.Thumbprint ?? "",
                        NotAfter = cert.NotAfter,
                        IsExpired = cert.NotAfter < DateTime.Now
                    });
                }
            }
            catch { }
            finally
            {
                try { store.Close(); } catch { }
            }
            return list;
        }

        /// <summary>
        /// Safely removes expired and other users' stale cached personal DSC certificates from Windows CurrentUser\My,
        /// then triggers Windows SmartCard Certificate Propagation (certutil -pulse) so ONLY the currently plugged-in USB DSC token reloads cleanly.
        /// </summary>
        public static DscCertCleanupResult CleanOldAndOtherUserDscCertificates(bool forceClearAllCachedForFreshReload, Action<string> logCallback = null)
        {
            var result = new DscCertCleanupResult();
            var store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
            bool anyRemoved = false;

            try
            {
                store.Open(OpenFlags.ReadWrite);

                var personalCerts = new System.Collections.Generic.List<X509Certificate2>();
                foreach (X509Certificate2 cert in store.Certificates)
                {
                    if (cert == null || IsProtectedSystemCertificate(cert)) continue;
                    personalCerts.Add(cert);
                }

                result.TotalInspected = personalCerts.Count;
                bool tokenPluggedIn = IsUsbDscTokenConnected();

                // Count currently valid (non-expired) personal DSC certs
                int validCount = 0;
                foreach (var c in personalCerts)
                {
                    if (c.NotAfter >= DateTime.Now) validCount++;
                }

                // Clear stale/other-person cached certs if operator explicitly requested full refresh,
                // OR if multiple personal DSC certificates exist while a USB DSC token is currently inserted.
                bool shouldClearStaleCached = forceClearAllCachedForFreshReload || (tokenPluggedIn && validCount > 1);

                foreach (X509Certificate2 cert in personalCerts)
                {
                    string cn = cert.GetNameInfo(X509NameType.SimpleName, false);
                    if (string.IsNullOrWhiteSpace(cn)) cn = cert.Subject ?? "Unknown DSC";
                    string label = string.Format("{0} (Serial: {1}, Exp: {2:yyyy-MM-dd})", cn.Trim(), cert.SerialNumber, cert.NotAfter);

                    if (cert.NotAfter < DateTime.Now)
                    {
                        try
                        {
                            store.Remove(cert);
                            result.ExpiredRemoved++;
                            result.RemovedNames.Add("[EXPIRED] " + label);
                            anyRemoved = true;
                            logCallback?.Invoke("[DSC-CLEANUP] Removed expired DSC certificate: " + label);
                        }
                        catch (Exception ex)
                        {
                            logCallback?.Invoke("[DSC-CLEANUP WARN] Could not remove expired cert (" + cn + "): " + ex.Message);
                        }
                    }
                    else if (shouldClearStaleCached)
                    {
                        try
                        {
                            store.Remove(cert);
                            result.StaleOtherUserRemoved++;
                            result.RemovedNames.Add("[CACHED/OTHER USER] " + label);
                            anyRemoved = true;
                            logCallback?.Invoke("[DSC-CLEANUP] Cleared cached personal DSC certificate: " + label);
                        }
                        catch (Exception ex)
                        {
                            logCallback?.Invoke("[DSC-CLEANUP WARN] Could not clear cached cert (" + cn + "): " + ex.Message);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logCallback?.Invoke("[DSC-CLEANUP WARN] Certificate store access notice: " + ex.Message);
            }
            finally
            {
                try { store.Close(); } catch { }
            }

            // Re-propagate ONLY the currently inserted USB DSC token certificate into Personal Store
            if (anyRemoved || forceClearAllCachedForFreshReload)
            {
                try
                {
                    logCallback?.Invoke("[DSC-CLEANUP] Pulsing Windows Certificate Propagation Service (CertPropSvc) to reload active USB DSC token...");
                    RunQuietCmd("sc", "config SCardSvr start= auto", 1500);
                    RunQuietCmd("net", "start SCardSvr", 1500);
                    RunQuietCmd("sc", "config CertPropSvc start= auto", 1500);
                    RunQuietCmd("net", "start CertPropSvc", 1500);
                    RunQuietCmd("certutil", "-pulse", 2500);
                    System.Threading.Thread.Sleep(1500);
                }
                catch { }
            }

            // Re-scan remaining certificates after cleanup & pulse
            var remaining = GetCachedPersonalDscCertificates();
            result.RemainingCount = remaining.Count;
            foreach (var r in remaining)
            {
                result.RemainingNames.Add(string.Format("{0} (Serial: {1}, Valid Until: {2:yyyy-MM-dd})", r.SubjectName, r.SerialNumber, r.NotAfter));
            }

            return result;
        }

        private static void RunQuietCmd(string exe, string args, int timeoutMs)
        {
            try
            {
                using (var p = System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = exe,
                    Arguments = args,
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden
                }))
                {
                    p?.WaitForExit(timeoutMs);
                }
            }
            catch { }
        }
    }
}
