#define MyAppName "E-Vedhika UBD Tool"
#define MyAppVersion "1.0.1"
#define MyAppPublisher "E-Vedhika"
#define MyAppExeName "EVedhikaUBDDeploymentTool.exe"

[Setup]
AppId={{8A9C8F3E-4B2D-4C5A-9E7F-1D6B8A9C0D4F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={pf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableDirPage=no
DirExistsWarning=no
OutputDir=.\Output
OutputBaseFilename=EVedhika_Setup_v{#MyAppVersion}
Compression=lzma
SolidCompression=yes
SetupIconFile=app.ico
WizardStyle=modern
PrivilegesRequired=admin
UninstallDisplayName={#MyAppName}
CloseApplications=yes
CloseApplicationsFilter=*.exe

[Files]
; Copy all build outputs - supports both Release and Debug builds
Source: "bin\Release\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Payload\*"; DestDir: "{app}\Payload"; Flags: ignoreversion recursesubdirs createallsubdirs; Permissions: users-readexec
Source: "installers\*"; DestDir: "{app}\Installers"; Flags: ignoreversion recursesubdirs createallsubdirs; Permissions: users-readexec

[Registry]
Root: HKA; Subkey: "Software\E-Vedhika"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"; Flags: uninsdeletekeyifempty
Root: HKA; Subkey: "Software\E-Vedhika"; ValueType: string; ValueName: "Version"; ValueData: "{#MyAppVersion}"; Flags: uninsdeletekeyifempty

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent shellexec

[UninstallDelete]
Type: files; Name: "{commondesktop}\{#MyAppName}.lnk"
Type: files; Name: "{group}\{#MyAppName}.lnk"

[Code]
function IsDotNet45Installed: Boolean;
var
  Release: Cardinal;
begin
  Result := False;
  if RegQueryDWordValue(HKLM, 'SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full', 'Release', Release) then
  begin
    Result := Release >= 378389; // .NET 4.5 = 378389
  end;
end;

function InitializeSetup: Boolean;
begin
  Result := True;
  if not IsDotNet45Installed then
  begin
    // Just a warning instead of blocking if it's really old, 
    // but honestly 4.5 is on every Win8/10 PC already.
    if MsgBox('This tool needs .NET Framework 4.5 (standard in Windows). If the tool fails to open, please update Windows.' #13#13 'Do you want to continue?', mbConfirmation, MB_YESNO) = IDNO then
    begin
      Result := False;
    end;
  end;
end;
