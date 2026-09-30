#define MyAppName "E-Vedhika UBD Tool"
#define MyAppVersion "1.0.3"
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
Source: "bin\Release\publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
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
function InitializeSetup: Boolean;
begin
  Result := True;
end;
