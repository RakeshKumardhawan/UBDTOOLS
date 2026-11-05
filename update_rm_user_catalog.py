import os
import re

# Mapping of setting descriptions
SETTING_NAMES = {
    "1001": ("Download signed ActiveX controls", "ActiveX"),
    "1004": ("Download unsigned ActiveX controls", "ActiveX"),
    "1200": ("Run ActiveX controls and plug-ins", "ActiveX"),
    "1201": ("Initialize and script ActiveX not marked safe", "ActiveX"),
    "1206": ("Allow scripting of Microsoft web browser control", "ActiveX"),
    "1208": ("Allow previously unused ActiveX controls", "ActiveX"),
    "1209": ("Scriptlets", "ActiveX"),
    "120A": ("Display video and animation without external player", "ActiveX"),
    "120B": ("Override SmartScreen filter for ActiveX", "ActiveX"),
    "1400": ("Active scripting (JavaScript Execution)", "Scripting"),
    "1402": ("Scripting of Java applets", "Scripting"),
    "1405": ("Script ActiveX controls marked safe", "ActiveX"),
    "1406": ("Access data sources across domains", "Security"),
    "1407": ("Allow Programmatic clipboard access", "Clipboard"),
    "1409": ("Scripting of XSLT elements", "Scripting"),
    "1604": ("Font download", "Downloads"),
    "1606": ("Userdata persistence", "Miscellaneous"),
    "1607": ("Navigate windows and frames across domains", "Navigation"),
    "1608": ("Allow META REFRESH", "Miscellaneous"),
    "1609": ("Display mixed content (HTTP inside HTTPS)", "Mixed Content"),
    "1802": ("Drag and drop or copy and paste files", "Miscellaneous"),
    "1803": ("File download", "Downloads"),
    "1804": ("Launching programs and files in an IFRAME", "Frames"),
    "1806": ("Launching applications and unsafe files", "Security"),
    "1809": ("Use Pop-up Blocker", "Pop-up Blocker"),
    "2000": ("Binary and script behaviors", "ActiveX"),
    "2001": ("Run components signed with Authenticode / .NET", ".NET"),
    "2004": ("Run components not signed with Authenticode", ".NET"),
    "2007": ("Run components signed with Authenticode (Secondary)", ".NET"),
    "2100": ("Open files based on content (MIME Sniffing)", "Downloads"),
    "2102": ("Script-initiated windows without constraints", "Windows"),
    "2103": ("Allow status bar updates via script", "Status Bar"),
    "2104": ("Allow websites to open windows without address/status", "Windows"),
    "2105": ("Allow scripted prompt windows", "Windows"),
    "2201": ("Automatic prompting for ActiveX controls", "ActiveX"),
    "2300": ("Web sites in less privileged zone navigation", "Navigation"),
    "2301": ("Use SmartScreen Filter", "SmartScreen"),
    "2400": (".NET Framework: XAML browser applications", ".NET"),
    "2401": (".NET Framework: XPS documents", ".NET"),
    "2402": (".NET Framework: Loose XAML", ".NET"),
    "2600": ("Enable .NET Framework setup", ".NET"),
    "2702": ("ActiveX Filtering", "ActiveX"),
    "2708": ("Allow approved domains to use ActiveX", "ActiveX"),
    "2709": ("Run Antimalware against ActiveX", "Security"),
    "1A00": ("User Authentication Logon", "Authentication"),
    "1A04": ("Don't prompt for client certificate selection", "Certificates")
}

ZONE_KEYS_ORDER = [
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

def get_expected_value(zone_id, key):
    if key == "2001":
        return 3
    elif key == "1A00":
        return 0x20000
    elif key == "1804":
        return 1 if zone_id == 1 else 0
    else:
        return 0

# 1. Update RegistryManager.cs GetZoneSettingsCatalog()
catalog_lines = []

for zone_id, zone_name in [(1, "Local Intranet"), (2, "Trusted Sites"), (3, "Internet")]:
    catalog_lines.append(f'            // ==========================================')
    catalog_lines.append(f'            // ZONE {zone_id}: {zone_name.upper()}')
    catalog_lines.append(f'            // ==========================================')
    catalog_lines.append(f'            catalog.Add(new ZoneSettingItem({zone_id}, "{zone_name}", "CurrentLevel", "Zone Security Level (Custom)", 0, "Sets zone security template to 0 (Custom Level)", "Zone Template"));')
    
    flags_val = "0xdb" if zone_id == 1 else ("0x47" if zone_id == 2 else "1")
    catalog_lines.append(f'            catalog.Add(new ZoneSettingItem({zone_id}, "{zone_name}", "Flags", "Zone Capabilities & Flags", {flags_val}, "{zone_name} Zone Flags", "Zone Flags"));')
    if zone_id in (1, 2):
        catalog_lines.append(f'            catalog.Add(new ZoneSettingItem({zone_id}, "{zone_name}", "MinLevel", "Minimum Security Level Allowed", 0x10000, "Minimum level for custom security template", "Zone Template"));')
    
    for k in ZONE_KEYS_ORDER:
        val = get_expected_value(zone_id, k)
        val_str = f"0x{val:x}" if val == 0x20000 else str(val)
        name, cat = SETTING_NAMES.get(k, (f"Setting {k}", "Security"))
        desc = "Disabled per exact user specification (3 = Disable)" if val == 3 else f"{name} (Value = {val_str})"
        catalog_lines.append(f'            catalog.Add(new ZoneSettingItem({zone_id}, "{zone_name}", "{k}", "{name}", {val_str}, "{desc}", "{cat}"));')

catalog_code = '\n'.join(catalog_lines) + '\n'

with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'r') as f:
    rm_text = f.read()

# Replace catalog body
catalog_pattern = r'GetZoneSettingsCatalog\(\)\s*\{\s*List<ZoneSettingItem> catalog = new List<ZoneSettingItem>\(\);.*?return catalog;\s*\}'
new_catalog_method = f'GetZoneSettingsCatalog()\n        {{\n            List<ZoneSettingItem> catalog = new List<ZoneSettingItem>();\n{catalog_code}            return catalog;\n        }}'

rm_text = re.sub(catalog_pattern, lambda m: new_catalog_method, rm_text, flags=re.DOTALL)

with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'w') as f:
    f.write(rm_text)

print("RegistryManager.cs updated with exact user catalog!")
