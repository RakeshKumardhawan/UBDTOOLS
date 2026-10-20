<#
.SYNOPSIS
    E-Vedhika UBD Deployment Tool - Complete System Revert & Rollback Script
    Restores Windows Internet Settings, Security Zones, and Edge Policies back to original state.
    Target: https://ubd.telangana.gov.in/
    Developer: E-Vedhika
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "E-Vedhika UBD System Revert & Original State Restorer"

# 1. AUTO SELF-ELEVATION (Request Admin Privileges without Right-Clicking)
$CurrentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$CurrentPrincipal = New-Object Security.Principal.WindowsPrincipal($CurrentIdentity)
$IsAdmin = $CurrentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "[INFO] Requesting Administrative Elevation for Complete System Revert..." -ForegroundColor Yellow
    try {
        $ScriptPath = $MyInvocation.MyCommand.Definition
        if (-not $ScriptPath) { $ScriptPath = $PSCommandPath }
        Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`"" -Verb RunAs
        Exit
    }
    catch {
        Write-Warning "Elevation cancelled. Administrator privileges are required to revert system registry settings."
        Read-Host "Press ENTER to exit"
        Exit 1
    }
}

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "   E-VEDHIKA UBD DEPLOYMENT TOOL - SYSTEM REVERT & RESTORATION ENGINE" -ForegroundColor Cyan
Write-Host "   Reverting all registry, zone settings, policies & files to original state" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ""

# STEP 1: RESTORE FROM PRE-DEPLOYMENT BACKUP SNAPSHOT
Write-Host "[STEP 1/6] Searching for Pre-Deployment Backup Snapshot..." -ForegroundColor Green
$SearchDirs = @("C:\EVedhika_UBD_Backups", "$env:USERPROFILE\Documents\EVedhika_Backups")
$LatestBackup = $null
$LatestTime = [DateTime]::MinValue

foreach ($dir in $SearchDirs) {
    if (Test-Path $dir) {
        $regFiles = Get-ChildItem -Path $dir -Filter "*.reg" -ErrorAction SilentlyContinue
        foreach ($file in $regFiles) {
            if ($file.LastWriteTime -gt $LatestTime) {
                $LatestTime = $file.LastWriteTime
                $LatestBackup = $file.FullName
            }
        }
    }
}

if ($LatestBackup -and (Test-Path $LatestBackup)) {
    Write-Host "  [FOUND] Restoring from latest backup: $LatestBackup" -ForegroundColor Yellow
    $p = Start-Process "reg.exe" -ArgumentList "import `"$LatestBackup`"" -Wait -NoNewWindow -PassThru
    if ($p.ExitCode -eq 0) {
        Write-Host "  [SUCCESS] All Security Zones restored to pre-deployment backup state!" -ForegroundColor Green
    }
} else {
    Write-Host "  [NOTICE] No backup file found. Resetting Security Zones 1, 2, 3 to Windows factory defaults..." -ForegroundColor Yellow
    
    $CustomKeys = @(
        "1001", "1004", "1200", "1201", "1206", "1208", "1209", "120A", "120B",
        "1400", "1402", "1405", "1406", "1407", "1409", "1604", "1606", "1607",
        "1608", "1609", "1802", "1803", "1804", "1806", "1809", "2000", "2001",
        "2004", "2007", "2100", "2102", "2103", "2104", "2105", "2201", "2300",
        "2301", "2400", "2401", "2402", "2600", "2702", "2708", "2709", "1A00", "1A04"
    )
    
    # Reset Zone 2 (Trusted Sites)
    $z2Path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\2"
    if (Test-Path $z2Path) {
        foreach ($k in $CustomKeys) { Remove-ItemProperty -Path $z2Path -Name $k -ErrorAction SilentlyContinue }
        Set-ItemProperty -Path $z2Path -Name "CurrentLevel" -Value 0x10000 -Type DWord -Force
        Set-ItemProperty -Path $z2Path -Name "Flags" -Value 0x43 -Type DWord -Force
        Remove-ItemProperty -Path $z2Path -Name "MinLevel" -ErrorAction SilentlyContinue
    }
    
    # Reset Zone 1 (Local Intranet)
    $z1Path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\1"
    if (Test-Path $z1Path) {
        foreach ($k in $CustomKeys) { Remove-ItemProperty -Path $z1Path -Name $k -ErrorAction SilentlyContinue }
        Set-ItemProperty -Path $z1Path -Name "CurrentLevel" -Value 0x10500 -Type DWord -Force
        Set-ItemProperty -Path $z1Path -Name "Flags" -Value 0xdb -Type DWord -Force
    }

    # Reset Zone 3 (Internet)
    $z3Path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zones\3"
    if (Test-Path $z3Path) {
        foreach ($k in $CustomKeys) { Remove-ItemProperty -Path $z3Path -Name $k -ErrorAction SilentlyContinue }
        Set-ItemProperty -Path $z3Path -Name "CurrentLevel" -Value 0x11000 -Type DWord -Force
        Set-ItemProperty -Path $z3Path -Name "Flags" -Value 0x25 -Type DWord -Force
    }
    Write-Host "  [OK] Security Zones reset to standard Windows default templates." -ForegroundColor Green
}

