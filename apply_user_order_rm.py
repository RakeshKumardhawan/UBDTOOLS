import re

# 1. Update RegistryManager.cs
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'r') as f:
    text = f.read()

# Update GetZoneSettingsCatalog() in RegistryManager.cs
def replace_item(match):
    zone_id = match.group(1)
    zone_name = match.group(2)
    val_name = match.group(3)
    setting_name = match.group(4)
    old_val = match.group(5)
    desc = match.group(6)
    cat = match.group(7)

    if val_name == "2001":
        new_val = "3"
        desc = "Disabled per exact user specification (3 = Disable)"
    elif val_name == "CurrentLevel":
        new_val = "0"
    elif val_name == "MinLevel":
        new_val = "0x10000"
    elif val_name == "Flags":
        new_val = "0xdb" if zone_id == "1" else ("0x47" if zone_id == "2" else "1")
    else:
        new_val = "0"
        if "Disable" in desc:
            desc = desc.replace("Disable", "Enable")

    return f'catalog.Add(new ZoneSettingItem({zone_id}, "{zone_name}", "{val_name}", "{setting_name}", {new_val}, "{desc}", "{cat}"));'

item_pattern = r'catalog\.Add\(new ZoneSettingItem\((\d+),\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*([^,]+),\s*"([^"]+)",\s*"([^"]+)"\)\);'
text = re.sub(item_pattern, replace_item, text)

# In ConfigureActiveXAndTLS:
# Ensure 2001 is set to 3 in zone2Key
text = text.replace('zone2Key.SetValue("2001", 0, RegistryValueKind.DWord);', 'zone2Key.SetValue("2001", 3, RegistryValueKind.DWord); // Disabled per user order')
# Ensure other keys in zone2Key are 0 (e.g., 120B = 0, 1809 = 0, 2702 = 0, 2709 = 0)
text = text.replace('zone2Key.SetValue("120B", 3, RegistryValueKind.DWord);', 'zone2Key.SetValue("120B", 0, RegistryValueKind.DWord);')
text = text.replace('zone2Key.SetValue("1809", 3, RegistryValueKind.DWord);', 'zone2Key.SetValue("1809", 0, RegistryValueKind.DWord);')

# Also ensure in ApplyDirectZoneDwords that 2001 is explicitly set to 3 for zones 1, 2, 3
# and all others are set from item.ExpectedValue (which is now 0 for everything else, 3 for 2001).

with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'w') as f:
    f.write(text)

print("Updated RegistryManager.cs catalog and methods according to user order!")
