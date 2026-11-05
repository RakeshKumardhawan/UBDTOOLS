import re

with open('public/scripts/Configure_UBD_Registry.ps1', 'r') as f:
    text = f.read()

# In $SettingsCatalog, for any item in Zone 1, 2, 3:
# if ID == "2001": Value = 3
# else if ID in ["Flags", "CurrentLevel", "MinLevel"]: keep flag value
# else: Value = 0

def replace_ps1_item(m):
    zone_id = m.group(1)
    zone_name = m.group(2)
    item_id = m.group(3)
    name = m.group(4)
    old_val = m.group(5)
    desc = m.group(6)

    if item_id == "2001":
        new_val = "3"
        desc = "Disabled per exact user specification (3 = Disable)"
    elif item_id == "CurrentLevel":
        new_val = "0"
    elif item_id == "MinLevel":
        new_val = "0x10000"
    elif item_id == "Flags":
        new_val = "0xdb" if zone_id == "1" else ("0x47" if zone_id == "2" else "1")
    else:
        new_val = "0"

    return f'@{{ ZoneId={zone_id}; ZoneName="{zone_name}"; ID="{item_id}"; Name="{name}"; Value={new_val}; Desc="{desc}" }}'

ps1_item_pat = r'@\{\s*ZoneId=(\d+);\s*ZoneName="([^"]+)";\s*ID="([^"]+)";\s*Name="([^"]+)";\s*Value=([^;]+);\s*Desc="([^"]+)"\s*\}'
text = re.sub(ps1_item_pat, replace_ps1_item, text)

with open('public/scripts/Configure_UBD_Registry.ps1', 'w') as f:
    f.write(text)

print("Updated Configure_UBD_Registry.ps1 successfully!")
