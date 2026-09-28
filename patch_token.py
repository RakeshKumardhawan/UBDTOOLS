import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/DiagnosticsEngine.cs', 'r') as f:
    content = f.read()

old_code = """                            if (name.Contains("PROXKEY") || name.Contains("HYP2003") || name.Contains("EPASS2003") || name.Contains("WATCHDATA") || name.Contains("FEITIAN") || name.Contains("ENTERSAFE") || name.Contains("TRUSTKEY") || 
                                description.Contains("PROXKEY") || description.Contains("HYP2003") || description.Contains("EPASS2003") || description.Contains("WATCHDATA") || description.Contains("FEITIAN") ||
                                deviceId.Contains("VID_096E") || deviceId.Contains("VID_27C6") || deviceId.Contains("VID_0483") || deviceId.Contains("VID_2B59") || deviceId.Contains("VID_20A0"))"""

new_code = """                            if (name.Contains("PROXKEY") || name.Contains("HYP2003") || name.Contains("EPASS2003") || name.Contains("WATCHDATA") || name.Contains("FEITIAN") || name.Contains("ENTERSAFE") || name.Contains("TRUSTKEY") || name.Contains("HYPERSECU") || name.Contains("HYPERPKI") || name.Contains("TOKEN") || name.Contains("SMART CARD") || 
                                description.Contains("PROXKEY") || description.Contains("HYP2003") || description.Contains("EPASS2003") || description.Contains("WATCHDATA") || description.Contains("FEITIAN") || description.Contains("HYPERSECU") || description.Contains("SMART CARD") || description.Contains("TOKEN") ||
                                deviceId.Contains("VID_096E") || deviceId.Contains("VID_27C6") || deviceId.Contains("VID_0483") || deviceId.Contains("VID_2B59") || deviceId.Contains("VID_20A0") || deviceId.Contains("VID_09A5") || deviceId.Contains("VID_2581"))"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/DiagnosticsEngine.cs', 'w') as f:
    f.write(content)
