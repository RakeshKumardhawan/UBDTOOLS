[Setup]
AppName=E-Vedhika UBD Deployment Tool
AppVersion=1.0
DefaultDirName={pf}\E-Vedhika
DefaultGroupName=E-Vedhika
OutputDir=.\Output
OutputBaseFilename=EVedhika_Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=app.ico
WizardStyle=modern

[Files]
Source: "bin\Release\EVedhikaUBDDeploymentTool.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\E-Vedhika UBD Tool"; Filename: "{app}\EVedhikaUBDDeploymentTool.exe"
Name: "{commondesktop}\E-Vedhika UBD Tool"; Filename: "{app}\EVedhikaUBDDeploymentTool.exe"

[Run]
Filename: "{app}\EVedhikaUBDDeploymentTool.exe"; Description: "Launch E-Vedhika UBD Deployment Tool"; Flags: nowait postinstall skipifsilent shellexec
