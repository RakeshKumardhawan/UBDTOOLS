import os
import re

# 1. Update RegistryManager.cs
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'r') as f:
    rm_code = f.read()

# Replace Zone 3 catalog block in GetZoneSettingsCatalog()
z3_old_pattern = r'// 3\. ZONE 3: INTERNET \(Zone 3\).*?(?=return catalog;)'

z3_new_block = '''// 3. ZONE 3: INTERNET (Zone 3)
            // Strictly enforce standard Internet Zone security to protect user PC from web exploits
            // ==========================================
            catalog.Add(new ZoneSettingItem(3, "Internet", "CurrentLevel", "Zone Security Level (Custom)", 0, "Sets zone security template to 0 (Custom Level)", "Zone Template"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "Flags", "Zone Capabilities & Flags", 1, "Internet Zone base permissions", "Zone Flags"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1001", "Download signed ActiveX controls", 1, "Prompt for signed ActiveX controls (1 = Prompt)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1004", "Download unsigned ActiveX controls", 3, "Disable unsigned ActiveX controls on Internet (3 = Disable)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1200", "Run ActiveX controls and plug-ins", 0, "Run ActiveX controls and plug-ins", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1201", "Initialize and script ActiveX not marked safe", 3, "Disable scripting of unapproved ActiveX (3 = Disable)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1208", "Allow previously unused ActiveX controls", 3, "Disable unused ActiveX controls without prompt (3 = Disable)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1209", "Scriptlets", 1, "Prompt for Scriptlet execution (1 = Prompt)", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "120A", "Override Antivirus protection for ActiveX", 0, "Video and animation playback support", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1400", "Active scripting (JavaScript Execution)", 0, "Enable JavaScript on Internet websites", "Scripting"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1402", "Scripting of Java applets", 3, "Disable legacy Java applets on Internet (3 = Disable)", "Scripting"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1405", "Script ActiveX controls marked safe", 0, "Run safe ActiveX controls", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1406", "Access data sources across domains", 3, "Disable cross-domain data sources on Internet (3 = Disable)", "Security"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1407", "Allow programmatic clipboard access", 1, "Prompt for clipboard access on Internet (1 = Prompt)", "Clipboard"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1604", "Font download", 0, "Allow web font download", "Downloads"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1607", "Navigate windows and frames across domains", 3, "Disable cross-domain navigation on Internet (3 = Disable)", "Navigation"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1608", "Allow META REFRESH", 0, "Allow page meta refresh", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1609", "Display mixed content (HTTP inside HTTPS)", 1, "Prompt for mixed content on Internet (1 = Prompt)", "Mixed Content"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "160A", "Include local directory path when uploading", 3, "Disable uploading local directory path (3 = Disable)", "Privacy"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1802", "Drag and drop or copy and paste files", 0, "Allow drag and drop files", "Miscellaneous"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1803", "File download", 0, "Allow file downloads on Internet", "Downloads"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1804", "Launching programs and files in an IFRAME", 0, "Allow iframe rendering", "Frames"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1806", "Launching applications and unsafe files", 1, "Prompt before launching unsafe files (1 = Prompt)", "Security"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1809", "Use Pop-up Blocker", 0, "Enable Pop-up Blocker on Internet Zone (0 = On)", "Pop-up Blocker"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1A00", "User Authentication Logon", 0x20000, "Automatic logon only in Intranet zone (0x20000)", "Authentication"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1A04", "Don't prompt for client certificate selection", 3, "Prompt for client certificate if requested (3 = Prompt)", "Certificates"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1E05", "Software channel permissions", 0x20000, "Medium safety software channel permissions", "Security"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2000", "Binary and script behaviors", 0, "Enable binary and script behaviors", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2001", "Run components signed with Authenticode", 0, "Run signed .NET components", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2004", "Run components not signed with Authenticode", 3, "Disable unsigned .NET components (3 = Disable)", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2100", "Open files based on content (MIME Sniffing)", 0, "Open files based on content", "Downloads"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2102", "Script-initiated windows without constraints", 3, "Disable unconstrained script windows (3 = Disable)", "Windows"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2103", "Allow status bar updates via script", 3, "Disable status bar updates via script (3 = Disable)", "Status Bar"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2200", "Automatic prompting for file downloads", 3, "Disable automatic download prompt (3 = Disable)", "Downloads"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2201", "Automatic prompting for ActiveX controls", 0, "Enable automatic prompting for ActiveX", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2301", "Use SmartScreen Filter", 0, "Enable SmartScreen on Internet Zone (0 = On)", "SmartScreen"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "270B", "Only allow approved domains to use ActiveX", 3, "Disable unapproved domain restrictions (3 = Off)", "ActiveX"));
            '''

