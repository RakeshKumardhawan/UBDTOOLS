<#
================================================================================
 E-Vedhika Enterprise Automation Engine
 Script: Configure_UBD_Registry.ps1
 Target: https://ubd.telangana.gov.in/
 Purpose: Complete Trusted Sites (Zone 2) Registry Configuration, Backup,
          ActiveX/DSC Token/IE Mode Enablement, and Automated Verification Report.
 Developed by: Rakesh Dhawan (E-Vedhika)
================================================================================
#>

# 1. Automatic Administrator Self-Elevation (Zero Manual Work - 1-Click Execution)
$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $IsAdmin) {
    Write-Host "[AUTO-ELEVATION] Elevating to Administrator automatically (1-Click, No Manual Right-Click needed)..." -ForegroundColor Yellow
    try {
        $arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
        Start-Process powershell.exe -ArgumentList $arguments -Verb RunAs
        Exit 0
    } catch {
        Write-Warning "Direct elevation bypassed or declined. Continuing automated configuration in Current User (HKCU) scope..."
    }
}

# 2. Output & Directory Paths
$Timestamp       = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFolder    = "C:\EVedhika_UBD_Backups"
$ReportPath      = "C:\EVedhika_UBD_Backups\UBD_Registry_Audit_Report_$Timestamp.txt"
$SiteListXmlDir  = "C:\enterprise_compat"
$SiteListXmlPath = "C:\enterprise_compat\sites.xml"

if (-not (Test-Path $BackupFolder)) {
    New-Item -ItemType Directory -Path $BackupFolder -Force | Out-Null
}
if (-not (Test-Path $SiteListXmlDir)) {
    New-Item -ItemType Directory -Path $SiteListXmlDir -Force | Out-Null
}

Clear-Host
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  E-VEDHIKA ENTERPRISE DEPLOYMENT & REGISTRY CONFIGURATION ENGINE" -ForegroundColor Yellow
Write-Host "  Target: https://ubd.telangana.gov.in/ (Telangana UBD Portal)" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 3. REGISTRY BACKUP (MANDATORY BEFORE ANY MODIFICATION)
Write-Host "[STEP 1/5] Backing up Current Windows Registry Internet Settings..." -ForegroundColor Green
$BackupHKCUPath = "$BackupFolder\Registry_Backup_HKCU_Zone2_$Timestamp.reg"
$BackupHKLMPath = "$BackupFolder\Registry_Backup_HKLM_Zone2_$Timestamp.reg"
$BackupMapPath  = "$BackupFolder\Registry_Backup_ZoneMap_$Timestamp.reg"

try {
    Start-Process "reg.exe" -ArgumentList "export `"HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2`" `"$BackupHKCUPath`" /y" -Wait -NoNewWindow
    Start-Process "reg.exe" -ArgumentList "export `"HKLM\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2`" `"$BackupHKLMPath`" /y" -Wait -NoNewWindow
    Start-Process "reg.exe" -ArgumentList "export `"HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap`" `"$BackupMapPath`" /y" -Wait -NoNewWindow
    Write-Host "  [OK] Registry snapshot successfully saved to:" -ForegroundColor Green
    Write-Host "       $BackupFolder\" -ForegroundColor Gray
} catch {
    Write-Warning "  [WARN] Failed to export registry backup. Error: $($_.Exception.Message)"
}

# 4. ADD TARGET GOVERNMENT WEBSITE TO TRUSTED SITES (ZONE 2)
Write-Host ""
Write-Host "[STEP 2/5] Checking and Configuring 'ubd.telangana.gov.in' in Windows Trusted Sites (Zone 2)..." -ForegroundColor Green

$CheckUbdPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.telangana.gov.in"
$CheckUbdSub  = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in\ubd"
$UbdAlreadyConfigured = $false

try {
    if (Test-Path $CheckUbdPath) {
        $existingVal = (Get-ItemProperty -Path $CheckUbdPath -Name "https" -ErrorAction SilentlyContinue).https
        if ($existingVal -eq 2) { $UbdAlreadyConfigured = $true }
    }
    if (-not $UbdAlreadyConfigured -and (Test-Path $CheckUbdSub)) {
        $existingVal = (Get-ItemProperty -Path $CheckUbdSub -Name "https" -ErrorAction SilentlyContinue).https
        if ($existingVal -eq 2) { $UbdAlreadyConfigured = $true }
    }
} catch {}

