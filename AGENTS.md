# Project Rules & System Instructions

## 1. Central Live Telemetry & Reporting Rules
- Every C# tool execution automatically posts execution status to the central web server endpoint: `https://www.e-vedhika.in/api/telemetry`.
- The web app displays a real-time Central Cloud Telemetry Dashboard under "Backups & Central Cloud Logs" so administrators can view execution status across all Grama Panchayat & Mandal office computers without needing to visit each PC physically.
- When generating reports, capture PC Name, Office Location, Execution Timestamp, Status (15/15), and Summary.

## 2. Browser Routing & Domain Rules
- **UBD Government Portal (`ubd.telangana.gov.in`)**: Configured specifically for Microsoft Edge Enterprise Site List under IE5 Quirks Mode with ActiveX & USB DSC Token support.
- **E-Vedhika Main Web App (`www.e-vedhika.in`)**: Strictly EXCLUDED from IE Mode policies. Must open in the user's default modern web browser (Google Chrome, Mozilla Firefox, or standard Edge).

## 3. C# Executable Build & Download Rules
- The C# WinForms solution files reside in `/csharp_solution/EVedhikaUBDDeploymentTool`.
- Whenever C# code or deployment configurations change, regenerate the zip archive at `public/EVedhikaUBDDeploymentTool_CSharp_Solution.zip` using `node update_csharp_view.cjs` and `python3 -c "import shutil; shutil.make_archive(...)"`.
