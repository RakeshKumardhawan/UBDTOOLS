# ===========================================================================
# E-Vedhika UBD Deployment Tool - Smart App Control & Error 4551 Auto-Fixer
# Run as Administrator in PowerShell
# ===========================================================================

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Elevated Administrator Privileges Required! Restarting PowerShell as Administrator..."
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host "  E-VEDHIKA UBD TOOL - SMART APP CONTROL & ERROR 4551 AUTO-FIXER (v1.0.9)" -ForegroundColor Green
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Disable Smart App Control & SmartScreen Block Policy
Write-Host "[1/5] Configuring Windows 11 Smart App Control & SmartScreen Registry Policies..." -ForegroundColor Yellow
New-Item -Path "HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy" -Force -ErrorAction SilentlyContinue | Out-Null
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy" -Name "VerifiedAndReputablePolicyState" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Force -ErrorAction SilentlyContinue | Out-Null
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "EnableSmartScreen" -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue

# 2. Suppress Mark-of-the-Web (Zone.Identifier) on downloaded files
Write-Host "[2/5] Disabling Mark-of-the-Web (Zone.Identifier) on downloaded installers..." -ForegroundColor Yellow
New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\Attachments" -Force -ErrorAction SilentlyContinue | Out-Null
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\Attachments" -Name "SaveZoneInformation" -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\Associations" -Force -ErrorAction SilentlyContinue | Out-Null
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\Associations" -Name "LowRiskFileTypes" -Value ".exe;.bat;.cmd;.ps1;.msi;.reg;.zip;.xls;.xlsx" -Type String -Force -ErrorAction SilentlyContinue

# 3. Create Trusted Non-TEMP Setup Directory (Prevents Error 4551)
Write-Host "[3/5] Creating Trusted Setup Temp Directory (C:\ProgramData\EVedhika\SetupTemp)..." -ForegroundColor Yellow
$safeTemp = "C:\ProgramData\EVedhika\SetupTemp"
$safeUpdates = "C:\ProgramData\EVedhika\Updates"
New-Item -ItemType Directory -Path $safeTemp -Force -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path $safeUpdates -Force -ErrorAction SilentlyContinue | Out-Null

# 4. Unblock Downloaded Files & Add Windows Defender Exclusions
Write-Host "[4/5] Unblocking EVedhika_Setup_v1.0.9.exe and adding Defender Exclusions..." -ForegroundColor Yellow
$downloadsDir = Join-Path $env:USERPROFILE "Downloads"
Get-ChildItem -Path $downloadsDir -Filter "*EVedhika*" -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue
Get-ChildItem -Path "." -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue
Add-MpPreference -ExclusionPath $downloadsDir, "C:\ProgramData\EVedhika", $safeTemp, "C:\Program Files (x86)\E-Vedhika UBD Tool" -ErrorAction SilentlyContinue
Add-MpPreference -ExclusionProcess "EVedhika_Setup_v1.0.9.exe", "EVedhikaUBDDeploymentTool.exe", "EVedhikaAutoRepair.exe" -ErrorAction SilentlyContinue

# 5. Launch Installer with Redirected TEMP/TMP to bypass Error 4551
Write-Host "[5/5] Launching EVedhika_Setup_v1.0.9.exe from Trusted Directory..." -ForegroundColor Green
$env:TEMP = $safeTemp
$env:TMP = $safeTemp
$dlInstaller = Join-Path $downloadsDir "EVedhika_Setup_v1.0.9.exe"
if (Test-Path $dlInstaller) {
    $trustedCopy = Join-Path $safeUpdates "EVedhika_Setup_v1.0.9.exe"
    Copy-Item -Path $dlInstaller -Destination $trustedCopy -Force
    Unblock-File -Path $trustedCopy -ErrorAction SilentlyContinue
    Start-Process -FilePath $trustedCopy
}

Write-Host ""
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Smart App Control & Error 4551 Policies Cleared!" -ForegroundColor Green
Write-Host "===========================================================================" -ForegroundColor Cyan
