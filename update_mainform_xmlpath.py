with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

old_str = """{ "sitesXmlPath", @"C:\\EVedhika_UBD\\EdgeIEMode\\sites.xml" }"""
new_str = """{ "sitesXmlPath", Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika", "sites.xml") }"""

content = content.replace(old_str, new_str)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)

print("Updated sitesXmlPath in MainForm.cs")
