import os

def generate_zone_reg(zone_id, dword_dict):
    lines = []
    for k, v in dword_dict.items():
        v_hex = f"{v:08x}"
        lines.append(f'"{k}"=dword:{v_hex}')
    return '\n'.join(lines)

# Prepare dictionary for Zone 1, 2, 3
user_keys = [
    "1001", "1004", "1200", "1201", "1206", "1208", "1209", "120A", "120B",
    "1400", "1402", "1405", "1406", "1407", "1409",
    "1604", "1606", "1607", "1608", "1609",
    "1802", "1803", "1804", "1806", "1809",
    "2000", "2001", "2004", "2007",
    "2100", "2102", "2103", "2104", "2105",
    "2201", "2300", "2301",
    "2400", "2401", "2402", "2600",
    "2702", "2708", "2709",
    "1A00", "1A04"
]

def make_zone_dwords(zone_id):
    d = {}
    for k in user_keys:
        if k == "2001":
            d[k] = 3
        elif k == "1A00":
            d[k] = 0x20000
        elif k == "1804":
            d[k] = 1 if zone_id == 1 else 0
        else:
            d[k] = 0
    return d

z1_text = generate_zone_reg(1, make_zone_dwords(1))
z2_text = generate_zone_reg(2, make_zone_dwords(2))
z3_text = generate_zone_reg(3, make_zone_dwords(3))

reg_template = f"""Windows Registry Editor Version 5.00

; ==============================================================================
; E-VEDHIKA UBD DEPLOYMENT TOOL v2.0 - MASTER SECURITY ZONES REGISTRY
; STRICTLY CONFIGURED TO USER SPECIFICATION
; ==============================================================================

; ZoneMap Domain Mapping for Telangana UBD Portal
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

; ==============================================================================
; ZONE 0: MY COMPUTER
; ==============================================================================
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\0]
"DisplayName"="My Computer"
"CurrentLevel"=dword:00000000
"Flags"=dword:00000021
"1200"=dword:00000000
"1400"=dword:00000000
"2000"=dword:00000000
"2001"=dword:00000003
"2004"=dword:00000003

; ==============================================================================
; ZONE 1: LOCAL INTRANET ZONE
; ==============================================================================
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\1]
"DisplayName"="Local intranet"
"CurrentLevel"=dword:00000000
"MinLevel"=dword:00010000
"Flags"=dword:000000db
{z1_text}

; ==============================================================================
; ZONE 2: TRUSTED SITES ZONE
; ==============================================================================
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2]
"DisplayName"="Trusted sites"
"CurrentLevel"=dword:00000000
"MinLevel"=dword:00010000
"Flags"=dword:00000047
{z2_text}

; ==============================================================================
; ZONE 3: INTERNET ZONE
; ==============================================================================
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3]
"DisplayName"="Internet"
"CurrentLevel"=dword:00000000
"Flags"=dword:00000001
{z3_text}

; ==============================================================================
; ZONE 4: RESTRICTED SITES
; ==============================================================================
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

; ==============================================================================
; ZONE 2 HKLM MIRROR
; ==============================================================================
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2]
"DisplayName"="Trusted sites"
"CurrentLevel"=dword:00000000
"MinLevel"=dword:00010000
"Flags"=dword:00000047
{z2_text}

; ==============================================================================
; ADVANCED TAB & TLS CONFIGURATION
; ==============================================================================
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

[HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_LOCALMACHINE_LOCKDOWN]
"iexplore.exe"=dword:00000000
"msedge.exe"=dword:00000000

[HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\New Windows]
"PopupMgr"="no"

[HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\Main]
"TabProcGrowth"=dword:00000001
"DOMStorage"=dword:00000001

; ==============================================================================
; MICROSOFT EDGE ENTERPRISE SITE LIST POLICIES
; ==============================================================================
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Edge]
"InternetExplorerIntegrationLevel"=dword:00000001
"InternetExplorerIntegrationSiteList"="C:\\\\enterprise_compat\\\\sites.xml"
"InternetExplorerIntegrationReloadInIEModeAllowed"=dword:00000001

[HKEY_CURRENT_USER\\SOFTWARE\\Policies\\Microsoft\\Edge]
"InternetExplorerIntegrationLevel"=dword:00000001
"InternetExplorerIntegrationSiteList"="C:\\\\enterprise_compat\\\\sites.xml"
"InternetExplorerIntegrationReloadInIEModeAllowed"=dword:00000001
"""

for p in ['public/evedhika_master_zones.reg', 'csharp_solution/EVedhikaUBDDeploymentTool/Payload/Registry/evedhika_master_zones.reg']:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w') as f:
        f.write(reg_template)

print("Generated and written exact evedhika_master_zones.reg files successfully!")
