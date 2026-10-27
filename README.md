# 🛡️ E-VEDHIKA UBD Enterprise Deployment & Guardian Platform (v1.0.8)

Official repository for **E-VEDHIKA UBD Enterprise Solution**, a comprehensive web management dashboard, server-side telemetry backend, and native C# WinForms deployment engine designed specifically for Grama Panchayat and Mandal offices across Telangana (`ubd.telangana.gov.in`) and Andhra Pradesh (`ubd.ap.gov.in`).

[![Framework](https://img.shields.io/badge/Framework-React_19_%7C_Vite_%7C_Express-blue.svg)](https://react.dev/)
[![C# .NET](https://img.shields.io/badge/C%23-.NET_Framework_4.8-purple.svg)](https://dotnet.microsoft.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38bdf8.svg)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Status-Production_Ready_v1.0.8-success.svg)](#)

---

## 🌟 Key Architecture & Highlights

### 1. 🖥️ Microsoft Edge Enterprise IE5 Quirks Mode Automation
- Configures **Enterprise Mode Site List** (`enterprise_mode_site_list.xml`) for government portals (`ubd.telangana.gov.in`, `ubd.ap.gov.in`).
- Automatically configures Internet Explorer Zone 2 (Trusted Sites), ActiveX controls, popup exceptions, and USB Digital Signature Certificate (DSC) Token drivers (`WD ProxKey` & `HYP2003`).

### 2. 🆔 Hardware Unique Workstation Identification
- Generates a **100% Unique Hardware Identifier** (`HW-EVD-XXXX-XXXX`) combining **BIOS Hardware UUID** (WMI `Win32_ComputerSystemProduct`), **Primary Network MAC Address**, and Computer Name.
- Solves MachineGuid duplication issues caused by cloned Windows disk images across Panchayat computers.

### 3. 📊 Central Cloud Telemetry & Anti-Spam Deduplication
- Every C# execution automatically logs status to central telemetry: `https://www.e-vedhika.in/api/telemetry`.
- Enforces a **Strict 1-Report-Per-PC Ever** Telegram dispatch lock to completely eliminate duplicate alert spam.
- Permanently blocks legacy test IDs (`62E8`, `MPO-PC`, `UNKNOWN-PC`) at the server level.

### 4. 🏷️ Device Identity QR Code Verification Card
- Integrated **`DeviceIdentityCard`** component with live QR code generator.
- Allows operators to **Print** or **Download HD PNG** hardware verification badges for workstation audit compliance.

### 5. 📈 Interactive Telemetry Dashboard
- Visualizes workstation deployment metrics using **Recharts** (Bar Charts, Pie Charts).
- Tracks component pass rates (Registry Shim, IE Mode Policy, DSC Token, .NET Runtime).
- Includes real-time search, status filtering, and an **Inspection Modal** for deep diagnostic logs.

### 6. ⚙️ Full-Stack & Native C# Integration
- **React Frontend**: Vite-powered SPA with Tailwind CSS v4 and Lucide icons.
- **Express Backend**: API proxies, telemetry logging, announcement publishing, and daily 7:00 PM IST Excel report scheduler.
- **C# WinForms Solution**: Located in `/csharp_solution/EVedhikaUBDDeploymentTool`, packaged into downloadable archive at `public/EVedhikaUBDDeploymentTool_CSharp_Solution.zip`.

---

## 📂 Repository Structure

```
.
├── csharp_solution/                     # Native C# WinForms Solution
│   ├── EVedhikaUBDDeploymentTool.sln   # Visual Studio Solution File
│   └── EVedhikaUBDDeploymentTool/      # Source Code & Engine Drivers
│       ├── Engine/                     # AutoRepair, EdgePolicy, SystemRepair Engines
│       ├── Helpers/                    # SystemInfoHelper, Logger, Telemetry
│       ├── Payload/                    # XML Site Lists, Registry REG files, Drivers
│       └── MainForm.cs                 # Main WinForms Interface
├── src/                                # React Frontend Source Code
│   ├── components/                     # UI Components
│   │   ├── DeviceIdentityCard.tsx      # Printable Hardware QR Verification Badge
│   │   ├── TelemetryDashboard.tsx      # Recharts System Health Dashboard
│   │   ├── SystemPanel.tsx             # Live Telemetry Console & Health Monitor
│   │   ├── Header.tsx                  # Top Header Bar & Device Identity Pill
│   │   ├── CSharpSolutionView.tsx      # Visual C# Code & Zip Download Hub
│   │   └── ...
│   ├── utils/                          # Hardware Identity & Utilities
│   └── App.tsx                         # Main Dashboard Router
├── server.ts                           # Express Server & Central Telemetry API
├── public/                             # Static Assets & Solution Archives
│   └── EVedhikaUBDDeploymentTool_CSharp_Solution.zip # C# Executable Package
├── AGENTS.md                           # Central Telemetry & Domain Rules
├── package.json                        # Node.js Dependencies & Scripts
└── README.md                           # Official Repository Documentation
```

---

## 🌐 Browser Routing & Domain Rules

- **Government Portal (`ubd.telangana.gov.in` / `ubd.ap.gov.in`)**: Configured specifically for Microsoft Edge Enterprise Site List under IE5 Quirks Mode with ActiveX & USB DSC Token support.
- **E-Vedhika Web App (`www.e-vedhika.in`)**: Strictly EXCLUDED from IE Mode policies. Opens in standard modern web browsers (Chrome, Firefox, Edge).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Visual Studio 2022** (optional, for C# WinForms development)

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rakeshkumardhawan/UBDTOOLS.git
   cd UBDTOOLS
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Start production server:**
   ```bash
   npm run start
   ```

---

## 🛠️ Regenerating C# Executable Solution Zip

Whenever changes are made to the C# WinForms codebase in `/csharp_solution`, execute:

```bash
node update_csharp_view.cjs
python3 -c "import shutil; shutil.make_archive('public/EVedhikaUBDDeploymentTool_CSharp_Solution', 'zip', 'csharp_solution')"
```

---

## 📄 License & Attribution

Developed for **E-Vedhika UBD Enterprise Solution** for Grama Panchayat & Mandal Office digital infrastructure management.
All rights reserved.
