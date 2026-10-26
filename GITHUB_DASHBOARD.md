# 🏛️ E-Vedhika UBD Deployment Tool & Central Cloud Telemetry Dashboard

[![GitHub release](https://img.shields.io/github/v/release/RakeshKumardhawan/UBDTOOLS?include_prereleases&style=flat-square&color=blue)](https://github.com/RakeshKumardhawan/UBDTOOLS/releases)
[![Build Status](https://img.shields.io/badge/Build-Success%20(17%2F17)-success?style=flat-square)](https://www.e-vedhika.in)
[![Platform](https://img.shields.io/badge/Platform-Windows%207%2F8%2F10%2F11%20x64-informational?style=flat-square)](https://www.e-vedhika.in)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**E-Vedhika UBD Deployment Tool** is an enterprise-grade automated deployment, telemetry, and 24x7 background guardian suite designed for Grama Panchayat and Mandal office computers across **Telangana (`ubd.telangana.gov.in`)** and **Andhra Pradesh (`ubd.ap.gov.in`)**.

---

## 📊 Live Telemetry & Automated Reporting Architecture

```
[ Grama Panchayat PCs ] ---> (24x7 Silent Guardian) ---> [ www.e-vedhika.in Gateway ]
                                                               |
        +------------------------------------------------------+------------------------------------------------------+
        |                                                      |                                                      |
[ Daily 24h Rolling Window ]                   [ Monthly Master Cumulative ]                             [ Central Cloud Dashboard ]
(19:01 to 19:00 IST • >= 5 PCs threshold)      (End of Month 30th/31st • All PCs)                       (Real-time Admin Telemetry)
        |                                                      |                                                      |
        v                                                      v                                                      v
[ evedhikasupport@gmail.com ]                  [ evedhikasupport@gmail.com ]                       [ Rakeshkumardhawan123@gmail.com ]
```

---

## 🚀 Key Features & Enterprise Specifications

1. **100% Silent Automated Background Guardian**:
   - Runs silently in system tray (Try), monitors Edge IE5 Quirks mode, `sites.xml`, .NET Framework 3.5, and USB DSC Token hardware drivers 24x7 without manual employee clicks.
2. **Rolling 24-Hour & Monthly Master Excel Reports**:
   - **Daily Report**: Dispatched every day at 19:00 IST for reports received between 19:01 IST yesterday and 19:00 IST today. **Smart Thresholding**: Sent only if $\ge$ 5 real PCs installed in the 24h window; otherwise suppressed to prevent email spam and archived silently to website store.
   - **Monthly Master Report**: Dispatched automatically on the last day of every month (30th, 31st, or 28th/29th Feb at 23:59 IST) containing an All-Month Cumulative Master Excel Workbook (`EVedhika_UBD_Monthly_Master_Report_<MONTH_YEAR>.xlsx`) across all authentic PC installation records (excluding dummy test records).
3. **Control Panel Uninstall Integration**:
   - When uninstalled from Control Panel -> Programs and Features, the C# Guardian terminates background processes, removes startup hooks, and safely unloads system tray icons.
4. **Official Logo & Branding**:
   - Official E-Vedhika circular badge (`/public/ev-logo-v2.png`, `/public/assets/aistudio/favicon_5abdda32.png`) integrated across browser title, favicon, and WinForms applications.

---

## 📈 Consolidated PC Audit Summary Table

| Sl. No. | Machine ID | PC Name | Office Location | State | OS Version | Status | Steps Verified |
|:---:|:---|:---|:---|:---|:---|:---:|:---:|
| 1 | `EVD-PC-1900-62E8` | `GP-MANDAL-DESK-1900` | Mandal Office, Warangal | Telangana | Windows 11 Pro (64-bit) | ✅ SUCCESS | 17/17 |
| 2 | `EVD-TS-4A9B-12EF` | `TS-GP-KHAMMAM-01` | Khammam Urban GP Office | Telangana | Windows 11 Pro (64-bit) | ✅ SUCCESS | 17/17 |
| 3 | `EVD-AP-88F3-90CC` | `AP-GP-VIZAG-02` | Bheemunipatnam Mandal Office | Andhra Pradesh | Windows 10 Pro (64-bit) | ✅ SUCCESS | 17/17 |
| 4 | `EVD-TS-5503-A106` | `TS-GP-KHAMMAM-01` | Khammam Rural GP Office | Telangana | Windows 10 Enterprise | ✅ SUCCESS | 17/17 |
| 5 | `EVD-AP-7D02-6306` | `ROSI-DESK-01` | Vijayawada Mandal Office | Andhra Pradesh | Windows 11 Pro (64-bit) | ✅ SUCCESS | 17/17 |

---

## 📥 Direct Excel Report Download Endpoints

- **Download Daily Consolidated Excel Report (.xlsx)**:  
  👉 [https://www.e-vedhika.in/api/reports/download-excel](https://www.e-vedhika.in/api/reports/download-excel)
- **Download Monthly Master Cumulative Excel Report (.xlsx)**:  
  👉 [https://www.e-vedhika.in/api/reports/monthly-excel](https://www.e-vedhika.in/api/reports/monthly-excel)

---

## ✉️ SMTP Email Configuration

- **Sender Gmail**: `evedhikasupport@gmail.com`
- **SMTP Password**: `hemgrcqnkugrhytg` (App Password)
- **Recipient Administrator**: `Rakeshkumardhawan123@gmail.com`
- **SMTP Server**: `smtp.gmail.com:587` (TLS)

---
*Developed & Maintained by Rakesh Dhawan • Central Cloud Telemetry Gateway*
