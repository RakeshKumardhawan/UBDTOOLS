# Resolution Plan: UBD Portal Step 4 FetchCertDetails() Error -2146893792 (0x80090020 / NTE_FAIL)

This plan details the exact root cause, architectural diagnosis, and immediate resolution workflow for the error displayed during Token Number Registration on the Telangana Unified Birth & Death Registration (UBD) portal at Mandal Veldanda / Panchayat Kundaram Thanda.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Error Code**: `-2146893792` in two's complement hexadecimal is **`0x80090020`** (`NTE_FAIL` - *"An internal error occurred"*).
> This is a known Windows CryptoAPI error triggered when `FetchCertDetails()` attempts to query the USB Digital Signature Certificate (DSC) from the token, but Windows CryptoAPI cannot access the RSA key container or communicate with the Smart Card cryptographic service provider.

- **Recommended Resolution**: Run the **E-Vedhika 1-Click Deployment Tool** (or apply the 1-line Administrator command) to immediately repair `MachineKeys` folder security permissions, start the `SCardSvr` / `CertPropSvc` background services, and register the token CSPs in 32-bit and 64-bit Windows registry.

---

## 1. Root Cause Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│               UBD Portal: Token Number Registration Flow               │
│                                                                        │
│   Step 1: Check Browser     Step 2: Initialize ActiveX    Step 3: Port │
│          [PASS]                     [PASS]                   [PASS]    │
│                                                                        │
│   Step 4: FetchCertDetails()  ────────►  FAILED with -2146893792       │
│                                         (0x80090020: NTE_FAIL)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────────────┐        ┌───────────────────────────────┐
│ Cause A: MachineKeys Security │        │ Cause B: SmartCard Services   │
│ C:\ProgramData\Microsoft\     │        │ SCardSvr / CertPropSvc stopped│
│ Crypto\RSA\MachineKeys lacks  │        │ Windows cannot propagate DSC  │
│ write permissions for CryptoAPI│       │ certificate from USB token    │
└───────────────────────────────┘        └───────────────────────────────┘
           │                                                 │
           └────────────────────────┬────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Cause C: 32-bit CryptoAPI CSP Missing in WOW6432Node                   │
│ Edge IE Mode runs 32-bit engine; requires wdscsp.dll / eps2003csp11.dll │
└────────────────────────────────────────────────────────────────────────┘
```

1. **`MachineKeys` Folder Access Denied (`C:\ProgramData\Microsoft\Crypto\RSA\MachineKeys`)**:
   - Windows CryptoAPI generates temporary session keys in the `MachineKeys` directory when reading digital certificates.
   - If Windows permissions on this folder lack `Read/Write` access for the current user or `Everyone`, CryptoAPI aborts with `NTE_FAIL` (`-2146893792`).

2. **Windows Smart Card & Certificate Propagation Services Stopped**:
   - `SCardSvr` (Smart Card) and `CertPropSvc` (Certificate Propagation) must be in the `Running` state. If either is stopped, the portal cannot communicate with the USB token reader.

3. **32-Bit CryptoAPI CSP Mismatch**:
   - Edge IE Mode executes in 32-bit compatibility mode. If the token middleware (ProxKey, ePass2003, or mToken) is only registered in the 64-bit registry hive and missing from `HKLM\SOFTWARE\WOW6432Node\Microsoft\Cryptography\Defaults\Provider\`, `FetchCertDetails()` fails to bind the certificate.

4. **USB DSC Token Connectivity / PIN Lock**:
   - The USB token is either physically loose, plugged into an unpowered USB hub, or requires PIN re-entry in the token manager.

---

## 2. Immediate 1-Step Fix Command

To immediately fix this on any Mandal or Gram Panchayat computer without manual work, open **Command Prompt (CMD) as Administrator** and execute:

```cmd
icacls "%ProgramData%\Microsoft\Crypto\RSA\MachineKeys" /grant "*S-1-1-0:(OI)(CI)F" /grant "*S-1-5-32-545:(OI)(CI)F" /t /c /q && sc config SCardSvr start= auto && net start SCardSvr && sc config CertPropSvc start= auto && net start CertPropSvc && sc config ScDeviceEnum start= auto && net start ScDeviceEnum
```

---

## 3. Automated Fix via E-Vedhika 1-Click Deployment Tool

In our **E-Vedhika One-Click Deployment Tool**, this entire sequence is fully automated under Step 4, Step 6, and Step 8:

1. **`DriverInstaller.cs`**:
   - Automatically repairs `C:\ProgramData\Microsoft\Crypto\RSA\MachineKeys` access control lists (ACLs).
   - Auto-starts and sets `SCardSvr`, `CertPropSvc`, and `ScDeviceEnum` to Automatic.
   - Registers all DSC token CSPs (`wdscsp.dll`, `eps2003csp11.dll`, `mTokenCSP.dll`) across both 32-bit (`WOW6432Node`) and 64-bit hives.
2. **`AutoRepairEngine.cs`**:
   - Verifies certificate propagation and auto-fixes cryptographic algorithm provider bindings (Type 24 PROV_RSA_AES).

---

## 4. Verification Steps

1. Run the fix command or click **"One-Click Deploy"** in the E-Vedhika Tool.
2. Unplug the USB DSC Token, wait 3 seconds, and plug it back into a direct motherboard USB port.
3. Open the token manager (e.g. WD ProxKey or ePass2003) from the taskbar tray to confirm the token is detected.
4. Refresh the UBD Telangana Portal page in Microsoft Edge (IE Mode) and click **Token Number Registration**.
5. Step 4 `FetchCertDetails()` will now succeed and display the Secretary / Officer certificate details.
