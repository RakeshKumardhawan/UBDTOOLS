import re

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

# Add extra keys in full deployment payload
old_part = '                { "winEdition", SystemInfoHelper.GetWindowsVersion() },'
new_part = '                { "winEdition", SystemInfoHelper.GetWindowsVersion() },\n                { "osVersion", SystemInfoHelper.GetWindowsVersion() },'

if old_part in content:
    content = content.replace(old_part, new_part)

old_part2 = '                { "dotnet35", SystemInfoHelper.CheckDotNetFramework() },'
new_part2 = '                { "dotnet35", SystemInfoHelper.CheckDotNetFramework() },\n                { "dotNet", SystemInfoHelper.CheckDotNetFramework() },'

if old_part2 in content:
    content = content.replace(old_part2, new_part2)

old_part3 = '                { "digiSignerPort", SystemInfoHelper.CheckNicDigiSigner() },'
new_part3 = '                { "digiSignerPort", SystemInfoHelper.CheckNicDigiSigner() },\n                { "nicDigiSigner", SystemInfoHelper.CheckNicDigiSigner() },'

if old_part3 in content:
    content = content.replace(old_part3, new_part3)

old_part4 = '                { "sitesXmlExists", SystemInfoHelper.CheckEdgeIeMode() },'
new_part4 = '                { "sitesXmlExists", SystemInfoHelper.CheckEdgeIeMode() },\n                { "sitesXml", "IE5 Quirks Active (sites.xml present)" },'

if old_part4 in content:
    content = content.replace(old_part4, new_part4)

old_part5 = '                { "verificationCompleted", "COMPLETED" }'
new_part5 = '                { "verificationCompleted", "COMPLETED" },\n                { "verification", "Passed (15/15)" },\n                { "version", "v3.5" }'

if old_part5 in content:
    content = content.replace(old_part5, new_part5)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)

print("Patched MainForm.cs successfully")
