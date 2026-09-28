import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    content = f.read()

# I will update the TableLayoutPanel column sizes since we used TLP in the previous step,
# increasing the sidebar column width from 200F to 240F to give it breathing room as requested by the user.

old_tlp = """            tlp.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 200F));"""
new_tlp = """            tlp.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 240F));"""

content = content.replace(old_tlp, new_tlp)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated TableLayoutPanel width to 240F!")
