import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

old_code = """            LogMessage("SYSTEM", $"Machine: {Environment.MachineName} | OS: {SystemInfoHelper.GetWindowsVersion()}");"""

new_code = """            LogMessage("SYSTEM", $"Machine: {Environment.MachineName} | OS: {SystemInfoHelper.GetWindowsVersion()}");
            LogMessage("SYSTEM", $"Windows Activation Status: {SystemInfoHelper.GetWindowsActivationStatus()}");"""

content = content.replace(old_code, new_code)

old_code_2 = """                { "winEdition", SystemInfoHelper.GetWindowsVersion() },
                { "winVersion", "22H2 / 21H2" },"""

new_code_2 = """                { "winEdition", SystemInfoHelper.GetWindowsVersion() },
                { "winActivation", SystemInfoHelper.GetWindowsActivationStatus() },"""

content = content.replace(old_code_2, new_code_2)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
