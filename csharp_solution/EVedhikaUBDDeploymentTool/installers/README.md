# C# Deployment Tool - Offline Installers & Drivers Folder

This `installers` directory works automatically with `EVedhikaUBDDeploymentTool.exe`. Place your offline installer setups, drivers, and .NET Framework 3.5 packages here:

### 1. Custom Driver & Software Setups (.exe / .msi)
Place any of the following setup files directly inside this folder:
- `WD_PROXKey.exe` (ProxKey USB Token Driver)
- `HYP2003Setup_20250805.exe` or `HYP2003.exe` (HYP2003 DSC Driver)
- `NEW-NIC-AP-DIGISIGNER.msi` or any NIC DigiSigner `.msi`
- Any additional `.exe` or `.msi` files (the tool automatically detects and runs them silently)

### 2. .NET Framework 3.5 Offline Installer (sxs / CAB)
For offline Grama Panchayat PCs without internet access, copy the .NET 3.5 source files here:
- `installers\sxs\` folder containing `microsoft-windows-netfx3-ondemand-package.cab`
- OR place `microsoft-windows-netfx3-ondemand-package.cab` directly inside `installers\`

The C# tool automatically runs DISM command:
`dism.exe /online /enable-feature /featurename:NetFx3 /All /Source:"installers\sxs" /LimitAccess /NoRestart`

### 3. Microsoft Edge Browser Installer (For Stripped / Removed / Old Edge Systems)
If a system has Microsoft Edge removed, deleted by debloater tools, or running an outdated version without internet access:
- Place `MicrosoftEdgeSetup.exe` or `MicrosoftEdgeEnterpriseX64.msi` directly inside this `installers\` folder.
- `EVedhikaUBDDeploymentTool.exe` will automatically detect it and run a silent, background installation and configure IE5 Quirks Mode.

