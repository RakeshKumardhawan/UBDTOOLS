import re

# Update evedhika_master_zones.reg in both places
for reg_path in ['public/evedhika_master_zones.reg', 'csharp_solution/EVedhikaUBDDeploymentTool/Payload/Registry/evedhika_master_zones.reg']:
    with open(reg_path, 'r') as f:
        text = f.read()

    # In Zones 1, 2, 3: set 2001 to 3, all other DWORDs to 0
    # Let's process section by section
    sections = re.split(r'(\n\[.*?\]\n)', text)
    new_sections = []
    current_header = ""
    for part in sections:
        if part.strip().startswith('['):
            current_header = part.strip()
            new_sections.append(part)
        else:
            if any(z in current_header for z in [r'Zones\1', r'Zones\2', r'Zones\3']):
                lines = part.split('\n')
                new_lines = []
                for line in lines:
                    m = re.match(r'^"([^"]+)"=dword:([0-9a-fA-F]+)(.*)$', line.strip())
                    if m:
                        key_name = m.group(1)
                        comment = m.group(3)
                        if key_name == "2001":
                            new_lines.append(f'"{key_name}"=dword:00000003{comment}')
                        elif key_name in ["Flags", "CurrentLevel", "MinLevel"]:
                            new_lines.append(line)
                        else:
                            new_lines.append(f'"{key_name}"=dword:00000000{comment}')
                    else:
                        new_lines.append(line)
                new_sections.append('\n'.join(new_lines))
            else:
                new_sections.append(part)

    with open(reg_path, 'w') as f:
        f.write(''.join(new_sections))

print("Updated evedhika_master_zones.reg in both locations!")
