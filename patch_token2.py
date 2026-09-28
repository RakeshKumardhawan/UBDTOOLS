import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/DiagnosticsEngine.cs', 'r') as f:
    content = f.read()

old_code = """                            // Exclude generic OS virtual drivers, root hubs, and Microsoft built-in virtual readers
                            if (name.Contains("VIRTUAL") || description.Contains("VIRTUAL") || deviceId.Contains("ROOT\\\\") || name.Contains("MICROSOFT SMART CARD") || description.Contains("MICROSOFT SMART CARD"))
                                continue;"""

new_code = """                            // Exclude generic OS virtual drivers, root hubs
                            if (name.Contains("VIRTUAL") || description.Contains("VIRTUAL") || deviceId.Contains("ROOT\\\\"))
                                continue;"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/DiagnosticsEngine.cs', 'w') as f:
    f.write(content)
