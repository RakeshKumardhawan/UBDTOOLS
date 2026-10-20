@echo off
:: ============================================================================
:: E-Vedhika UBD Deployment Tool - 1-Click Clean System Revert Launcher
:: Target: Restores PC to original pre-installation state
:: Developer: E-Vedhika
:: ============================================================================
title E-Vedhika System Revert Launcher
color 0C

echo ======================================================================
echo    E-VEDHIKA UBD DEPLOYMENT TOOL - CLEAN SYSTEM REVERT LAUNCHER
echo    Restores all Registry, Zones, Edge Policies to Original State
echo ======================================================================
echo.

:: Check for Administrative Privileges and Auto-Elevate if needed
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrative Elevation for Complete System Revert...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /b
)

cd /d "%~dp0"
echo [1/2] Administrative privileges confirmed.
echo [2/2] Launching Revert_UBD_Settings.ps1 ...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Revert_UBD_Settings.ps1"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Revert process encountered an error (Exit Code: %errorlevel%).
    pause
    exit /b %errorlevel%
)

echo.
echo ======================================================================
echo  [SUCCESS] All E-Vedhika changes cleanly reverted to original state!
echo ======================================================================
echo.
pause