# STEP 2: REMOVE TRUSTED SITES DOMAIN MAPPINGS
Write-Host ""
Write-Host "[STEP 2/6] Removing UBD Portal from Trusted Sites ZoneMap..." -ForegroundColor Green
$DomainPaths = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.telangana.gov.in",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in\ubd",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ubd.telangana.gov.in",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in\ubd"
)
foreach ($dp in $DomainPaths) {
    if (Test-Path $dp) {
        Remove-Item -Path $dp -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  [REMOVED] Domain mapping: $dp" -ForegroundColor Gray
    }
}

# STEP 3: REMOVE EDGE IE MODE POLICIES
Write-Host ""
Write-Host "[STEP 3/6] Removing Microsoft Edge Enterprise Mode Policies..." -ForegroundColor Green
$EdgePolicyHives = @("HKCU:\SOFTWARE\Policies\Microsoft\Edge", "HKLM:\SOFTWARE\Policies\Microsoft\Edge")
foreach ($eh in $EdgePolicyHives) {
    if (Test-Path $eh) {
        Remove-ItemProperty -Path $eh -Name "InternetExplorerIntegrationLevel" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $eh -Name "InternetExplorerIntegrationSiteList" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $eh -Name "InternetExplorerIntegrationReloadInIEModeAllowed" -ErrorAction SilentlyContinue
        Write-Host "  [REMOVED] Edge Enterprise policies from $eh" -ForegroundColor Gray
    }
}

# STEP 4: DELETE SITES.XML AND ENTERPRISE COMPAT DIRECTORY
Write-Host ""
Write-Host "[STEP 4/6] Deleting Enterprise Compatibility Directory..." -ForegroundColor Green
if (Test-Path "C:\enterprise_compat") {
    Remove-Item -Path "C:\enterprise_compat" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  [REMOVED] C:\enterprise_compat\sites.xml" -ForegroundColor Gray
}

# STEP 5: RESTORE ADVANCED SETTINGS AND TLS PROTOCOLS
Write-Host ""
Write-Host "[STEP 5/6] Restoring Windows Advanced Internet Settings..." -ForegroundColor Green
$isHives = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings"
)
foreach ($h in $isHives) {
    if (Test-Path $h) {
        Remove-ItemProperty -Path $h -Name "CertificateRevocation" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $h -Name "PublisherRevocation" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $h -Name "WarnonBadCertRecving" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $h -Name "WarnOnZoneCrossing" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $h -Name "WarnOnPostRedirect" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $h -Name "AllowInvalidCertificates" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $h -Name "CheckExeSignatures" -ErrorAction SilentlyContinue
        Remove-ItemProperty -Path $h -Name "SyncMode5" -ErrorAction SilentlyContinue
        Set-ItemProperty -Path $h -Name "SecureProtocols" -Value 2688 -Type DWord -Force -ErrorAction SilentlyContinue
    }
}

# STEP 6: CLEAN SHORTCUTS AND TEMPORARY RUN KEYS
Write-Host ""
Write-Host "[STEP 6/6] Cleaning Shortcuts and Startup Items..." -ForegroundColor Green
$Shortcuts = @(
    "$env:USERPROFILE\Desktop\UBD Portal (Edge IE Mode).url",
    "$env:USERPROFILE\Desktop\E-Vedhika UBD Deployment Tool.lnk",
    "$env:USERPROFILE\Desktop\E-Vedhika UBD Deployment Tool.url",
    "$env:USERPROFILE\Desktop\E-Vedhika Web App (www.e-vedhika.in).url",
    "$env:PUBLIC\Desktop\UBD Portal (Edge IE Mode).url",
    "$env:PUBLIC\Desktop\E-Vedhika UBD Deployment Tool.lnk"
)
foreach ($sc in $Shortcuts) {
    if (Test-Path $sc) {
        Remove-Item -Path $sc -Force -ErrorAction SilentlyContinue
        Write-Host "  [DELETED] Shortcut: $sc" -ForegroundColor Gray
    }
}

Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "EVedhikaUBDGuardian" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "EVedhikaUBDGuardian" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "  [SUCCESS] All E-Vedhika changes removed!" -ForegroundColor Green
Write-Host "  System has been cleanly restored to its original pre-installation state." -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press ENTER to close"
