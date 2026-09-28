# E-Vedhika One-Click Deployment Tool - C# .NET 4.8 WinForms Solution

**Developer:** Rakesh Dhawan | E-Vedhika UBD Tool  
**Framework:** .NET Framework 4.8  
**UI Framework:** Windows Forms (WinForms)  
**IDE:** Visual Studio 2022  
**Output:** Native Windows Executable (`EVedhikaUBDDeploymentTool.exe`)

---

## 📁 Solution Structure

```text
csharp_solution/
├── evedhika_ubd.sln                                # Visual Studio 2022 Solution File
└── EVedhikaUBDDeploymentTool/
    ├── EVedhikaUBDDeploymentTool.csproj            # C# Project File (.NET Framework 4.8)
    ├── App.config                                  # Application Configuration XML
    ├── Program.cs                                  # Main Entry Point
    ├── MainForm.cs                                 # WinForms Window Code Logic
    ├── MainForm.Designer.cs                        # WinForms UI Layout & Controls
    ├── MainForm.resx                               # Form Resources
    ├── Engine/
    │   ├── RegistryManager.cs                      # C# Registry API Engine (Zone 2, ActiveX, TLS 1.2/1.3)
    │   ├── EdgePolicyEngine.cs                     # C# Microsoft Edge IE Mode Policy Writer
    │   ├── DriverInstaller.cs                      # USB DSC Token Driver Installer (ProxKey, HYP2003)
    │   ├── DiagnosticsEngine.cs                    # WMI & Port 8080 Service Scanner
    │   ├── BackupEngine.cs                         # .reg Registry Snapshot & Rollback Engine
    │   └── GeminiAiService.cs                      # AI Diagnostic Assistant
    └── Properties/
        ├── AssemblyInfo.cs                         # App Version, Company & Title Metadata
        └── Resources.resx                          # Project Embedded Resources
```

---

## 🛠️ How to Compile into Native Windows EXE using Visual Studio 2022

### Step 1: Download / Export Source Files
1. Export the project ZIP or clone the repository to your local Windows PC.
2. Open the `csharp_solution` folder.

### Step 2: Open Solution in Visual Studio 2022
1. Double click `evedhika_ubd.sln` to launch in **Visual Studio 2022**.
2. Ensure the `.NET Desktop Development` workload is installed in Visual Studio Installer (includes .NET Framework 4.8 Targeting Pack).

### Step 3: Build & Compile
1. In the top toolbar, select **Release** configuration and **Any CPU** (or **x64**).
2. Go to menu **Build** -> **Build Solution** (or press `Ctrl + Shift + B`).
3. Visual Studio will compile all `.cs` source code into a standalone native Windows executable:
   ```text
   csharp_solution/EVedhikaUBDDeploymentTool/bin/Release/EVedhikaUBDDeploymentTool.exe
   ```

### Step 4: Run as Administrator
Right-click `EVedhikaUBDDeploymentTool.exe` and select **Run as Administrator** to allow the tool to write HKEY_LOCAL_MACHINE Edge Group Policies, install USB drivers, and write Zone 2 Internet Settings.

---

## 🔑 C# Features Included
- **Automated 15-Step Deployment Engine:** Pure C# background worker executing registry keys, Edge policy site lists, token driver installation, and security certificate enrollment.
- **Registry Engine (`RegistryManager.cs`):** Win32 Registry API manipulation for Zone 2 trusted sites, ActiveX unsafe scripting permissions, and TLS 1.2/1.3 protocol DWORDs.
- **Edge Policy Engine (`EdgePolicyEngine.cs`):** Auto-generates `sites.xml` Enterprise Site List XML and configures `SOFTWARE\Policies\Microsoft\Edge\InternetExplorerIntegrationLevel`.
- **Diagnostics Engine (`DiagnosticsEngine.cs`):** WMI management queries and TCP client socket checks on `127.0.0.1:8080` for NIC DigiSigner WebSocket bridge.
- **Backup & Rollback (`BackupEngine.cs`):** Invokes native `reg.exe export` to generate timestamped `.reg` restore points before registry writes.
- **AI Troubleshooter (`GeminiAiService.cs`):** Integrated C# AI Assistant providing root cause resolution for ActiveX 0x800A01AD and DSC Token errors.
