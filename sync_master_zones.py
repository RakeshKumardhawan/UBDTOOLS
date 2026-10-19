import os

# Generate evedhika_master_zones.reg content
reg_content = """Windows Registry Editor Version 5.00

; ==============================================================================
; E-VEDHIKA UBD DEPLOYMENT TOOL v2.0 - MASTER SECURITY ZONES & POLICIES REGISTRY
; Configured strictly for: https://ubd.telangana.gov.in/ (Telangana UBD Portal)
; Supports: Microsoft Edge IE Mode, IE5 Quirks Mode, ActiveX, DSC USB Tokens
; ==============================================================================

; 1. ZoneMap Domain Mapping for Telangana UBD Portal
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in\\ubd]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\ubd.telangana.gov.in]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in\\ubd]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\ubd.telangana.gov.in]
"https"=dword:00000002
"http"=dword:00000002
"*"=dword:00000002

; 2. Zone 0: My Computer (Local Machine Security & ActiveX Execution)
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\0]
"DisplayName"="My Computer"
"CurrentLevel"=dword:00000000
"Flags"=dword:00000021
"1200"=dword:00000000
"1400"=dword:00000000
"2000"=dword:00000000
"2001"=dword:00000003
"2004"=dword:00000003

; 3. Zone 1: Local Intranet (Permissive for Local Government Network & DSC)
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\1]
"DisplayName"="Local intranet"
"CurrentLevel"=dword:00000000
"MinLevel"=dword:00010000
"Flags"=dword:000000db
"1001"=dword:00000000
"1004"=dword:00000000
"1200"=dword:00000000
"1201"=dword:00000000
"1206"=dword:00000000
"1208"=dword:00000000
"1209"=dword:00000000
"120A"=dword:00000000
"120B"=dword:00000000
"1400"=dword:00000000
"1402"=dword:00000000
"1405"=dword:00000000
"1406"=dword:00000000
"1407"=dword:00000000
"1408"=dword:00000000
"1601"=dword:00000000
"1604"=dword:00000000
"1606"=dword:00000000
"1607"=dword:00000000
"1608"=dword:00000000
"1609"=dword:00000000
"160A"=dword:00000000
"1802"=dword:00000000
"1803"=dword:00000000
"1804"=dword:00000000
"1806"=dword:00000000
"1807"=dword:00000000
"1809"=dword:00000003
"1A00"=dword:00020000
"1A04"=dword:00000000
"1E05"=dword:00010000
"2000"=dword:00000000
"2001"=dword:00000000
"2004"=dword:00000000
"2007"=dword:00000003
"2100"=dword:00000000
"2101"=dword:00000000
"2102"=dword:00000000
"2103"=dword:00000000
"2104"=dword:00000000
"2105"=dword:00000000
"2200"=dword:00000000
"2201"=dword:00000000
"2300"=dword:00000000
"2301"=dword:00000003
"2400"=dword:00000000
"2401"=dword:00000000
"2402"=dword:00000000
"2500"=dword:00000003
"2600"=dword:00000000
"2702"=dword:00000000
"2707"=dword:00000000
"2708"=dword:00000000
"2709"=dword:00000000
"270B"=dword:00000003
"270C"=dword:00000000

; 4. Zone 2: Trusted Sites (Custom Level for UBD Portal & ActiveX/DSC Tokens)
; Flags = 0x47 enforces 'Require server verification (https:) for all sites in this zone'
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2]
"DisplayName"="Trusted sites"
"CurrentLevel"=dword:00000000
"MinLevel"=dword:00010000
"Flags"=dword:00000047
"1001"=dword:00000000
"1004"=dword:00000000
"1200"=dword:00000000
"1201"=dword:00000000
"1206"=dword:00000000
"1208"=dword:00000000
"1209"=dword:00000000
"120A"=dword:00000000
"120B"=dword:00000003
"1400"=dword:00000000
"1402"=dword:00000000
"1405"=dword:00000000
"1406"=dword:00000000
"1407"=dword:00000000
"1408"=dword:00000000
"1601"=dword:00000000
"1604"=dword:00000000
"1606"=dword:00000000
"1607"=dword:00000000
"1608"=dword:00000000
"1609"=dword:00000000
"160A"=dword:00000000
"1802"=dword:00000000
"1803"=dword:00000000
"1804"=dword:00000000
"1806"=dword:00000000
"1807"=dword:00000000
"1808"=dword:00000000
"1809"=dword:00000003
"1A00"=dword:00000000
"1A04"=dword:00000000
"1E05"=dword:00010000
"2000"=dword:00000000
"2001"=dword:00000000
"2004"=dword:00000000
"2100"=dword:00000000
"2101"=dword:00000000
"2102"=dword:00000000
"2103"=dword:00000000
"2104"=dword:00000000
"2105"=dword:00000000
"2200"=dword:00000000
"2201"=dword:00000000
"2300"=dword:00000000
"2301"=dword:00000003
"2400"=dword:00000000
"2401"=dword:00000000
"2402"=dword:00000000
"2500"=dword:00000003
"2702"=dword:00000003
"2708"=dword:00000000
"2709"=dword:00000003
"270B"=dword:00000003
"270C"=dword:00000000

; 5. Zone 3: Internet Zone (Strict Security: Unsigned ActiveX Blocked, Mixed Content Prompt)
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3]
"DisplayName"="Internet"
"CurrentLevel"=dword:00000000
"Flags"=dword:00000001
"1001"=dword:00000001
"1004"=dword:00000003
"1200"=dword:00000000
"1201"=dword:00000003
"1208"=dword:00000003
"1209"=dword:00000001
"120A"=dword:00000000
"1400"=dword:00000000
"1402"=dword:00000003
"1405"=dword:00000000
"1406"=dword:00000003
"1407"=dword:00000001
"1604"=dword:00000000
"1607"=dword:00000003
"1608"=dword:00000000
"1609"=dword:00000001
"160A"=dword:00000003
"1802"=dword:00000000
"1803"=dword:00000000
"1804"=dword:00000000
"1806"=dword:00000001
"1809"=dword:00000000
"1A00"=dword:00020000
"1A04"=dword:00000003
"1E05"=dword:00020000
"2000"=dword:00000000
"2001"=dword:00000000
"2004"=dword:00000003
"2100"=dword:00000000
"2102"=dword:00000003
"2103"=dword:00000003
"2200"=dword:00000003
"2201"=dword:00000000
"2301"=dword:00000000
"270B"=dword:00000003

; 6. Zone 4: Restricted Sites (High Security Sandbox)
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\4]
"DisplayName"="Restricted sites"
"CurrentLevel"=dword:00012000
"Flags"=dword:00000003
"1001"=dword:00000003
"1004"=dword:00000003
"1200"=dword:00000003
"1201"=dword:00000003
"1400"=dword:00000003
"1803"=dword:00000003

; 7. Zone 2 Machine-Level Sync (HKLM)
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2]
"DisplayName"="Trusted sites"
"CurrentLevel"=dword:00000000
"MinLevel"=dword:00010000
"Flags"=dword:00000047
"1001"=dword:00000000
"1004"=dword:00000000
"1200"=dword:00000000
"1201"=dword:00000000
"1400"=dword:00000000
"1803"=dword:00000000

; 8. Advanced Tab Security Settings (TLS 1.0, 1.1, 1.2, 1.3 & Certificate Validation Bypass)
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings]
"SecureProtocols"=dword:00002aa0
"CertificateRevocation"=dword:00000000
"PublisherRevocation"=dword:00000000
"WarnonBadCertRecving"=dword:00000000
"WarnOnZoneCrossing"=dword:00000000
"WarnOnPostRedirect"=dword:00000000
"AllowInvalidCertificates"=dword:00000001
"DisableCachingOfSSLPages"=dword:00000000
"SyncMode5"=dword:00000003
"CheckExeSignatures"="no"

; 9. FeatureControl - Allow active content in local files on My Computer
[HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_LOCALMACHINE_LOCKDOWN]
"iexplore.exe"=dword:00000000
"msedge.exe"=dword:00000000

; 10. Pop-up Blocker Disabled for Portal Automation
[HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\New Windows]
"PopupMgr"="no"

; 11. Internet Explorer Main Tab & DOM Storage
[HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\Main]
"TabProcGrowth"=dword:00000001
"DOMStorage"=dword:00000001

; 12. Microsoft Edge Enterprise Site List Policies (UBD Portal IE Mode)
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Edge]
"InternetExplorerIntegrationLevel"=dword:00000001
"InternetExplorerIntegrationSiteList"="C:\\\\enterprise_compat\\\\sites.xml"
"InternetExplorerIntegrationReloadInIEModeAllowed"=dword:00000001

[HKEY_CURRENT_USER\\SOFTWARE\\Policies\\Microsoft\\Edge]
"InternetExplorerIntegrationLevel"=dword:00000001
"InternetExplorerIntegrationSiteList"="C:\\\\enterprise_compat\\\\sites.xml"
"InternetExplorerIntegrationReloadInIEModeAllowed"=dword:00000001
"""

# Write to public/evedhika_master_zones.reg
with open('public/evedhika_master_zones.reg', 'w') as f:
    f.write(reg_content)

# Write to csharp_solution/EVedhikaUBDDeploymentTool/Payload/Registry/evedhika_master_zones.reg
os.makedirs('csharp_solution/EVedhikaUBDDeploymentTool/Payload/Registry', exist_ok=True)
with open('csharp_solution/EVedhikaUBDDeploymentTool/Payload/Registry/evedhika_master_zones.reg', 'w') as f:
    f.write(reg_content)

print('Updated evedhika_master_zones.reg in both locations successfully!')
