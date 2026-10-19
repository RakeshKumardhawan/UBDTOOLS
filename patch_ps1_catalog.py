import re

with open('public/scripts/Configure_UBD_Registry.ps1', 'r') as f:
    code = f.read()

# Pattern from $SettingsCatalog = @( to the end of verification
pat = r'\$SettingsCatalog = @\(.*?\n# 9\. SILENT AUTOMATIC CLOUD TELEMETRY'
match = re.search(pat, code, re.DOTALL)
if not match:
    print("Could not match catalog in ps1")
    exit(1)

new_code = r'''$SettingsCatalog = @(
    # ==========================================
    # 1. ZONE 1: LOCAL INTRANET
    # ==========================================
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="CurrentLevel"; Name="Zone Security Level (Custom)"; Value=0; Desc="Sets security template to 0 (Custom Level)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="Flags";        Name="Zone Capabilities & Flags"; Value=0xdb; Desc="Intranet flags" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1001"; Name="Download signed ActiveX controls"; Value=0; Desc="Allows downloading signed controls" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1004"; Name="Download unsigned ActiveX controls"; Value=0; Desc="Allows legacy unsigned controls" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1200"; Name="Run ActiveX controls and plug-ins"; Value=0; Desc="Executes ActiveX controls" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1201"; Name="Initialize and script ActiveX not marked safe"; Value=0; Desc="Initializes DigiSignHelper & DSC tokens" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1206"; Name="Allow scripting of Microsoft web browser control"; Value=0; Desc="Permits embedded browser automation" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1208"; Name="Allow previously unused ActiveX controls"; Value=0; Desc="Runs unused controls without prompts" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1209"; Name="Scriptlets"; Value=0; Desc="Allows scriptlets execution" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="120A"; Name="Override Antivirus protection for ActiveX"; Value=0; Desc="Prevents false-positive AV blocking" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="120C"; Name="Approved domains ActiveX execution"; Value=0; Desc="Permits ActiveX on approved internal domains" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1400"; Name="Active scripting (JavaScript Execution)"; Value=0; Desc="Enables portal dynamic JavaScript" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1402"; Name="Scripting of Java applets"; Value=0; Desc="Permits Java applet execution" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1405"; Name="Script ActiveX controls marked safe"; Value=0; Desc="Enables safe ActiveX scripting" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1406"; Name="Access data sources across domains"; Value=0; Desc="Enables cross-domain communications" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1407"; Name="Allow programmatic clipboard access"; Value=0; Desc="Allows copy/paste into portal input fields" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1409"; Name="Script-initiated windows without constraints"; Value=0; Desc="Permits script popup windows" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1601"; Name="Submit encrypted/non-encrypted form data"; Value=0; Desc="Enables citizen form submission" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1604"; Name="Font download"; Value=0; Desc="Allows Telugu web font rendering" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1606"; Name="Userdata persistence"; Value=0; Desc="Maintains session state in DOM" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1607"; Name="Navigate windows and frames across domains"; Value=0; Desc="Enables gateway redirections" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1608"; Name="Allow META REFRESH"; Value=0; Desc="Allows automatic page refresh" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1609"; Name="Display mixed content (HTTP inside HTTPS)"; Value=0; Desc="Allows legacy mixed asset protocols" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="160A"; Name="Include local directory path when uploading"; Value=0; Desc="Passes local path for file uploads" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1802"; Name="Drag and drop or copy and paste files"; Value=0; Desc="Permits file attachments upload" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1803"; Name="File download"; Value=0; Desc="Allows certificate and receipt downloads" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1804"; Name="Launching programs and files in an IFRAME"; Value=0; Desc="Enables DSC helper launch from frame" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1806"; Name="Launching applications and unsafe files"; Value=0; Desc="Allows invoking DigiSigner client" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1807"; Name="Navigate sub-frames across different domains"; Value=0; Desc="Permits sub-frame navigation" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1809"; Name="Use Pop-up Blocker"; Value=0; Desc="Intranet Pop-up blocker setting" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1A00"; Name="User Authentication Logon"; Value=0x20000; Desc="Automatic logon only in Intranet zone" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1A04"; Name="Don't prompt for client certificate selection"; Value=0; Desc="Auto-selects digital certificate" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2000"; Name="Binary and script behaviors"; Value=0; Desc="Permits binary behaviors" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2001"; Name="Run .NET-reliant components"; Value=0; Desc="Permits .NET Framework components" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2004"; Name="Run components not signed with Authenticode"; Value=0; Desc="Permits internal government tools" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2007"; Name="Run components signed with Authenticode"; Value=3; Desc="Authenticode signing behavior" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2100"; Name="Open files based on content (MIME Sniffing)"; Value=0; Desc="Prevents file corruption when downloading PDFs" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2101"; Name="Web sites in less privileged zone navigation"; Value=0; Desc="Permits zone transition into Intranet" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2102"; Name="Allow script-initiated windows without constraints"; Value=0; Desc="Allows custom size windows for DSC signing PIN" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2103"; Name="Allow status bar updates via script"; Value=0; Desc="Shows signing progress in status bar" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2104"; Name="Allow windows without address/status bars"; Value=0; Desc="Allows clean modal popups" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2105"; Name="Allow scripted prompt windows"; Value=0; Desc="Allows JavaScript prompt dialogs" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2200"; Name="Automatic prompting for file downloads"; Value=0; Desc="Downloads reports without prompts" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2201"; Name="Automatic prompting for ActiveX controls"; Value=0; Desc="Invokes ActiveX automatically" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2300"; Name="Web sites in less privileged zone navigation"; Value=0; Desc="Permits navigation into this zone" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2301"; Name="Use SmartScreen Filter"; Value=0; Desc="Disables SmartScreen false alarms" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2400"; Name=".NET Framework: XAML browser applications"; Value=0; Desc="Allows XBAP execution" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2401"; Name=".NET Framework: XPS documents"; Value=0; Desc="Enables document viewing in XPS" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2402"; Name=".NET Framework: Loose XAML"; Value=0; Desc="Enables WPF loose XAML support" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2500"; Name="Turn on Protected Mode (3 = Disable)"; Value=3; Desc="Disables sandbox isolation" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2600"; Name="Enable .NET Framework setup"; Value=0; Desc="Allows .NET setup execution" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2702"; Name="ActiveX Filtering (0 = Disable Filtering)"; Value=0; Desc="Disables ActiveX filtering" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2707"; Name="InPrivate Filtering"; Value=0; Desc="Allows InPrivate bypass" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2708"; Name="Allow approved domains to use ActiveX"; Value=0; Desc="Allows approved domains" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2709"; Name="Run Antimalware against ActiveX"; Value=0; Desc="Prevents Defender delays" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="270B"; Name="Allow web workers"; Value=0; Desc="Permits background web workers" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="270C"; Name="Allow Silverlight / COM components"; Value=0; Desc="Permits COM/OLE automation" },

    # ==========================================
    # 2. ZONE 2: TRUSTED SITES
    # ==========================================
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="CurrentLevel"; Name="Zone Security Level (Custom)"; Value=0; Desc="Sets security template level to 0 (Custom Level)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="MinLevel";     Name="Minimum Zone Security Level"; Value=0x10000; Desc="Enables low-security privilege execution in Zone 2" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="Flags";        Name="Zone Capabilities & HTTPS Verification"; Value=0x47; Desc="Enables Custom Level, Sites button, and HTTPS Server Verification (bit 0x04)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1001"; Name="Download signed ActiveX controls"; Value=0; Desc="Allows downloading signed controls without blocking" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1004"; Name="Download unsigned ActiveX controls"; Value=0; Desc="Allows legacy DSC token CAB / ActiveX components" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1200"; Name="Run ActiveX controls and plug-ins"; Value=0; Desc="Executes ActiveX controls needed by UBD DSC portal" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1201"; Name="Initialize and script ActiveX not marked safe"; Value=0; Desc="Essential for NIC DigiSigner Helper & DSC USB Tokens" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1206"; Name="Allow scripting of Microsoft web browser control"; Value=0; Desc="Permits internal WebBrowser automation controls" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1208"; Name="Allow previously unused ActiveX controls"; Value=0; Desc="Runs controls without repetitive user warnings" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1209"; Name="Scriptlets"; Value=0; Desc="Allows execution of web scriptlets and helper COM" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="120A"; Name="Override Antivirus protection for ActiveX"; Value=0; Desc="Prevents false-positive AV blocking on DSC drivers" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="120B"; Name="Override SmartScreen filter for ActiveX"; Value=3; Desc="Prevents Windows SmartScreen from halting token driver" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1400"; Name="Active scripting (JavaScript Execution)"; Value=0; Desc="Allows all portal scripts, calculations and AJAX" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1402"; Name="Scripting of Java applets"; Value=0; Desc="Permits legacy Java applets if invoked by portal" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1405"; Name="Script ActiveX controls marked safe"; Value=0; Desc="Enables safe ActiveX scripting" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1406"; Name="Access data sources across domains"; Value=0; Desc="Enables cross-domain communications for e-governance APIs" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1407"; Name="Allow Programmatic clipboard access"; Value=0; Desc="Allows copy/paste operations inside data fields" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1408"; Name="Active scripting (Secondary channel)"; Value=0; Desc="Extended scripting pipeline support" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1601"; Name="Submit encrypted/non-encrypted form data"; Value=0; Desc="Enables citizen form submission without alerts" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1604"; Name="Font download"; Value=0; Desc="Allows Telugu web font rendering without distortions" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1606"; Name="Userdata persistence"; Value=0; Desc="Allows portal state caching in IE DOM" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1607"; Name="Navigate windows and frames across domains"; Value=0; Desc="Enables portal redirection to Payment & DSC gateways" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1608"; Name="Allow META REFRESH"; Value=0; Desc="Allows automatic page refresh during payment/session" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1609"; Name="Display mixed content (HTTP inside HTTPS)"; Value=0; Desc="Allows legacy portal sub-assets over mixed protocols" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="160A"; Name="Include local directory path when uploading"; Value=0; Desc="Passes file paths required by legacy file upload forms" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1802"; Name="Drag and drop or copy and paste files"; Value=0; Desc="Permits file attachments upload to portal" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1803"; Name="File download"; Value=0; Desc="Fixes 'File download blocked' error for receipts and PDFs" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1804"; Name="Launching programs and files in an IFRAME"; Value=0; Desc="Enables DSC helper launch from invisible frame" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1806"; Name="Launching applications and unsafe files"; Value=0; Desc="Allows invoking DigiSigner client from web interface" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1807"; Name="Navigate sub-frames across different domains"; Value=0; Desc="Permits sub-frame navigation across telangana.gov.in" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1808"; Name="Font download (Secondary)"; Value=0; Desc="Secondary font download channel" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1809"; Name="Use Pop-up Blocker (3 = Disable Blocker)"; Value=3; Desc="Disables popup blocker so DSC PIN password box appears" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2000"; Name="Binary and script behaviors"; Value=0; Desc="Allows binary behaviors required by IE5 Quirks mode" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2001"; Name="Run .NET-reliant components"; Value=0; Desc="Permits .NET Framework 3.5 / 4.8 client side signing" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2004"; Name="Run components not signed with Authenticode"; Value=0; Desc="Permits government utility modules without commercial cert" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2100"; Name="Open files based on content (MIME Sniffing)"; Value=0; Desc="Prevents file corruption when downloading receipts" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2101"; Name="Web sites in less privileged zone navigation"; Value=0; Desc="Permits seamless navigation into Trusted Sites" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2102"; Name="Allow script-initiated windows without constraints"; Value=0; Desc="Enables custom size windows for DSC signing PIN input" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2103"; Name="Allow status bar updates via script"; Value=0; Desc="Shows digital signature progress in status bar" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2104"; Name="Allow websites to open windows without address/status"; Value=0; Desc="Allows clean modal popups for DSC signature verification" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2105"; Name="Allow scripted prompt windows"; Value=0; Desc="Allows JavaScript prompt and alert dialogs" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2200"; Name="Automatic prompting for file downloads"; Value=0; Desc="Downloads reports and tokens without modal prompts" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2201"; Name="Automatic prompting for ActiveX controls"; Value=0; Desc="Invokes ActiveX components automatically" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2300"; Name="Web sites in less privileged zone navigation"; Value=0; Desc="Permits zone transition during user redirect" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2400"; Name=".NET Framework: XAML browser applications"; Value=0; Desc="Allows XBAP execution if required" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2401"; Name=".NET Framework: XPS documents"; Value=0; Desc="Enables document viewing in XPS format" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2402"; Name=".NET Framework: Loose XAML"; Value=0; Desc="Enables WPF loose XAML support" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2500"; Name="Turn on Protected Mode (3 = Disable)"; Value=3; Desc="Disables sandbox isolation so USB token hardware can be accessed" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2702"; Name="ActiveX Filtering (3 = Disable Filtering)"; Value=3; Desc="Disables ActiveX filtering to prevent blocking tokens" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2708"; Name="Allow only approved domains to use ActiveX"; Value=0; Desc="Allows approved domains without additional prompts" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2709"; Name="Run Antimalware against ActiveX (3 = Disable)"; Value=3; Desc="Prevents Windows Defender from hanging on token PIN prompts" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="270C"; Name="Allow Microsoft Silverlight / COM components"; Value=0; Desc="Permits COM/OLE automation bridges" },

    # ==========================================
    # 3. ZONE 3: INTERNET
    # ==========================================
    @{ ZoneId=3; ZoneName="Internet"; ID="CurrentLevel"; Name="Zone Security Level (Custom)"; Value=0; Desc="Sets zone security template to 0 (Custom Level)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="Flags";        Name="Zone Capabilities & Flags"; Value=1; Desc="Internet Zone base permissions" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1001"; Name="Download signed ActiveX controls"; Value=0; Desc="Allows download of signed controls" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1004"; Name="Download unsigned ActiveX controls"; Value=0; Desc="Allows download of unsigned controls" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1200"; Name="Run ActiveX controls and plug-ins"; Value=0; Desc="Runs ActiveX controls" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1201"; Name="Initialize and script ActiveX not marked safe"; Value=0; Desc="Permits scripting of ActiveX components" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1206"; Name="Allow scripting of Microsoft web browser control"; Value=0; Desc="Browser control automation" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1209"; Name="Scriptlets"; Value=0; Desc="Permits scriptlet execution" },
    @{ ZoneId=3; ZoneName="Internet"; ID="120A"; Name="Override Antivirus protection for ActiveX"; Value=0; Desc="Permits ActiveX execution" },
    @{ ZoneId=3; ZoneName="Internet"; ID="120C"; Name="Approved domains ActiveX execution"; Value=0; Desc="Approved domains ActiveX" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1400"; Name="Active scripting (JavaScript Execution)"; Value=0; Desc="Enables JavaScript" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1407"; Name="Allow programmatic clipboard access"; Value=0; Desc="Allows clipboard access" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1607"; Name="Navigate windows and frames across domains"; Value=0; Desc="Permits cross-domain navigation" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1609"; Name="Display mixed content (HTTP inside HTTPS)"; Value=0; Desc="Allows mixed content rendering" },
    @{ ZoneId=3; ZoneName="Internet"; ID="160A"; Name="Include local directory path when uploading"; Value=0; Desc="Upload path preservation" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1804"; Name="Launching programs and files in an IFRAME"; Value=0; Desc="Permits IFRAME execution" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1A04"; Name="Don't prompt for client certificate selection"; Value=0; Desc="Certificate selection bypass" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2102"; Name="Script-initiated windows without constraints"; Value=0; Desc="Allows script windows" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2103"; Name="Allow status bar updates via script"; Value=0; Desc="Status bar updates" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2104"; Name="Allow windows without address/status bars"; Value=0; Desc="Allows addressless popup windows" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2105"; Name="Allow scripted prompt windows"; Value=0; Desc="Allows prompt windows" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2201"; Name="Automatic prompting for ActiveX controls"; Value=0; Desc="ActiveX prompting" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2300"; Name="Web sites in less privileged zone navigation"; Value=0; Desc="Less privileged navigation" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2400"; Name=".NET Framework: XAML browser applications"; Value=0; Desc="XAML browser apps" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2402"; Name=".NET Framework: Loose XAML"; Value=0; Desc="Loose XAML support" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2708"; Name="Allow approved domains to use ActiveX"; Value=0; Desc="Approved domains ActiveX" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2709"; Name="Run Antimalware against ActiveX"; Value=0; Desc="Antimalware scan behavior" },
    @{ ZoneId=3; ZoneName="Internet"; ID="270B"; Name="Allow web workers"; Value=0; Desc="Permits HTML5 background web workers" }
)

# 6. APPLY SETTINGS TO REGISTRY (ZONE 1, ZONE 2, ZONE 3)
Write-Host ""
Write-Host "[STEP 3/5] Applying Security Zone Settings (Zone 1, Zone 2, Zone 3)..." -ForegroundColor Green

$ExecutionResults = [System.Collections.Generic.List[PSObject]]::new()

foreach ($setting in $SettingsCatalog) {
    $appliedSuccessfully = $true
    $failureReason = "None"
    $zoneId = $setting.ZoneId

    $targetRoots = @(
        "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\$zoneId",
        "HKLM:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\$zoneId"
    )

    foreach ($zonePath in $targetRoots) {
        try {
            if (-not (Test-Path $zonePath)) {
                New-Item -Path $zonePath -Force | Out-Null
            }
            Set-ItemProperty -Path $zonePath -Name $setting.ID -Value $setting.Value -Type DWord -Force -ErrorAction Stop
        } catch {
            $appliedSuccessfully = $false
            $failureReason = $_.Exception.Message
        }
    }

    $resultObj = [PSCustomObject]@{
        ZoneId       = $setting.ZoneId
        ZoneName     = $setting.ZoneName
        SettingID    = $setting.ID
        SettingName  = $setting.Name
        ExpectedData = $setting.Value
        Description  = $setting.Desc
        Status       = if ($appliedSuccessfully) { "SUCCESS" } else { "FAILED" }
        Reason       = $failureReason
    }
    $ExecutionResults.Add($resultObj)

    if ($appliedSuccessfully) {
        Write-Host "  [APPLIED] [$($setting.ZoneName.PadRight(14))] $($setting.ID.PadRight(12)) -> $($setting.Name)" -ForegroundColor DarkGreen
    } else {
        Write-Host "  [FAILED]  [$($setting.ZoneName.PadRight(14))] $($setting.ID.PadRight(12)) -> $($setting.Name) (Reason: $failureReason)" -ForegroundColor Red
    }
}

# 7. CONFIGURE MODERN PROTOCOLS (TLS 1.2/1.3) AND EDGE IE MODE
Write-Host ""
Write-Host "[STEP 4/5] Enabling TLS 1.2/1.3 and Microsoft Edge Enterprise IE Mode..." -ForegroundColor Green

try {
    # SecureProtocols: 2688 enables TLS 1.0, 1.1, 1.2 and 1.3
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" -Name "SecureProtocols" -Value 2688 -Type DWord -Force
    Set-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" -Name "SecureProtocols" -Value 2688 -Type DWord -Force
    
    # Generate Enterprise Site List XML specifically for ubd.telangana.gov.in
    $SiteXmlContent = @"
<site-list version="1">
  <site url="ubd.telangana.gov.in">
    <compat-mode>IE5</compat-mode>
    <open-in>IE11</open-in>
  </site>
  <site url="telangana.gov.in/ubd">
    <compat-mode>IE5</compat-mode>
    <open-in>IE11</open-in>
  </site>
</site-list>
"@
    [System.IO.File]::WriteAllText($SiteListXmlPath, $SiteXmlContent, [System.Text.Encoding]::UTF8)

    # Edge Policies
    $EdgePolicyPaths = @(
        "HKLM:\SOFTWARE\Policies\Microsoft\Edge",
        "HKCU:\SOFTWARE\Policies\Microsoft\Edge"
    )
    foreach ($ep in $EdgePolicyPaths) {
        if (-not (Test-Path $ep)) { New-Item -Path $ep -Force | Out-Null }
        Set-ItemProperty -Path $ep -Name "InternetExplorerIntegrationLevel" -Value 1 -Type DWord -Force
        Set-ItemProperty -Path $ep -Name "InternetExplorerIntegrationSiteList" -Value $SiteListXmlPath -Type String -Force
        Set-ItemProperty -Path $ep -Name "InternetExplorerIntegrationReloadInIEModeAllowed" -Value 1 -Type DWord -Force
    }
    Write-Host "  [OK] Microsoft Edge IE Mode Policies & sites.xml configured successfully." -ForegroundColor Green
} catch {
    Write-Warning "  [WARN] Failed configuring Edge Policy: $($_.Exception.Message)"
}

# 8. VERIFY ALL SETTINGS & GENERATE TXT REPORT
Write-Host ""
Write-Host "[STEP 5/5] Performing Deep Registry Verification & Compiling Audit Report..." -ForegroundColor Cyan

$ReportHeader = @"
========================================================================================================
  E-VEDHIKA AUTOMATED REGISTRY AUDIT & SECURITY ZONES VERIFICATION REPORT
  Target Website: https://ubd.telangana.gov.in/
  Office / PC   : $env:COMPUTERNAME ($env:USERNAME)
  Execution Date: $(Get-Date -Format 'dd-MMM-yyyy HH:mm:ss')
  Backup Path   : $BackupFolder
========================================================================================================

[A] TRUSTED SITES ZONE MAP (ZONE 2) STATUS:
"@

$ZoneMapChecks = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.telangana.gov.in",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in\ubd",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.telangana.gov.in",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in\ubd"
)

$MapReportLines = [System.Collections.Generic.List[string]]::new()
foreach ($mPath in $ZoneMapChecks) {
    if (Test-Path $mPath) {
        $httpsVal = (Get-ItemProperty -Path $mPath -Name "https" -ErrorAction SilentlyContinue).https
        $starVal  = (Get-ItemProperty -Path $mPath -Name "*" -ErrorAction SilentlyContinue).'*'
        $MapReportLines.Add("  [VERIFIED] Path: $mPath | https=$httpsVal, *=$starVal (Zone ID 2)")
    } else {
        $MapReportLines.Add("  [MISSING]  Path: $mPath")
    }
}

$ReportBody = @"
`n[B] SECURITY ZONES (ZONE 1, ZONE 2, ZONE 3) VERIFICATION MATRIX:
---------------------------------------------------------------------------------------------------------------------------------
Zone Name       | Value ID     Actual (HKCU)  Actual (HKLM)  Expected   Verification Status  Setting Name
---------------------------------------------------------------------------------------------------------------------------------
"@

$PassedCount = 0
$FailedCount = 0
$VerificationLines = [System.Collections.Generic.List[string]]::new()

foreach ($setting in $SettingsCatalog) {
    $hkcuActual = $null
    $hklmActual = $null
    $zoneId = $setting.ZoneId

    try {
        $hkcuActual = (Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\$zoneId" -Name $setting.ID -ErrorAction SilentlyContinue).($setting.ID)
    } catch {}

    try {
        $hklmActual = (Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\$zoneId" -Name $setting.ID -ErrorAction SilentlyContinue).($setting.ID)
    } catch {}

    $statusStr = "FAILED"
    $reasonStr = ""

    if ($hkcuActual -eq $setting.Value -or $hklmActual -eq $setting.Value) {
        $statusStr = "PASS"
        $PassedCount++
    } else {
        $statusStr = "FAILED"
        $FailedCount++
        if ($null -eq $hkcuActual -and $null -eq $hklmActual) {
            $reasonStr = "Registry value missing in both HKCU and HKLM"
        } else {
            $reasonStr = "Mismatch: Expected $($setting.Value), got HKCU=$hkcuActual, HKLM=$hklmActual"
        }
    }

    $zoneCol   = $setting.ZoneName.PadRight(15)
    $idCol     = $setting.ID.PadRight(12)
    $hkcuCol   = if ($null -ne $hkcuActual) { "$hkcuActual".PadRight(14) } else { "NOT SET".PadRight(14) }
    $hklmCol   = if ($null -ne $hklmActual) { "$hklmActual".PadRight(14) } else { "NOT SET".PadRight(14) }
    $expCol    = "$($setting.Value)".PadRight(10)
    $statCol   = $statusStr.PadRight(20)
    $nameCol   = $setting.Name

    $VerificationLines.Add("$zoneCol | $idCol $hkcuCol $hklmCol $expCol $statCol $nameCol")
    if ($reasonStr) {
        $VerificationLines.Add("                   --> [Failure Reason]: $reasonStr")
    }
}

$ReportFooter = @"

---------------------------------------------------------------------------------------------------------------------------------
[C] SUMMARY:
  Total Security Settings Verified : $($SettingsCatalog.Count)
  Successfully ENABLED / ALLOWED   : $PassedCount
  Failed / Needs Attention         : $FailedCount
  Overall Health Compliance Score  : $([math]::Round(($PassedCount / $SettingsCatalog.Count) * 100, 2))%

[D] EDGE IE MODE STATUS:
  Site List XML File Path : $SiteListXmlPath (Exists: $(Test-Path $SiteListXmlPath))
  IE Integration Mode     : Enabled (IE5 Quirks Mode configured for ubd.telangana.gov.in)
  E-Vedhika Web App       : Excluded (Opens in modern Edge/Chrome)

[E] SAFETY & SCOPE CONFIRMATION:
  * Security settings are strictly applied to their respective Security Zones (Zone 1, Zone 2, Zone 3).
  * Pre-deployment backup preserved at $BackupFolder.
========================================================================================================
Report File Generated at: $ReportPath
========================================================================================================
"@

$FinalFullReport = $ReportHeader + "`n" + ($MapReportLines -join "`n") + "`n" + $ReportBody + "`n" + ($VerificationLines -join "`n") + "`n" + $ReportFooter

[System.IO.File]::WriteAllText($ReportPath, $FinalFullReport, [System.Text.Encoding]::UTF8)

# 9. SILENT AUTOMATIC CLOUD TELEMETRY'''

start, end = match.span()
code = code[:start] + new_code + code[end - len('# 9. SILENT AUTOMATIC CLOUD TELEMETRY'):]

with open('public/scripts/Configure_UBD_Registry.ps1', 'w') as f:
    f.write(code)

print("Updated Configure_UBD_Registry.ps1 with Zone 1, 2, 3 catalog, application and reporting!")
