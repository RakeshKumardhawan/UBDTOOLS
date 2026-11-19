using System;
using System.IO;
using Microsoft.Win32;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class EdgePolicyEngine
    {
        private const string EdgePoliciesPath = @"SOFTWARE\Policies\Microsoft\Edge";
        private const string BrowserEmulationPath = @"SOFTWARE\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION";

        public static bool ApplyIEModePolicies(string siteListXmlPath)
        {
            try
            {
                // 1. Configure Edge Group Policies in HKCU (Current User - always succeeds)
                using (RegistryKey edgeKeyHKCU = Registry.CurrentUser.CreateSubKey(EdgePoliciesPath))
                {
                    if (edgeKeyHKCU != null)
                    {
                        edgeKeyHKCU.SetValue("InternetExplorerIntegrationLevel", 1, RegistryValueKind.DWord); // 1 = IE Mode
                        edgeKeyHKCU.SetValue("InternetExplorerIntegrationSiteList", siteListXmlPath, RegistryValueKind.String);
                        edgeKeyHKCU.SetValue("InternetExplorerIntegrationReloadInIEModeAllowed", 1, RegistryValueKind.DWord);
                        edgeKeyHKCU.SetValue("InternetExplorerIntegrationSiteListRefreshInterval", 1, RegistryValueKind.DWord);
                        try { edgeKeyHKCU.DeleteValue("EnterpriseModeSiteList", false); } catch { }
                    }
                }

                // 2. Also attempt HKLM (Local Machine - for system-wide policy)
                try
                {
                    using (RegistryKey edgeKeyHKLM = Registry.LocalMachine.CreateSubKey(EdgePoliciesPath))
                    {
                        if (edgeKeyHKLM != null)
                        {
                            edgeKeyHKLM.SetValue("InternetExplorerIntegrationLevel", 1, RegistryValueKind.DWord);
                            edgeKeyHKLM.SetValue("InternetExplorerIntegrationSiteList", siteListXmlPath, RegistryValueKind.String);
                            edgeKeyHKLM.SetValue("InternetExplorerIntegrationReloadInIEModeAllowed", 1, RegistryValueKind.DWord);
                            edgeKeyHKLM.SetValue("InternetExplorerIntegrationSiteListRefreshInterval", 1, RegistryValueKind.DWord);
                            try { edgeKeyHKLM.DeleteValue("EnterpriseModeSiteList", false); } catch { }
                        }
                    }
                }
                catch
                {
                    // Non-admin fallback: HKCU policy is already active
                }

                // 3. Set legacy IE11 EnterpriseModeSiteList key under Internet Explorer policies (HKCU + HKLM)
                try
                {
                    using (RegistryKey ieKey = Registry.CurrentUser.CreateSubKey(@"SOFTWARE\Policies\Microsoft\Internet Explorer\Main\EnterpriseMode"))
                    {
                        if (ieKey != null)
                        {
                            ieKey.SetValue("Enable", "1", RegistryValueKind.String);
                            ieKey.SetValue("SiteList", siteListXmlPath, RegistryValueKind.String);
                        }
                    }
                    using (RegistryKey ieKeyLm = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Policies\Microsoft\Internet Explorer\Main\EnterpriseMode"))
                    {
                        if (ieKeyLm != null)
                        {
                            ieKeyLm.SetValue("Enable", "1", RegistryValueKind.String);
                            ieKeyLm.SetValue("SiteList", siteListXmlPath, RegistryValueKind.String);
                        }
                    }
                }
                catch { }

                // 4. Enforce IE5 Browser Emulation (64-bit & 32-bit WOW6432Node for Win7 IE11)
                ConfigureIE5BrowserEmulation();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(string.Format("Edge Policy configuration failed: {0}", ex.Message), ex);
            }
        }

        public static void ConfigureIE5BrowserEmulation()
        {
            try
            {
                // Set 5000 (IE5 Quirks Mode) in HKCU (Always succeeds)
                using (RegistryKey hkcuKey = Registry.CurrentUser.CreateSubKey(BrowserEmulationPath))
                {
                    if (hkcuKey != null)
                    {
                        hkcuKey.SetValue("msedge.exe", 5000, RegistryValueKind.DWord);
                        hkcuKey.SetValue("iexplore.exe", 5000, RegistryValueKind.DWord);
                        hkcuKey.SetValue("NICDigiSigner.exe", 5000, RegistryValueKind.DWord);
                    }
                }

                // Attempt HKLM in both 64-bit and 32-bit WOW6432Node views (critical for 32-bit IE11 on Win7 x64)
                RegistryView[] views = Environment.Is64BitOperatingSystem
                    ? new[] { RegistryView.Registry64, RegistryView.Registry32 }
                    : new[] { RegistryView.Registry32 };

                foreach (var view in views)
                {
                    try
                    {
                        using (RegistryKey baseLm = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, view))
                        using (RegistryKey hklmKey = baseLm.CreateSubKey(BrowserEmulationPath))
                        {
                            if (hklmKey != null)
                            {
                                hklmKey.SetValue("msedge.exe", 5000, RegistryValueKind.DWord);
                                hklmKey.SetValue("iexplore.exe", 5000, RegistryValueKind.DWord);
                                hklmKey.SetValue("NICDigiSigner.exe", 5000, RegistryValueKind.DWord);
                            }
                        }
                    }
                    catch { }
                }
            }
            catch (Exception ex)
            {
                throw new Exception(string.Format("IE5 Emulation configuration failed: {0}", ex.Message), ex);
            }
        }

        public static bool IsAndhraPradeshState(string stateName)
        {
            if (string.IsNullOrWhiteSpace(stateName)) return false;
            return stateName.IndexOf("Andhra", StringComparison.OrdinalIgnoreCase) >= 0 ||
                   stateName.Equals("AP", StringComparison.OrdinalIgnoreCase) ||
                   stateName.IndexOf("ap.gov.in", StringComparison.OrdinalIgnoreCase) >= 0;
        }

        public static string[] GetStateSpecificUbdSites(string stateName)
        {
            string resolvedState = string.IsNullOrWhiteSpace(stateName)
                ? Helpers.SystemInfoHelper.GetConfiguredState("Telangana")
                : stateName.Trim();

            if (IsAndhraPradeshState(resolvedState))
            {
                // STRICT Andhra Pradesh UBD ONLY (Zero Telangana / Zero PFMS / Zero non-UBD sites)
                return new string[]
                {
                    "http://www.ubd.ap.gov.in:8080/UBDNEW/",
                    "www.ubd.ap.gov.in:8080/UBDNEW",
                    "www.ubd.ap.gov.in:8080",
                    "www.ubd.ap.gov.in",
                    "ubd.ap.gov.in"
                };
            }

            // STRICT Telangana UBD ONLY (Zero Andhra Pradesh / Zero PFMS / Zero non-UBD sites)
            return new string[]
            {
                "https://ubd.telangana.gov.in/",
                "https://ubd.telangana.gov.in/login.do",
                "ubd.telangana.gov.in"
            };
        }

        public static string GenerateSiteListXmlForState(string stateName = null)
        {
            string resolvedState = string.IsNullOrWhiteSpace(stateName)
                ? Helpers.SystemInfoHelper.GetConfiguredState("Telangana")
                : stateName.Trim();

            bool isAp = IsAndhraPradeshState(resolvedState);
            string[] stateSites = GetStateSpecificUbdSites(resolvedState);
            string compatMode = isAp ? "IE7" : "IE5";
            string stateLabel = isAp ? "Andhra Pradesh UBD" : "Telangana UBD";

            string xmlContent = string.Format(@"<site-list version=""2"">
  <created-by>
    <tool>E-Vedhika UBD C# Deployment Tool ({0})</tool>
  </created-by>", stateLabel);

            foreach (var site in stateSites)
            {
                xmlContent += string.Format("\n  <site url=\"{0}\">\n    <compat-mode>{1}</compat-mode>\n    <open-in>IE11</open-in>\n  </site>", site, compatMode);
            }

            xmlContent += "\n</site-list>";

            string targetPath = @"C:\enterprise_compat\sites.xml";
            string altPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika", "sites.xml");
            
            try
            {
                if (!Directory.Exists(@"C:\enterprise_compat"))
                {
                    Directory.CreateDirectory(@"C:\enterprise_compat");
                }
                File.WriteAllText(targetPath, xmlContent);

                try
                {
                    string altDir = Path.GetDirectoryName(altPath);
                    if (!Directory.Exists(altDir)) Directory.CreateDirectory(altDir);
                    File.WriteAllText(altPath, xmlContent);
                }
                catch { }

                return targetPath;
            }
            catch (Exception ex)
            {
                try
                {
                    string altDir = Path.GetDirectoryName(altPath);
                    if (!Directory.Exists(altDir)) Directory.CreateDirectory(altDir);
                    File.WriteAllText(altPath, xmlContent);
                    return altPath;
                }
                catch { }

                Console.WriteLine(string.Format("SiteList XML write exception: {0}", ex.Message));
                return string.Empty;
            }
        }

        public static string GenerateSiteListXml(string[] domains)
        {
            // Determine strict target state from domains if unambiguous; otherwise use configured PC state.
            // Never mix Telangana and Andhra Pradesh sites in the same sites.xml.
            bool hasTs = false;
            bool hasAp = false;
            if (domains != null)
            {
                foreach (var d in domains)
                {
                    if (string.IsNullOrWhiteSpace(d)) continue;
                    if (d.IndexOf("telangana.gov.in", StringComparison.OrdinalIgnoreCase) >= 0) hasTs = true;
                    if (d.IndexOf("ap.gov.in", StringComparison.OrdinalIgnoreCase) >= 0) hasAp = true;
                }
            }

            string targetState;
            if (hasAp && !hasTs)
            {
                targetState = "Andhra Pradesh";
            }
            else if (hasTs && !hasAp)
            {
                targetState = "Telangana";
            }
            else
            {
                targetState = Helpers.SystemInfoHelper.GetConfiguredState("Telangana");
            }

            return GenerateSiteListXmlForState(targetState);
        }
    }
}
