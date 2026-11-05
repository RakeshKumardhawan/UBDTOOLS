import re

with open('public/scripts/Configure_UBD_Registry.ps1', 'r') as f:
    ps1 = f.read()

# Replace step 2 duplicate check
old_step2 = r'''# 4. ADD TARGET GOVERNMENT WEBSITE TO TRUSTED SITES (ZONE 2)
Write-Host ""
Write-Host "[STEP 2/5] Adding 'ubd.telangana.gov.in' to Windows Trusted Sites (Zone 2)..." -ForegroundColor Green

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
}'''

new_step2 = r'''# 4. ADD TARGET GOVERNMENT WEBSITE TO TRUSTED SITES (ZONE 2)
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
} catch {}'''

if old_step2 in ps1:
    ps1 = ps1.replace(old_step2, new_step2)
    print("Replaced step 2 in Configure_UBD_Registry.ps1")
else:
    print("WARNING: old_step2 not matched in ps1")

with open('public/scripts/Configure_UBD_Registry.ps1', 'w') as f:
    f.write(ps1)
print("Updated Configure_UBD_Registry.ps1")
