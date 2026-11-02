# E-Vedhika UBD Deployment Tool - Antivirus Whitelist & False Positive Auto-Unblocker
# Run as Administrator in PowerShell

# 1. Self-Elevate if needed
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Elevated Administrator Privileges Required! Restarting PowerShell as Administrator..."
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host "   E-VEDHIKA UBD DEPLOYMENT TOOL - ANTIVIRUS & SMARTSCREEN WHITELISTER" -ForegroundColor Green
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host ""

# 2. Unblock File Streams
Write-Host "[1/4] Unblocking downloaded files and executables..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue
Get-ChildItem -Path "C:\EVedhikaUBD" -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue

# 3. Add Defender Exclusions
Write-Host "[2/4] Adding Windows Defender exclusions..." -ForegroundColor Yellow
$currentDir = (Get-Item -Path ".").FullName
Add-MpPreference -ExclusionPath $currentDir -ErrorAction SilentlyContinue
Add-MpPreference -ExclusionPath "C:\EVedhikaUBD" -ErrorAction SilentlyContinue
Add-MpPreference -ExclusionProcess "EVedhikaUBDDeploymentTool.exe" -ErrorAction SilentlyContinue
Add-MpPreference -ExclusionProcess "EVedhikaAutoRepair.exe" -ErrorAction SilentlyContinue

# 4. Set Execution Policy
Write-Host "[3/4] Setting PowerShell ExecutionPolicy to Bypass..." -ForegroundColor Yellow
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope LocalMachine -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] E-Vedhika has been added to Windows Security and System Exclusions!" -ForegroundColor Green
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host ""
Read-Host -Prompt "Press Enter to exit"
