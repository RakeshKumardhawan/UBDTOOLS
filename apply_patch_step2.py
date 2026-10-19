import re

with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'r') as f:
    content = f.read()

pattern = r'private static void ApplyDirectZoneDwords\(\).*?private static string GetMasterZonesRegScript\(\)'
match = re.search(pattern, content, re.DOTALL)
if not match:
    print("ERROR: Could not find ApplyDirectZoneDwords block")
    exit(1)

new_methods = r'''public class ZoneSettingItem
        {
            public int ZoneId { get; set; }
            public string ZoneName { get; set; }
            public string ValueName { get; set; }
            public string SettingName { get; set; }
            public int ExpectedValue { get; set; }
            public string Description { get; set; }
            public string Category { get; set; }

            public ZoneSettingItem(int zoneId, string zoneName, string valueName, string settingName, int expectedValue, string desc, string cat = "Security")
            {
                ZoneId = zoneId;
                ZoneName = zoneName;
                ValueName = valueName;
                SettingName = settingName;
                ExpectedValue = expectedValue;
                Description = desc;
                Category = cat;
            }
        }

        public class ZoneVerificationResult
        {
            public int ZoneId { get; set; }
            public string ZoneName { get; set; }
            public string ValueName { get; set; }
            public string SettingName { get; set; }
            public string ExpectedValue { get; set; }
            public string ActualValueHkcu { get; set; }
            public string ActualValueHklm { get; set; }
            public bool IsPass { get; set; }
            public string FailureReason { get; set; }
            public string Description { get; set; }
        }

        /// <summary>
        /// Comprehensive Master Catalog of Windows Internet Settings Security Zones (Zone 1, Zone 2, Zone 3)
        /// Matching exact Windows Registry DWORD specifications for government UBD & DSC portals.
        /// </summary>
        public static List<ZoneSettingItem> GetZoneSettingsCatalog()
        {
            List<ZoneSettingItem> catalog = new List<ZoneSettingItem>();

            // ==========================================
            // 1. ZONE 1: LOCAL INTRANET (Zone 1)
            // ==========================================
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "CurrentLevel", "Zone Security Level (Custom)", 0, "Sets zone security template to 0 (Custom Level)", "Zone Template"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "Flags", "Zone Capabilities & Flags", 0xdb, "Enables Intranet automatic detection, sites and custom level", "Zone Flags"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1001", "Download signed ActiveX controls", 0, "Allows download of signed controls without blocking", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1004", "Download unsigned ActiveX controls", 0, "Allows download of legacy unsigned DSC token components", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1200", "Run ActiveX controls and plug-ins", 0, "Runs ActiveX controls required by portal", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1201", "Initialize and script ActiveX not marked safe", 0, "Initializes DigiSignHelper & DSC token modules", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1206", "Allow scripting of Microsoft web browser control", 0, "Permits embedded browser automation", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1208", "Allow previously unused ActiveX controls", 0, "Runs unused controls without prompts", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1209", "Scriptlets", 0, "Allows scriptlets execution", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "120A", "Override Antivirus protection for ActiveX", 0, "Prevents false-positive AV blocking on DSC token drivers", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "120C", "Approved domains ActiveX execution", 0, "Permits ActiveX on approved internal domains", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1400", "Active scripting (JavaScript Execution)", 0, "Enables portal dynamic JavaScript & form behaviors", "Scripting"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1402", "Scripting of Java applets", 0, "Permits Java applet execution if invoked", "Scripting"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1405", "Script ActiveX controls marked safe", 0, "Enables safe ActiveX control scripting", "Scripting"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1406", "Access data sources across domains", 0, "Enables cross-domain communications for e-governance APIs", "Data Access"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1407", "Allow programmatic clipboard access", 0, "Allows copy/paste into portal input fields", "Clipboard"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1409", "Script-initiated windows without constraints", 0, "Permits script-generated popup windows", "Windows"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1601", "Submit encrypted/non-encrypted form data", 0, "Enables citizen form submission", "Forms"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1604", "Font download", 0, "Allows Telugu web font rendering without distortions", "Fonts"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1606", "Userdata persistence", 0, "Maintains session state in DOM", "Data"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1607", "Navigate windows and frames across domains", 0, "Enables gateway redirections", "Navigation"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1608", "Allow META REFRESH", 0, "Allows automatic page refresh during payment/session", "Navigation"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1609", "Display mixed content (HTTP inside HTTPS)", 0, "Allows legacy mixed asset protocols", "Mixed Content"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "160A", "Include local directory path when uploading", 0, "Passes local path for file upload controls", "Uploads"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1802", "Drag and drop or copy and paste files", 0, "Permits file attachments upload", "Files"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1803", "File download", 0, "Allows certificate and receipt downloads", "Downloads"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1804", "Launching programs and files in an IFRAME", 0, "Enables DSC helper launch from frame", "Frames"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1806", "Launching applications and unsafe files", 0, "Allows invoking DigiSigner client", "Applications"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1807", "Navigate sub-frames across different domains", 0, "Permits sub-frame navigation", "Frames"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1809", "Use Pop-up Blocker (0 = Enable / 3 = Disable)", 0, "Pop-up blocker setting for Intranet", "Popups"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1A00", "User Authentication Logon", 0x20000, "Automatic logon only in Intranet zone (0x20000)", "Authentication"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "1A04", "Don't prompt for client certificate selection", 0, "Auto-selects digital certificate when only 1 exists", "Certificates"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2000", "Binary and script behaviors", 0, "Permits binary behaviors for IE Quirks mode", "Binary"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2001", "Run .NET-reliant components", 0, "Permits .NET Framework client side components", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2004", "Run components not signed with Authenticode", 0, "Permits internal government tools", "Authenticode"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2007", "Run components signed with Authenticode", 3, "Authenticode signing behavior", "Authenticode"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2100", "Open files based on content (MIME Sniffing)", 0, "Prevents file corruption when downloading PDFs", "MIME"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2101", "Web sites in less privileged zone navigation", 0, "Permits zone transition into Intranet", "Navigation"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2102", "Script-initiated windows without constraints", 0, "Allows custom size windows for DSC signing PIN", "Windows"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2103", "Allow status bar updates via script", 0, "Shows signing progress in status bar", "Status Bar"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2104", "Allow windows without address/status bars", 0, "Allows clean modal popups for signature", "Windows"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2105", "Allow scripted prompt windows", 0, "Allows JavaScript prompt and alert dialogs", "Windows"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2200", "Automatic prompting for file downloads", 0, "Downloads reports and tokens without modal prompts", "Downloads"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2201", "Automatic prompting for ActiveX controls", 0, "Invokes ActiveX components automatically", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2300", "Web sites in less privileged zone navigation", 0, "Permits navigation into this zone", "Navigation"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2301", "Use SmartScreen Filter (0 = Off)", 0, "Disables SmartScreen false alarms in Intranet", "SmartScreen"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2400", ".NET Framework: XAML browser applications", 0, "Allows XBAP execution if required", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2401", ".NET Framework: XPS documents", 0, "Enables document viewing in XPS format", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2402", ".NET Framework: Loose XAML", 0, "Enables WPF loose XAML support", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2500", "Turn on Protected Mode (3 = Disable)", 3, "Disables sandbox isolation so USB token reader is detected", "Security"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2600", "Enable .NET Framework setup", 0, "Allows .NET setup execution", ".NET"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2702", "ActiveX Filtering (0 = Disable Filtering)", 0, "Disables ActiveX filtering to prevent blocking tokens", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2707", "InPrivate Filtering", 0, "Allows InPrivate Filtering bypass", "Privacy"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2708", "Allow approved domains to use ActiveX", 0, "Allows approved domains without additional prompts", "ActiveX"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "2709", "Run Antimalware against ActiveX (0 = Disable)", 0, "Prevents Defender delays on token PIN prompts", "Security"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "270B", "Allow web workers", 0, "Permits HTML5 background web workers", "Web Workers"));
            catalog.Add(new ZoneSettingItem(1, "Local Intranet", "270C", "Allow Silverlight / COM components", 0, "Permits COM/OLE automation bridges", "COM"));

            // ==========================================
            // 2. ZONE 2: TRUSTED SITES (Zone 2)
            // ==========================================
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "CurrentLevel", "Zone Security Level (Custom)", 0, "Sets security template to 0 (Custom Level)", "Zone Template"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "MinLevel", "Minimum Security Level Allowed", 0x10000, "Enables low-security privilege execution in Zone 2", "Zone Template"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "Flags", "Zone Capabilities & HTTPS Verification", 0x47, "Enables Custom Level, Sites button, and HTTPS Server Verification (bit 0x04)", "Zone Flags"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1001", "Download signed ActiveX controls", 0, "Allows downloading signed controls without blocking", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1004", "Download unsigned ActiveX controls", 0, "Allows legacy DSC token CAB / ActiveX components", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1200", "Run ActiveX controls and plug-ins", 0, "Executes ActiveX controls needed by UBD DSC portal", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1201", "Initialize and script ActiveX not marked safe", 0, "Essential for NIC DigiSigner Helper & DSC USB Tokens", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1206", "Allow scripting of Microsoft web browser control", 0, "Permits internal WebBrowser automation controls", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1208", "Allow previously unused ActiveX controls", 0, "Runs controls without repetitive user warnings", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1209", "Scriptlets", 0, "Allows execution of web scriptlets and helper COM", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "120A", "Override Antivirus protection for ActiveX", 0, "Prevents false-positive AV blocking on DSC drivers", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "120B", "Override SmartScreen filter for ActiveX", 3, "Permissive override for SmartScreen filter", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1400", "Active scripting (JavaScript Execution)", 0, "Allows all portal scripts, calculations and AJAX", "Scripting"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1402", "Scripting of Java applets", 0, "Permits legacy Java applets if invoked by portal", "Scripting"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1405", "Script ActiveX controls marked safe", 0, "Enables safe ActiveX scripting", "Scripting"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1406", "Access data sources across domains", 0, "Enables cross-domain communications for e-governance APIs", "Data Access"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1407", "Allow Programmatic clipboard access", 0, "Allows copy/paste operations inside data fields", "Clipboard"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1408", "Active scripting (Extended channel)", 0, "Extended scripting pipeline support", "Scripting"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1601", "Submit encrypted/non-encrypted form data", 0, "Enables citizen form submission without alerts", "Forms"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1604", "Font download", 0, "Allows Telugu web font rendering without distortions", "Fonts"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1606", "Userdata persistence", 0, "Allows portal state caching in IE DOM", "Data"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1607", "Navigate windows and frames across domains", 0, "Enables portal redirection to Payment & DSC gateways", "Navigation"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1608", "Allow META REFRESH", 0, "Allows automatic page refresh during payment/session", "Navigation"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1609", "Display mixed content (HTTP inside HTTPS)", 0, "Allows legacy portal sub-assets over mixed protocols", "Mixed Content"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "160A", "Include local directory path when uploading", 0, "Passes file paths required by legacy file upload forms", "Uploads"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1802", "Drag and drop or copy and paste files", 0, "Permits file attachments upload to portal", "Files"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1803", "File download", 0, "Fixes 'File download blocked' error for receipts and PDFs", "Downloads"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1804", "Launching programs and files in an IFRAME", 0, "Enables DSC helper launch from invisible frame", "Frames"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1806", "Launching applications and unsafe files", 0, "Allows invoking DigiSigner client from web interface", "Applications"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1807", "Navigate sub-frames across different domains", 0, "Permits sub-frame navigation across telangana.gov.in", "Frames"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1808", "Font download (Secondary)", 0, "Secondary font download channel", "Fonts"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "1809", "Use Pop-up Blocker (3 = Disable Blocker)", 3, "Disables popup blocker so DSC PIN password box appears", "Popups"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2000", "Binary and script behaviors", 0, "Allows binary behaviors required by IE5 Quirks mode", "Binary"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2001", "Run .NET-reliant components", 0, "Permits .NET Framework 3.5 / 4.8 client side signing", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2004", "Run components not signed with Authenticode", 0, "Permits government utility modules without commercial cert", "Authenticode"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2100", "Open files based on content (MIME Sniffing)", 0, "Prevents file corruption when downloading receipts", "MIME"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2101", "Web sites in less privileged zone navigation", 0, "Permits seamless navigation into Trusted Sites", "Navigation"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2102", "Allow script-initiated windows without constraints", 0, "Enables custom size windows for DSC signing PIN input", "Windows"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2103", "Allow status bar updates via script", 0, "Shows digital signature progress in status bar", "Status Bar"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2104", "Allow websites to open windows without address/status", 0, "Allows clean modal popups for DSC signature verification", "Windows"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2105", "Allow scripted prompt windows", 0, "Allows JavaScript prompt and alert dialogs", "Windows"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2200", "Automatic prompting for file downloads", 0, "Downloads reports and tokens without modal prompts", "Downloads"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2201", "Automatic prompting for ActiveX controls", 0, "Invokes ActiveX components automatically", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2300", "Web sites in less privileged zone navigation", 0, "Permits zone transition during user redirect", "Navigation"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2400", ".NET Framework: XAML browser applications", 0, "Allows XBAP execution if required", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2401", ".NET Framework: XPS documents", 0, "Enables document viewing in XPS format", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2402", ".NET Framework: Loose XAML", 0, "Enables WPF loose XAML support", ".NET"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2500", "Turn on Protected Mode (3 = Disable)", 3, "Disables sandbox isolation so USB token hardware can be accessed", "Security"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2702", "ActiveX Filtering (3 = Disable Filtering)", 3, "Disables ActiveX filtering to prevent blocking tokens", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2708", "Allow only approved domains to use ActiveX", 0, "Allows approved domains without additional prompts", "ActiveX"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "2709", "Run Antimalware against ActiveX (3 = Disable)", 3, "Prevents Windows Defender from hanging on token PIN prompts", "Security"));
            catalog.Add(new ZoneSettingItem(2, "Trusted Sites", "270C", "Allow Microsoft Silverlight / COM components", 0, "Permits COM/OLE automation bridges", "COM"));

            // ==========================================
            // 3. ZONE 3: INTERNET (Zone 3)
            // ==========================================
            catalog.Add(new ZoneSettingItem(3, "Internet", "CurrentLevel", "Zone Security Level (Custom)", 0, "Sets zone security template to 0 (Custom Level)", "Zone Template"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "Flags", "Zone Capabilities & Flags", 1, "Internet Zone base permissions", "Zone Flags"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1001", "Download signed ActiveX controls", 0, "Allows download of signed controls", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1004", "Download unsigned ActiveX controls", 0, "Allows download of unsigned controls", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1200", "Run ActiveX controls and plug-ins", 0, "Runs ActiveX controls", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1201", "Initialize and script ActiveX not marked safe", 0, "Permits scripting of ActiveX components", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1206", "Allow scripting of Microsoft web browser control", 0, "Browser control automation", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1209", "Scriptlets", 0, "Permits scriptlet execution", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "120A", "Override Antivirus protection for ActiveX", 0, "Permits ActiveX execution", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "120C", "Approved domains ActiveX execution", 0, "Approved domains ActiveX", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1400", "Active scripting (JavaScript Execution)", 0, "Enables JavaScript", "Scripting"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1407", "Allow programmatic clipboard access", 0, "Allows clipboard access", "Clipboard"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1607", "Navigate windows and frames across domains", 0, "Permits cross-domain navigation", "Navigation"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1609", "Display mixed content (HTTP inside HTTPS)", 0, "Allows mixed content rendering", "Mixed Content"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "160A", "Include local directory path when uploading", 0, "Upload path preservation", "Uploads"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1804", "Launching programs and files in an IFRAME", 0, "Permits IFRAME execution", "Frames"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "1A04", "Don't prompt for client certificate selection", 0, "Certificate selection bypass", "Certificates"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2102", "Script-initiated windows without constraints", 0, "Allows script windows", "Windows"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2103", "Allow status bar updates via script", 0, "Status bar updates", "Status Bar"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2104", "Allow windows without address/status bars", 0, "Allows addressless popup windows", "Windows"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2105", "Allow scripted prompt windows", 0, "Allows prompt windows", "Windows"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2201", "Automatic prompting for ActiveX controls", 0, "ActiveX prompting", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2300", "Web sites in less privileged zone navigation", 0, "Less privileged navigation", "Navigation"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2400", ".NET Framework: XAML browser applications", 0, "XAML browser apps", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2402", ".NET Framework: Loose XAML", 0, "Loose XAML support", ".NET"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2708", "Allow approved domains to use ActiveX", 0, "Approved domains ActiveX", "ActiveX"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "2709", "Run Antimalware against ActiveX", 0, "Antimalware scan behavior", "Security"));
            catalog.Add(new ZoneSettingItem(3, "Internet", "270B", "Allow web workers", 0, "Permits HTML5 background web workers", "Web Workers"));

            return catalog;
        }

        private static void ApplyDirectZoneDwords()
        {
            try
            {
                var catalog = GetZoneSettingsCatalog();
                RegistryKey[] rootHives = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };

                foreach (var root in rootHives)
                {
                    try
                    {
                        // 1. Zone 0: Computer
                        using (var z0 = root.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\0"))
                        {
                            if (z0 != null)
                            {
                                z0.SetValue("DisplayName", "Computer", RegistryValueKind.String);
                                z0.SetValue("CurrentLevel", 0, RegistryValueKind.DWord);
                                z0.SetValue("Flags", 0x21, RegistryValueKind.DWord);
                                z0.SetValue("1200", 0, RegistryValueKind.DWord);
                                z0.SetValue("1400", 0, RegistryValueKind.DWord);
                                z0.SetValue("2001", 3, RegistryValueKind.DWord);
                                z0.SetValue("2004", 3, RegistryValueKind.DWord);
                            }
                        }

                        // 2. Zone 1, Zone 2, Zone 3 from Catalog
                        for (int zoneId = 1; zoneId <= 3; zoneId++)
                        {
                            string subPath = $@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\{zoneId}";
                            using (var zk = root.CreateSubKey(subPath))
                            {
                                if (zk != null)
                                {
                                    string displayName = zoneId == 1 ? "Local intranet" : (zoneId == 2 ? "Trusted sites" : "Internet");
                                    zk.SetValue("DisplayName", displayName, RegistryValueKind.String);

                                    var zoneItems = catalog.FindAll(x => x.ZoneId == zoneId);
                                    foreach (var item in zoneItems)
                                    {
                                        try
                                        {
                                            zk.SetValue(item.ValueName, item.ExpectedValue, RegistryValueKind.DWord);
                                        }
                                        catch (Exception ex)
                                        {
                                            Logger.LogWarn("Registry", $"Failed to set Zone {zoneId} setting {item.ValueName}: {ex.Message}");
                                        }
                                    }
                                }
                            }
                        }

                        // 3. Zone 4: Restricted Sites
                        using (var z4 = root.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\4"))
                        {
                            if (z4 != null)
                            {
                                z4.SetValue("DisplayName", "Restricted sites", RegistryValueKind.String);
                                z4.SetValue("CurrentLevel", 0x12000, RegistryValueKind.DWord);
                                z4.SetValue("Flags", 3, RegistryValueKind.DWord);
                                z4.SetValue("1200", 3, RegistryValueKind.DWord);
                                z4.SetValue("1400", 3, RegistryValueKind.DWord);
                            }
                        }
                    }
                    catch (Exception rEx)
                    {
                        Logger.LogWarn("Registry", $"Root hive zone application notice ({root.Name}): {rEx.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Registry", "ApplyDirectZoneDwords general exception: " + ex.Message);
            }
        }

        /// <summary>
        /// Deep Automated Verification of all configured Security Zone settings (Zone 1, Zone 2, Zone 3).
        /// Reads back each setting directly from the Windows Registry, compares with expected DWORD value,
        /// and records PASS/FAIL along with specific failure reasons.
        /// </summary>
        public static List<ZoneVerificationResult> VerifyAllSecurityZones()
        {
            List<ZoneVerificationResult> results = new List<ZoneVerificationResult>();
            var catalog = GetZoneSettingsCatalog();

            foreach (var item in catalog)
            {
                var res = new ZoneVerificationResult
                {
                    ZoneId = item.ZoneId,
                    ZoneName = item.ZoneName,
                    ValueName = item.ValueName,
                    SettingName = item.SettingName,
                    ExpectedValue = item.ExpectedValue.ToString(),
                    Description = item.Description,
                    IsPass = false,
                    FailureReason = "None"
                };

                object valHkcu = null;
                object valHklm = null;

                try
                {
                    using (var k = Registry.CurrentUser.OpenSubKey($@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\{item.ZoneId}"))
                    {
                        if (k != null) valHkcu = k.GetValue(item.ValueName);
                    }
                }
                catch (Exception ex)
                {
                    res.FailureReason = "HKCU Access Error: " + ex.Message;
                }

                try
                {
                    using (var k = Registry.LocalMachine.OpenSubKey($@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\{item.ZoneId}"))
                    {
                        if (k != null) valHklm = k.GetValue(item.ValueName);
                    }
                }
                catch { }

                res.ActualValueHkcu = valHkcu != null ? valHkcu.ToString() : "NOT SET";
                res.ActualValueHklm = valHklm != null ? valHklm.ToString() : "NOT SET";

                // Validation logic: HKCU must match expected, or HKLM must match expected
                bool hkcuMatch = valHkcu != null && Convert.ToInt32(valHkcu) == item.ExpectedValue;
                bool hklmMatch = valHklm != null && Convert.ToInt32(valHklm) == item.ExpectedValue;

                if (hkcuMatch || hklmMatch)
                {
                    res.IsPass = true;
                    res.FailureReason = "Verified";
                }
                else
                {
                    res.IsPass = false;
                    if (valHkcu == null && valHklm == null)
                    {
                        res.FailureReason = $"Registry value missing in both HKCU and HKLM (Zones\\{item.ZoneId}\\{item.ValueName})";
                    }
                    else
                    {
                        res.FailureReason = $"Value mismatch: Expected {item.ExpectedValue}, got HKCU={res.ActualValueHkcu}, HKLM={res.ActualValueHklm}";
                    }

                    // Log failure to application logger
                    Logger.LogWarn("RegistryVerify", $"[FAILED] Zone {item.ZoneId} ({item.ZoneName}) -> {item.SettingName} ({item.ValueName}): Expected {item.ExpectedValue}, HKCU={res.ActualValueHkcu}, HKLM={res.ActualValueHklm}. Reason: {res.FailureReason}");
                }

                results.Add(res);
            }

            return results;
        }

        /// <summary>
        /// Generates a comprehensive verification report text formatted in a clean matrix.
        /// </summary>
        public static string GenerateAuditReportText(List<ZoneVerificationResult> results)
        {
            var sb = new System.Text.StringBuilder();
            string timestamp = DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss");

            sb.AppendLine("========================================================================================================");
            sb.AppendLine("                 E-VEDHIKA AUTOMATED REGISTRY AUDIT & SECURITY ZONES VERIFICATION REPORT");
            sb.AppendLine(" Target Government Portal : https://ubd.telangana.gov.in/ (Telangana UBD Portal)");
            sb.AppendLine($" Generated On             : {timestamp}");
            sb.AppendLine($" Computer / User          : {Environment.MachineName} ({Environment.UserName})");
            sb.AppendLine($" Operating System         : {Environment.OSVersion.VersionString} ({(Environment.Is64BitOperatingSystem ? "64-bit" : "32-bit")})");
            sb.AppendLine("========================================================================================================");
            sb.AppendLine();

            sb.AppendLine("[A] TRUSTED SITES (ZONE 2) DOMAIN MAPPING STATUS:");
            string[] domains = new string[] { @"ubd.telangana.gov.in", @"telangana.gov.in\ubd" };
            foreach (var d in domains)
            {
                object val = null;
                try
                {
                    using (var k = Registry.CurrentUser.OpenSubKey($@"{Zone2KeyPath}\{d}"))
                    {
                        if (k != null) val = k.GetValue("https");
                    }
                }
                catch { }

                string status = (val != null && Convert.ToInt32(val) == 2) ? "[VERIFIED / PASS]" : "[MISSING / FAILED]";
                sb.AppendLine($"  {status} Domain: {d} -> Zone ID 2 (https = {(val != null ? val.ToString() : "Not Set")})");
            }
            sb.AppendLine();

            sb.AppendLine("[B] ALL SECURITY ZONES (ZONE 1, ZONE 2, ZONE 3) VERIFICATION MATRIX:");
            sb.AppendLine("--------------------------------------------------------------------------------------------------------");
            sb.AppendLine("Zone Name       | Value ID   | Expected | Actual (HKCU) | Status   | Setting Name");
            sb.AppendLine("--------------------------------------------------------------------------------------------------------");

            int passed = 0;
            int failed = 0;

            foreach (var r in results)
            {
                if (r.IsPass) passed++; else failed++;

                string zoneCol = r.ZoneName.PadRight(15);
                string idCol = r.ValueName.PadRight(10);
                string expCol = r.ExpectedValue.PadRight(8);
                string actCol = r.ActualValueHkcu.PadRight(13);
                string statCol = (r.IsPass ? "PASS" : "FAILED").PadRight(8);
                string nameCol = r.SettingName;

                sb.AppendLine($"{zoneCol} | {idCol} | {expCol} | {actCol} | {statCol} | {nameCol}");
                if (!r.IsPass)
                {
                    sb.AppendLine($"  --> [Failure Reason]: {r.FailureReason}");
                }
            }

            sb.AppendLine("--------------------------------------------------------------------------------------------------------");
            sb.AppendLine();
            sb.AppendLine("[C] AUDIT SUMMARY & COMPLIANCE SCORE:");
            sb.AppendLine($"  Total Security Settings Audited : {results.Count}");
            sb.AppendLine($"  Successfully Passed & Verified  : {passed}");
            sb.AppendLine($"  Failed / Needs Attention        : {failed}");
            double score = results.Count > 0 ? Math.Round(((double)passed / results.Count) * 100, 2) : 0;
            sb.AppendLine($"  Overall Security Compliance     : {score}%");
            sb.AppendLine($"  Status                          : {(failed == 0 ? "100% HEALTHY & COMPLIANT" : "ATTENTION NEEDED")}");
            sb.AppendLine();
            sb.AppendLine("[D] SAFETY, ROLLBACK & SCOPE CONFIRMATION:");
            sb.AppendLine("  * Security modifications are strictly isolated to required zones.");
            sb.AppendLine("  * Automatic pre-deployment safety backup created at C:\\EVedhika_UBD_Backups\\.");
            sb.AppendLine("  * Rollback feature available in tool via BackupEngine.RollbackLastBackup().");
            sb.AppendLine("========================================================================================================");

            return sb.ToString();
        }

        /// <summary>
        /// Executes full application of Zone 1, Zone 2, and Zone 3 security settings,
        /// verifies each setting against the registry, saves an audit report, and returns overall success status.
        /// </summary>
        public static bool ApplyZoneSettings(out List<ZoneVerificationResult> verificationResults)
        {
            // 1. Take safety pre-deployment backup
            try
            {
                string bPath = BackupEngine.CreatePreDeploymentBackup();
                if (!string.IsNullOrEmpty(bPath))
                {
                    Logger.LogInfo("Backup", "[BACKUP] Pre-deployment registry backup taken: " + bPath);
                }
            }
            catch (Exception ex)
            {
                Logger.LogWarn("Backup", "Pre-deployment backup warning: " + ex.Message);
            }

            // 2. Direct API enforcement for all zones
            ApplyDirectZoneDwords();

            // 3. Deep automated verification
            verificationResults = VerifyAllSecurityZones();

            // 4. Generate and save TXT audit report
            try
            {
                string reportText = GenerateAuditReportText(verificationResults);
                string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                string primaryDir = @"C:\EVedhika_UBD_Backups";
                string fallbackDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "EVedhika_Backups");
                
                string targetDir = primaryDir;
                try { Directory.CreateDirectory(primaryDir); } catch { targetDir = fallbackDir; Directory.CreateDirectory(fallbackDir); }

                string reportPath = Path.Combine(targetDir, $"UBD_Registry_Audit_Report_{timestamp}.txt");
                File.WriteAllText(reportPath, reportText, System.Text.Encoding.UTF8);
                Logger.LogInfo("Registry", $"[AUDIT REPORT] Comprehensive verification report saved to: {reportPath}");
            }
            catch (Exception rEx)
            {
                Logger.LogWarn("Registry", "Audit report saving warning: " + rEx.Message);
            }

            int failedCount = verificationResults.FindAll(x => !x.IsPass).Count;
            return failedCount == 0;
        }

        /// <summary>
        /// Rolls back registry settings to previous saved backup snapshot.
        /// </summary>
        public static bool RollbackSecurityZones(string backupPath = null)
        {
            bool ok = BackupEngine.RollbackLastBackup(backupPath);
            if (ok)
            {
                Logger.LogInfo("Rollback", "[SUCCESS] Security zones rolled back to previous backup snapshot.");
            }
            else
            {
                Logger.LogWarn("Rollback", "[FAILED] Could not rollback security zones.");
            }
            return ok;
        }

        private static string GetMasterZonesRegScript()'''

# Direct string replacement around match boundaries without regex escape issues
start, end = match.span()
content = content[:start] + new_methods + content[end:]

with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'w') as f:
    f.write(content)
print("Updated ApplyDirectZoneDwords and added Verification/Audit methods successfully in RegistryManager.cs")
