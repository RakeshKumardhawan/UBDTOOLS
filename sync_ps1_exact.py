import re

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

SETTING_NAMES = {
    "1001": "Download signed ActiveX controls",
    "1004": "Download unsigned ActiveX controls",
    "1200": "Run ActiveX controls and plug-ins",
    "1201": "Initialize and script ActiveX not marked safe",
    "1206": "Allow scripting of Microsoft web browser control",
    "1208": "Allow previously unused ActiveX controls",
    "1209": "Scriptlets",
    "120A": "Display video and animation without external player",
    "120B": "Override SmartScreen filter for ActiveX",
    "1400": "Active scripting (JavaScript Execution)",
    "1402": "Scripting of Java applets",
    "1405": "Script ActiveX controls marked safe",
    "1406": "Access data sources across domains",
    "1407": "Allow Programmatic clipboard access",
    "1409": "Scripting of XSLT elements",
    "1604": "Font download",
    "1606": "Userdata persistence",
    "1607": "Navigate windows and frames across domains",
    "1608": "Allow META REFRESH",
    "1609": "Display mixed content (HTTP inside HTTPS)",
    "1802": "Drag and drop or copy and paste files",
    "1803": "File download",
    "1804": "Launching programs and files in an IFRAME",
    "1806": "Launching applications and unsafe files",
    "1809": "Use Pop-up Blocker",
    "2000": "Binary and script behaviors",
    "2001": "Run components signed with Authenticode / .NET",
    "2004": "Run components not signed with Authenticode",
    "2007": "Run components signed with Authenticode (Secondary)",
    "2100": "Open files based on content (MIME Sniffing)",
    "2102": "Script-initiated windows without constraints",
    "2103": "Allow status bar updates via script",
    "2104": "Allow websites to open windows without address/status",
    "2105": "Allow scripted prompt windows",
    "2201": "Automatic prompting for ActiveX controls",
    "2300": "Web sites in less privileged zone navigation",
    "2301": "Use SmartScreen Filter",
    "2400": ".NET Framework: XAML browser applications",
    "2401": ".NET Framework: XPS documents",
    "2402": ".NET Framework: Loose XAML",
    "2600": "Enable .NET Framework setup",
    "2702": "ActiveX Filtering",
    "2708": "Allow approved domains to use ActiveX",
    "2709": "Run Antimalware against ActiveX",
    "1A00": "User Authentication Logon",
    "1A04": "Don't prompt for client certificate selection"
}

def get_ps1_val(zone_id, key):
    if key == "2001":
        return 3
    elif key == "1A00":
        return 0x20000
    elif key == "1804":
        return 1 if zone_id == 1 else 0
    else:
        return 0

ps1_lines = []
for zone_id, zone_name in [(1, "Local Intranet"), (2, "Trusted Sites"), (3, "Internet")]:
    flags = "0xdb" if zone_id == 1 else ("0x47" if zone_id == 2 else "1")
    ps1_lines.append(f'    # ==========================================')
    ps1_lines.append(f'    # ZONE {zone_id}: {zone_name.upper()}')
    ps1_lines.append(f'    # ==========================================')
    ps1_lines.append(f'    @{{ ZoneId={zone_id}; ZoneName="{zone_name}"; ID="CurrentLevel"; Name="Zone Security Level (Custom)"; Value=0; Desc="Sets zone security template to 0 (Custom Level)" }},')
    ps1_lines.append(f'    @{{ ZoneId={zone_id}; ZoneName="{zone_name}"; ID="Flags";        Name="Zone Capabilities & Flags"; Value={flags}; Desc="{zone_name} Zone base permissions" }},')
    if zone_id in (1, 2):
        ps1_lines.append(f'    @{{ ZoneId={zone_id}; ZoneName="{zone_name}"; ID="MinLevel";     Name="Minimum Security Level Allowed"; Value=0x10000; Desc="Minimum level allowed" }},')

    for k in user_keys:
        val = get_ps1_val(zone_id, k)
        val_str = f"0x{val:x}" if val == 0x20000 else str(val)
        name = SETTING_NAMES[k]
        desc = "Disabled per exact user specification (3 = Disable)" if val == 3 else f"{name} (Value = {val_str})"
        ps1_lines.append(f'    @{{ ZoneId={zone_id}; ZoneName="{zone_name}"; ID="{k}"; Name="{name}"; Value={val_str}; Desc="{desc}" }},')

# Remove trailing comma on last item
if ps1_lines[-1].endswith(','):
    ps1_lines[-1] = ps1_lines[-1][:-1]

ps1_block = '\n'.join(ps1_lines)

with open('public/scripts/Configure_UBD_Registry.ps1', 'r') as f:
    text = f.read()

pattern = r'\$SettingsCatalog = @\(.*?\n\)'
new_catalog = f'$SettingsCatalog = @(\n{ps1_block}\n)'

text = re.sub(pattern, lambda m: new_catalog, text, flags=re.DOTALL)

with open('public/scripts/Configure_UBD_Registry.ps1', 'w') as f:
    f.write(text)

print("Updated Configure_UBD_Registry.ps1 with exact user catalog!")
