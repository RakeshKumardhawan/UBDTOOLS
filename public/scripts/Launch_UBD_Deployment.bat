@echo off
:: ============================================================================
:: E-Vedhika One-Click Launcher for UBD Telangana Registry Configuration
:: Developed by Rakesh Dhawan | Target: https://ubd.telangana.gov.in/
:: ============================================================================

title E-Vedhika UBD Registry Automation Launcher
color 0B

echo ======================================================================
echo    E-VEDHIKA ONE-CLICK UBD REGISTRY CONFIGURATION LAUNCHER
echo    Target: https://ubd.telangana.gov.in/
echo ======================================================================
echo.

:: Check for Administrative Privileges and Auto-Elevate if needed
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrative Elevation...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /b
)

:: Current Directory of the Batch File
cd /d "%~dp0"

echo [1/3] Administrative privileges confirmed.
echo [2/3] Bypassing PowerShell execution restriction for deployment script...
echo [3/3] Launching Configure_UBD_Registry.ps1 ...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Configure_UBD_Registry.ps1"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] An error occurred during PowerShell execution (Exit Code: %errorlevel%).
    echo Please check the error message above.
    pause
    exit /b %errorlevel%
)

echo.
echo ======================================================================
echo  [SUCCESS] All UBD Registry settings configured and verified!
echo  Audit Report has been saved to C:\EVedhika_UBD_Backups\
echo ======================================================================
echo.
pause