rm_code = re.sub(z3_old_pattern, z3_new_block, rm_code, count=1, flags=re.DOTALL)

# Ensure Advanced Tab settings & FeatureControl are configured in ConfigureActiveXAndTLS
adv_pattern = r'using \(RegistryKey systemSettings = Registry\.CurrentUser\.CreateSubKey\(@"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"\)\).*?ApplyMasterZonesConfiguration\(\);'
adv_replacement = '''using (RegistryKey systemSettings = Registry.CurrentUser.CreateSubKey(@"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"))
                {
                    if (systemSettings != null)
                    {
                        // TLS 1.0 (128) + TLS 1.1 (512) + TLS 1.2 (2048) + TLS 1.3 (8192) = 10880 (0x2AA0)
                        systemSettings.SetValue("SecureProtocols", 10880, RegistryValueKind.DWord);
                        systemSettings.SetValue("DisableCachingOfSSLPages", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("SyncMode5", 3, RegistryValueKind.DWord);
                        systemSettings.SetValue("CertificateRevocation", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("PublisherRevocation", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("WarnonBadCertRecving", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("WarnOnZoneCrossing", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("WarnOnPostRedirect", 0, RegistryValueKind.DWord);
                        systemSettings.SetValue("AllowInvalidCertificates", 1, RegistryValueKind.DWord);
                        systemSettings.SetValue("CheckExeSignatures", "no", RegistryValueKind.String);
                    }
                }
                using (RegistryKey advHklm = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"))
                {
                    if (advHklm != null)
                    {
                        advHklm.SetValue("SecureProtocols", 10880, RegistryValueKind.DWord);
                        advHklm.SetValue("CertificateRevocation", 0, RegistryValueKind.DWord);
                        advHklm.SetValue("PublisherRevocation", 0, RegistryValueKind.DWord);
                        advHklm.SetValue("WarnonBadCertRecving", 0, RegistryValueKind.DWord);
                    }
                }
                // Allow active content to run in files on My Computer (FEATURE_LOCALMACHINE_LOCKDOWN)
                string[] featHives = new string[] { @"Software\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_LOCALMACHINE_LOCKDOWN", @"SOFTWARE\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_LOCALMACHINE_LOCKDOWN" };
                RegistryKey[] rootList = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
                foreach (var root in rootList)
                {
                    foreach (var fh in featHives)
                    {
                        try
                        {
                            using (var fk = root.CreateSubKey(fh))
                            {
                                if (fk != null)
                                {
                                    fk.SetValue("iexplore.exe", 0, RegistryValueKind.DWord);
                                    fk.SetValue("msedge.exe", 0, RegistryValueKind.DWord);
                                }
                            }
                        }
                        catch { }
                    }
                }
                // Pop-up Blocker disabled in Internet Explorer settings for UBD portal
                try
                {
                    using (var nw = Registry.CurrentUser.CreateSubKey(@"Software\\Microsoft\\Internet Explorer\\New Windows"))
                    {
                        nw?.SetValue("PopupMgr", "no", RegistryValueKind.String);
                    }
                }
                catch { }
                using (RegistryKey ieMain = Registry.CurrentUser.CreateSubKey(@"Software\\Microsoft\\Internet Explorer\\Main"))
                {
                    if (ieMain != null)
                    {
                        ieMain.SetValue("TabProcGrowth", 1, RegistryValueKind.DWord);
                        ieMain.SetValue("DOMStorage", 1, RegistryValueKind.DWord);
                    }
                }
                ApplyMasterZonesConfiguration();'''

rm_code = re.sub(adv_pattern, lambda m: adv_replacement, rm_code, count=1, flags=re.DOTALL)

with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'w') as f:
    f.write(rm_code)
print('RegistryManager.cs updated successfully!')
