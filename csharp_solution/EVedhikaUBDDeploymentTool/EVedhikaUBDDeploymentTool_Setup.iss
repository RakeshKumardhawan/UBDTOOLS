#define MyAppName "E-Vedhika UBD Tool"
#define MyAppVersion "1.0.6"
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
; Copy all build outputs for .NET Framework 4.8
Source: "bin\Release\net48\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "Payload\*"; DestDir: "{app}\Payload"; Flags: ignoreversion recursesubdirs createallsubdirs; Permissions: users-readexec
Source: "installers\vc_redist.x86.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall skipifsourcedoesntexist
Source: "installers\ndp48-x86-x64-allos-enu.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall skipifsourcedoesntexist
Source: "installers\*"; DestDir: "{app}\Installers"; Flags: ignoreversion recursesubdirs createallsubdirs; Permissions: users-readexec

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{tmp}\ndp48-x86-x64-allos-enu.exe"; Parameters: "/q /norestart"; StatusMsg: "Ensuring .NET Framework 4.8 is installed (Required for Windows 7/8)..."; Check: NeedsDotNet48
Filename: "{tmp}\vc_redist.x86.exe"; Parameters: "/quiet /norestart"; StatusMsg: "Installing System Components (Fixing missing DLLs for Windows 7)..."; Check: NeedsVCRedist
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent shellexec

[UninstallDelete]
Type: files; Name: "{commondesktop}\{#MyAppName}.lnk"
Type: files; Name: "{group}\{#MyAppName}.lnk"

[Code]
function IsWin7SP1OrHigher: Boolean;
var
  Version: TWindowsVersion;
begin
  GetWindowsVersionEx(Version);
  // Windows 7 is Major 6, Minor 1
  if (Version.Major = 6) and (Version.Minor = 1) then
  begin
    // Check for Service Pack 1 (ServicePackMajor should be 1)
    Result := Version.ServicePackMajor >= 1;
  end
  else
  begin
    // For Windows 8 (6.2), 8.1 (6.3), 10 (10.0), 11 (10.0) etc
    Result := (Version.Major > 6) or ((Version.Major = 6) and (Version.Minor > 1));
  end;
end;

function InitializeSetup: Boolean;
begin
  Result := True;
  if not IsWin7SP1OrHigher then
  begin
    if MsgBox('⚠️ Windows 7 Service Pack 1 (SP1) is required for this tool.' + #13#10#13#10 +
              'మీ పీసీలో Windows 7 SP1 అప్‌డేట్ లేదు. దయచేసి SP1 ఇన్‌స్టాల్ చేసి మళ్లీ ప్రయత్నించండి.' + #13#10#13#10 +
              'Do you want to continue anyway?', mbConfirmation, MB_YESNO) = IDNO then
    begin
      Result := False;
    end;
  end;
end;

function NeedsDotNet48: Boolean;
var
  v: Cardinal;
begin
  if not FileExists(ExpandConstant('{tmp}\ndp48-x86-x64-allos-enu.exe')) then
  begin
    Result := False;
    Exit;
  end;

  // Windows 10 (Build >= 10240) and Windows 11 already include .NET 4.6/4.8 natively
  if GetWindowsVersion >= $0A000000 then
  begin
    Result := False;
    Exit;
  end;

  // Check 64-bit and 32-bit registry hives for .NET Framework 4.8 (Release value 528040 or higher)
  if RegQueryDWordValue(HKLM64, 'SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full', 'Release', v) or
     RegQueryDWordValue(HKLM, 'SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full', 'Release', v) or
     RegQueryDWordValue(HKLM, 'SOFTWARE\WOW6432Node\Microsoft\NET Framework Setup\NDP\v4\Full', 'Release', v) then
  begin
    if v >= 528040 then
    begin
      Result := False;
      Exit;
    end;
  end;

  Result := True;
end;

function NeedsVCRedist: Boolean;
begin
  Result := FileExists(ExpandConstant('{tmp}\vc_redist.x86.exe'));
end;
