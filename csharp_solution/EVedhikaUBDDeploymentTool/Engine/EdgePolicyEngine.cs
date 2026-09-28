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
                        edgeKeyHKCU.SetValue("EnterpriseModeSiteList", "file:///" + siteListXmlPath.Replace("\\", "/"), RegistryValueKind.String);
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
                            edgeKeyHKLM.SetValue("EnterpriseModeSiteList", "file:///" + siteListXmlPath.Replace("\\", "/"), RegistryValueKind.String);
                        }
                    }
                }
                catch
                {
                    // Non-admin fallback: HKCU policy is already active
                }

                // 3. Enforce IE5 Browser Emulation
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

                // Attempt HKLM
                try
                {
                    using (RegistryKey hklmKey = Registry.LocalMachine.CreateSubKey(BrowserEmulationPath))
                    {
                        if (hklmKey != null)
                        {
                            hklmKey.SetValue("msedge.exe", 5000, RegistryValueKind.DWord);
                            hklmKey.SetValue("iexplore.exe", 5000, RegistryValueKind.DWord);
                            hklmKey.SetValue("NICDigiSigner.exe", 5000, RegistryValueKind.DWord);
                        }
                    }
                }
                catch
                {
                    // HKLM skipped if non-admin
                }
            }
            catch (Exception ex)
            {
                throw new Exception(string.Format("IE5 Emulation configuration failed: {0}", ex.Message), ex);
            }
        }

        public static string GenerateSiteListXml(string[] domains)
        {
            string xmlContent = @"<site-list version=""2"">
  <created-by>
    <tool>E-Vedhika UBD C# Deployment Tool</tool>
  </created-by>";

            foreach (var domain in domains)
            {
                xmlContent += string.Format("\n  <site url=\"{0}\">\n    <compat-mode>IE5</compat-mode>\n    <open-in>IE11</open-in>\n  </site>", domain);
            }

            xmlContent += "\n</site-list>";

            string targetPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika", "sites.xml");
            
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(targetPath));
                File.WriteAllText(targetPath, xmlContent);
                return targetPath;
            }
            catch (Exception ex)
            {
                Console.WriteLine(string.Format("SiteList XML write exception: {0}", ex.Message));
                return string.Empty;
            }
        }
    }
}