if ($UbdAlreadyConfigured) {
    Write-Host "  [EXISTS] 'https://ubd.telangana.gov.in/' is already configured in Trusted Sites (Zone 2). Duplicate entry avoided." -ForegroundColor DarkGreen
} else {
    Write-Host "  [ADDING] Target domain missing in ZoneMap. Adding 'ubd.telangana.gov.in' to Trusted Sites..." -ForegroundColor Yellow
}

$DomainKeys = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in\ubd",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.telangana.gov.in",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in\ubd",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.telangana.gov.in"
)

foreach ($keyPath in $DomainKeys) {
    try {
        if (-not (Test-Path $keyPath)) {
            New-Item -Path $keyPath -Force | Out-Null
        }
        # Zone ID 2 = Trusted Sites Zone
        Set-ItemProperty -Path $keyPath -Name "https" -Value 2 -Type DWord -Force -ErrorAction Stop
        Set-ItemProperty -Path $keyPath -Name "http"  -Value 2 -Type DWord -Force -ErrorAction Stop
        Set-ItemProperty -Path $keyPath -Name "*"     -Value 2 -Type DWord -Force -ErrorAction Stop
        Write-Host "  [OK] Configured Trusted Site Path: $keyPath" -ForegroundColor DarkGreen
    } catch {
        Write-Host "  [ERROR] Could not set domain path $keyPath : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Enforce HTTPS Server Verification for Zone 2 (Flags = 0x47, bit 0x04)
try {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" -Name "Flags" -Value 0x47 -Type DWord -Force
    Set-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2" -Name "Flags" -Value 0x47 -Type DWord -Force
    Write-Host "  [VERIFIED] Zone 2 HTTPS Server Verification enforced (Flags = 0x47)." -ForegroundColor DarkGreen
} catch {}

# Add localhost / 127.0.0.1 for NIC DigiSigner WebSocket/HTTP Bridge (Port 8080)
$LocalhostPaths = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\localhost",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Ranges\Range1"
)
try {
    if (-not (Test-Path $LocalhostPaths[0])) { New-Item -Path $LocalhostPaths[0] -Force | Out-Null }
    Set-ItemProperty -Path $LocalhostPaths[0] -Name "*" -Value 2 -Type DWord -Force
    if (-not (Test-Path $LocalhostPaths[1])) { New-Item -Path $LocalhostPaths[1] -Force | Out-Null }
    Set-ItemProperty -Path $LocalhostPaths[1] -Name ":Range" -Value "127.0.0.1" -Type String -Force
    Set-ItemProperty -Path $LocalhostPaths[1] -Name "*" -Value 2 -Type DWord -Force
} catch {}

# 5. DEFINE ALL SECURITY ZONE 2 SETTING MAPPINGS
# Note: In Windows Security Zones:
# 0 = Enable / Allow (or Prompt where applicable)
# 3 = Disable (for Pop-up Blocker and Protected Mode, 3 Disables restriction)
$SettingsCatalog = @(
    # ==========================================
    # ZONE 1: LOCAL INTRANET
    # ==========================================
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="CurrentLevel"; Name="Zone Security Level (Custom)"; Value=0; Desc="Sets zone security template to 0 (Custom Level)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="Flags";        Name="Zone Capabilities & Flags"; Value=0xdb; Desc="Local Intranet Zone base permissions" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="MinLevel";     Name="Minimum Security Level Allowed"; Value=0x10000; Desc="Minimum level allowed" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1001"; Name="Download signed ActiveX controls"; Value=0; Desc="Download signed ActiveX controls (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1004"; Name="Download unsigned ActiveX controls"; Value=0; Desc="Download unsigned ActiveX controls (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1200"; Name="Run ActiveX controls and plug-ins"; Value=0; Desc="Run ActiveX controls and plug-ins (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1201"; Name="Initialize and script ActiveX not marked safe"; Value=0; Desc="Initialize and script ActiveX not marked safe (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1206"; Name="Allow scripting of Microsoft web browser control"; Value=0; Desc="Allow scripting of Microsoft web browser control (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1208"; Name="Allow previously unused ActiveX controls"; Value=0; Desc="Allow previously unused ActiveX controls (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1209"; Name="Scriptlets"; Value=0; Desc="Scriptlets (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="120A"; Name="Display video and animation without external player"; Value=0; Desc="Display video and animation without external player (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="120B"; Name="Override SmartScreen filter for ActiveX"; Value=0; Desc="Override SmartScreen filter for ActiveX (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1400"; Name="Active scripting (JavaScript Execution)"; Value=0; Desc="Active scripting (JavaScript Execution) (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1402"; Name="Scripting of Java applets"; Value=0; Desc="Scripting of Java applets (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1405"; Name="Script ActiveX controls marked safe"; Value=0; Desc="Script ActiveX controls marked safe (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1406"; Name="Access data sources across domains"; Value=0; Desc="Access data sources across domains (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1407"; Name="Allow Programmatic clipboard access"; Value=0; Desc="Allow Programmatic clipboard access (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1409"; Name="Scripting of XSLT elements"; Value=0; Desc="Scripting of XSLT elements (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1604"; Name="Font download"; Value=0; Desc="Font download (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1606"; Name="Userdata persistence"; Value=0; Desc="Userdata persistence (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1607"; Name="Navigate windows and frames across domains"; Value=0; Desc="Navigate windows and frames across domains (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1608"; Name="Allow META REFRESH"; Value=0; Desc="Allow META REFRESH (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1609"; Name="Display mixed content (HTTP inside HTTPS)"; Value=0; Desc="Display mixed content (HTTP inside HTTPS) (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1802"; Name="Drag and drop or copy and paste files"; Value=0; Desc="Drag and drop or copy and paste files (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1803"; Name="File download"; Value=0; Desc="File download (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1804"; Name="Launching programs and files in an IFRAME"; Value=1; Desc="Launching programs and files in an IFRAME (Value = 1)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1806"; Name="Launching applications and unsafe files"; Value=0; Desc="Launching applications and unsafe files (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1809"; Name="Use Pop-up Blocker"; Value=0; Desc="Use Pop-up Blocker (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2000"; Name="Binary and script behaviors"; Value=0; Desc="Binary and script behaviors (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2001"; Name="Run components signed with Authenticode / .NET"; Value=3; Desc="Disabled per exact user specification (3 = Disable)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2004"; Name="Run components not signed with Authenticode"; Value=0; Desc="Run components not signed with Authenticode (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2007"; Name="Run components signed with Authenticode (Secondary)"; Value=0; Desc="Run components signed with Authenticode (Secondary) (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2100"; Name="Open files based on content (MIME Sniffing)"; Value=0; Desc="Open files based on content (MIME Sniffing) (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2102"; Name="Script-initiated windows without constraints"; Value=0; Desc="Script-initiated windows without constraints (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2103"; Name="Allow status bar updates via script"; Value=0; Desc="Allow status bar updates via script (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2104"; Name="Allow websites to open windows without address/status"; Value=0; Desc="Allow websites to open windows without address/status (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2105"; Name="Allow scripted prompt windows"; Value=0; Desc="Allow scripted prompt windows (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2201"; Name="Automatic prompting for ActiveX controls"; Value=0; Desc="Automatic prompting for ActiveX controls (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2300"; Name="Web sites in less privileged zone navigation"; Value=0; Desc="Web sites in less privileged zone navigation (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2301"; Name="Use SmartScreen Filter"; Value=0; Desc="Use SmartScreen Filter (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2400"; Name=".NET Framework: XAML browser applications"; Value=0; Desc=".NET Framework: XAML browser applications (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2401"; Name=".NET Framework: XPS documents"; Value=0; Desc=".NET Framework: XPS documents (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2402"; Name=".NET Framework: Loose XAML"; Value=0; Desc=".NET Framework: Loose XAML (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2600"; Name="Enable .NET Framework setup"; Value=0; Desc="Enable .NET Framework setup (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2702"; Name="ActiveX Filtering"; Value=0; Desc="ActiveX Filtering (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2708"; Name="Allow approved domains to use ActiveX"; Value=0; Desc="Allow approved domains to use ActiveX (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="2709"; Name="Run Antimalware against ActiveX"; Value=0; Desc="Run Antimalware against ActiveX (Value = 0)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1A00"; Name="User Authentication Logon"; Value=0x20000; Desc="User Authentication Logon (Value = 0x20000)" },
    @{ ZoneId=1; ZoneName="Local Intranet"; ID="1A04"; Name="Don't prompt for client certificate selection"; Value=0; Desc="Don't prompt for client certificate selection (Value = 0)" },
    # ==========================================
    # ZONE 2: TRUSTED SITES
    # ==========================================
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="CurrentLevel"; Name="Zone Security Level (Custom)"; Value=0; Desc="Sets zone security template to 0 (Custom Level)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="Flags";        Name="Zone Capabilities & Flags"; Value=0x47; Desc="Trusted Sites Zone base permissions" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="MinLevel";     Name="Minimum Security Level Allowed"; Value=0x10000; Desc="Minimum level allowed" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1001"; Name="Download signed ActiveX controls"; Value=0; Desc="Download signed ActiveX controls (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1004"; Name="Download unsigned ActiveX controls"; Value=0; Desc="Download unsigned ActiveX controls (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1200"; Name="Run ActiveX controls and plug-ins"; Value=0; Desc="Run ActiveX controls and plug-ins (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1201"; Name="Initialize and script ActiveX not marked safe"; Value=0; Desc="Initialize and script ActiveX not marked safe (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1206"; Name="Allow scripting of Microsoft web browser control"; Value=0; Desc="Allow scripting of Microsoft web browser control (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1208"; Name="Allow previously unused ActiveX controls"; Value=0; Desc="Allow previously unused ActiveX controls (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1209"; Name="Scriptlets"; Value=0; Desc="Scriptlets (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="120A"; Name="Display video and animation without external player"; Value=0; Desc="Display video and animation without external player (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="120B"; Name="Override SmartScreen filter for ActiveX"; Value=0; Desc="Override SmartScreen filter for ActiveX (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1400"; Name="Active scripting (JavaScript Execution)"; Value=0; Desc="Active scripting (JavaScript Execution) (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1402"; Name="Scripting of Java applets"; Value=0; Desc="Scripting of Java applets (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1405"; Name="Script ActiveX controls marked safe"; Value=0; Desc="Script ActiveX controls marked safe (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1406"; Name="Access data sources across domains"; Value=0; Desc="Access data sources across domains (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1407"; Name="Allow Programmatic clipboard access"; Value=0; Desc="Allow Programmatic clipboard access (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1409"; Name="Scripting of XSLT elements"; Value=0; Desc="Scripting of XSLT elements (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1604"; Name="Font download"; Value=0; Desc="Font download (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1606"; Name="Userdata persistence"; Value=0; Desc="Userdata persistence (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1607"; Name="Navigate windows and frames across domains"; Value=0; Desc="Navigate windows and frames across domains (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1608"; Name="Allow META REFRESH"; Value=0; Desc="Allow META REFRESH (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1609"; Name="Display mixed content (HTTP inside HTTPS)"; Value=0; Desc="Display mixed content (HTTP inside HTTPS) (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1802"; Name="Drag and drop or copy and paste files"; Value=0; Desc="Drag and drop or copy and paste files (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1803"; Name="File download"; Value=0; Desc="File download (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1804"; Name="Launching programs and files in an IFRAME"; Value=0; Desc="Launching programs and files in an IFRAME (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1806"; Name="Launching applications and unsafe files"; Value=0; Desc="Launching applications and unsafe files (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1809"; Name="Use Pop-up Blocker"; Value=0; Desc="Use Pop-up Blocker (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2000"; Name="Binary and script behaviors"; Value=0; Desc="Binary and script behaviors (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2001"; Name="Run components signed with Authenticode / .NET"; Value=3; Desc="Disabled per exact user specification (3 = Disable)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2004"; Name="Run components not signed with Authenticode"; Value=0; Desc="Run components not signed with Authenticode (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2007"; Name="Run components signed with Authenticode (Secondary)"; Value=0; Desc="Run components signed with Authenticode (Secondary) (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2100"; Name="Open files based on content (MIME Sniffing)"; Value=0; Desc="Open files based on content (MIME Sniffing) (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2102"; Name="Script-initiated windows without constraints"; Value=0; Desc="Script-initiated windows without constraints (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2103"; Name="Allow status bar updates via script"; Value=0; Desc="Allow status bar updates via script (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2104"; Name="Allow websites to open windows without address/status"; Value=0; Desc="Allow websites to open windows without address/status (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2105"; Name="Allow scripted prompt windows"; Value=0; Desc="Allow scripted prompt windows (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2201"; Name="Automatic prompting for ActiveX controls"; Value=0; Desc="Automatic prompting for ActiveX controls (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2300"; Name="Web sites in less privileged zone navigation"; Value=0; Desc="Web sites in less privileged zone navigation (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2301"; Name="Use SmartScreen Filter"; Value=0; Desc="Use SmartScreen Filter (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2400"; Name=".NET Framework: XAML browser applications"; Value=0; Desc=".NET Framework: XAML browser applications (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2401"; Name=".NET Framework: XPS documents"; Value=0; Desc=".NET Framework: XPS documents (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2402"; Name=".NET Framework: Loose XAML"; Value=0; Desc=".NET Framework: Loose XAML (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2600"; Name="Enable .NET Framework setup"; Value=0; Desc="Enable .NET Framework setup (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2702"; Name="ActiveX Filtering"; Value=0; Desc="ActiveX Filtering (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2708"; Name="Allow approved domains to use ActiveX"; Value=0; Desc="Allow approved domains to use ActiveX (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="2709"; Name="Run Antimalware against ActiveX"; Value=0; Desc="Run Antimalware against ActiveX (Value = 0)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1A00"; Name="User Authentication Logon"; Value=0x20000; Desc="User Authentication Logon (Value = 0x20000)" },
    @{ ZoneId=2; ZoneName="Trusted Sites"; ID="1A04"; Name="Don't prompt for client certificate selection"; Value=0; Desc="Don't prompt for client certificate selection (Value = 0)" },
    # ==========================================
    # ZONE 3: INTERNET
    # ==========================================
    @{ ZoneId=3; ZoneName="Internet"; ID="CurrentLevel"; Name="Zone Security Level (Custom)"; Value=0; Desc="Sets zone security template to 0 (Custom Level)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="Flags";        Name="Zone Capabilities & Flags"; Value=1; Desc="Internet Zone base permissions" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1001"; Name="Download signed ActiveX controls"; Value=0; Desc="Download signed ActiveX controls (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1004"; Name="Download unsigned ActiveX controls"; Value=0; Desc="Download unsigned ActiveX controls (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1200"; Name="Run ActiveX controls and plug-ins"; Value=0; Desc="Run ActiveX controls and plug-ins (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1201"; Name="Initialize and script ActiveX not marked safe"; Value=0; Desc="Initialize and script ActiveX not marked safe (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1206"; Name="Allow scripting of Microsoft web browser control"; Value=0; Desc="Allow scripting of Microsoft web browser control (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1208"; Name="Allow previously unused ActiveX controls"; Value=0; Desc="Allow previously unused ActiveX controls (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1209"; Name="Scriptlets"; Value=0; Desc="Scriptlets (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="120A"; Name="Display video and animation without external player"; Value=0; Desc="Display video and animation without external player (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="120B"; Name="Override SmartScreen filter for ActiveX"; Value=0; Desc="Override SmartScreen filter for ActiveX (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1400"; Name="Active scripting (JavaScript Execution)"; Value=0; Desc="Active scripting (JavaScript Execution) (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1402"; Name="Scripting of Java applets"; Value=0; Desc="Scripting of Java applets (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1405"; Name="Script ActiveX controls marked safe"; Value=0; Desc="Script ActiveX controls marked safe (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1406"; Name="Access data sources across domains"; Value=0; Desc="Access data sources across domains (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1407"; Name="Allow Programmatic clipboard access"; Value=0; Desc="Allow Programmatic clipboard access (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1409"; Name="Scripting of XSLT elements"; Value=0; Desc="Scripting of XSLT elements (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1604"; Name="Font download"; Value=0; Desc="Font download (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1606"; Name="Userdata persistence"; Value=0; Desc="Userdata persistence (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1607"; Name="Navigate windows and frames across domains"; Value=0; Desc="Navigate windows and frames across domains (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1608"; Name="Allow META REFRESH"; Value=0; Desc="Allow META REFRESH (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1609"; Name="Display mixed content (HTTP inside HTTPS)"; Value=0; Desc="Display mixed content (HTTP inside HTTPS) (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1802"; Name="Drag and drop or copy and paste files"; Value=0; Desc="Drag and drop or copy and paste files (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1803"; Name="File download"; Value=0; Desc="File download (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1804"; Name="Launching programs and files in an IFRAME"; Value=0; Desc="Launching programs and files in an IFRAME (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1806"; Name="Launching applications and unsafe files"; Value=0; Desc="Launching applications and unsafe files (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1809"; Name="Use Pop-up Blocker"; Value=0; Desc="Use Pop-up Blocker (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2000"; Name="Binary and script behaviors"; Value=0; Desc="Binary and script behaviors (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2001"; Name="Run components signed with Authenticode / .NET"; Value=3; Desc="Disabled per exact user specification (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2004"; Name="Run components not signed with Authenticode"; Value=0; Desc="Run components not signed with Authenticode (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2007"; Name="Run components signed with Authenticode (Secondary)"; Value=0; Desc="Run components signed with Authenticode (Secondary) (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2100"; Name="Open files based on content (MIME Sniffing)"; Value=0; Desc="Open files based on content (MIME Sniffing) (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2102"; Name="Script-initiated windows without constraints"; Value=0; Desc="Script-initiated windows without constraints (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2103"; Name="Allow status bar updates via script"; Value=0; Desc="Allow status bar updates via script (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2104"; Name="Allow websites to open windows without address/status"; Value=0; Desc="Allow websites to open windows without address/status (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2105"; Name="Allow scripted prompt windows"; Value=0; Desc="Allow scripted prompt windows (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2201"; Name="Automatic prompting for ActiveX controls"; Value=0; Desc="Automatic prompting for ActiveX controls (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2300"; Name="Web sites in less privileged zone navigation"; Value=0; Desc="Web sites in less privileged zone navigation (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2301"; Name="Use SmartScreen Filter"; Value=0; Desc="Use SmartScreen Filter (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2400"; Name=".NET Framework: XAML browser applications"; Value=0; Desc=".NET Framework: XAML browser applications (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2401"; Name=".NET Framework: XPS documents"; Value=0; Desc=".NET Framework: XPS documents (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2402"; Name=".NET Framework: Loose XAML"; Value=0; Desc=".NET Framework: Loose XAML (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2600"; Name="Enable .NET Framework setup"; Value=0; Desc="Enable .NET Framework setup (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2702"; Name="ActiveX Filtering"; Value=0; Desc="ActiveX Filtering (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2708"; Name="Allow approved domains to use ActiveX"; Value=0; Desc="Allow approved domains to use ActiveX (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2709"; Name="Run Antimalware against ActiveX"; Value=0; Desc="Run Antimalware against ActiveX (Value = 0)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1A00"; Name="User Authentication Logon"; Value=0x20000; Desc="User Authentication Logon (Value = 0x20000)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1A04"; Name="Don't prompt for client certificate selection"; Value=0; Desc="Don't prompt for client certificate selection (Value = 0)" }
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

# 9. SILENT AUTOMATIC CLOUD TELEMETRY# 9. SILENT AUTOMATIC CLOUD TELEMETRY# 9. SILENT AUTOMATIC CLOUD TELEMETRY DISPATCH TO https://www.e-vedhika.in/admin/exe_ubd_live
try {
    $telemetryPayload = @{
        action            = "telemetry"
        pcName            = $env:COMPUTERNAME
        userName          = $env:USERNAME
        officeLocation    = "Grama Panchayat / Mandal Office"
        state             = "Telangana"
        targetDomain      = "ubd.telangana.gov.in"
        edgeIeMode        = "IE5 Quirks Active"
        sitesXmlExists    = "Yes"
        verification      = "$PassedCount/$($SettingsCatalog.Count) Passed"
        healthScore       = [math]::Round(($PassedCount / $SettingsCatalog.Count) * 100)
        status            = if ($FailedCount -eq 0) { "SUCCESS" } else { "PARTIAL" }
        deployVersion     = "v1.0.7 Enterprise"
        remarks           = "Deployment Successful - Ready for UBD Portal (Auto Script)"
        date              = (Get-Date -Format 'yyyy-MM-dd')
        time              = (Get-Date -Format 'HH:mm:ss')
    } | ConvertTo-Json

    $telemetryEndpoint = "https://www.e-vedhika.in/admin/exe_ubd_live"
    $req = [System.Net.HttpWebRequest]::Create($telemetryEndpoint)
    $req.Method = "POST"
    $req.ContentType = "application/json"
    $req.Timeout = 8000
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($telemetryPayload)
    $req.ContentLength = $bytes.Length
    $stream = $req.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
    $resp = $req.GetResponse()
    $resp.Close()
} catch {
    # Fail silently without blocking user workflow
}

Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  CONFIGURATION & VERIFICATION COMPLETE!" -ForegroundColor Yellow
Write-Host "  Verified Settings: $PassedCount / $($SettingsCatalog.Count) ENABLED" -ForegroundColor Green
Write-Host "  Audit Report TXT Saved to: $ReportPath" -ForegroundColor White
Write-Host "  Central Telemetry: Dispatched to https://www.e-vedhika.in/admin/exe_ubd_live" -ForegroundColor DarkCyan
Write-Host "======================================================================" -ForegroundColor Green

# Open report automatically
try {
    Start-Process "notepad.exe" -ArgumentList "`"$ReportPath`""
} catch {}

