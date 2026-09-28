import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.Designer.cs', 'r') as f:
    content = f.read()

# Make sure tabControlMain has Anchor set correctly in the designer
if "this.tabControlMain.Anchor =" not in content:
    anchor_str = "            this.tabControlMain.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) \\n            | System.Windows.Forms.AnchorStyles.Left) \\n            | System.Windows.Forms.AnchorStyles.Right)));"
    content = content.replace("this.tabControlMain.Name = \"tabControlMain\";", anchor_str + "\n            this.tabControlMain.Name = \"tabControlMain\";")

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.Designer.cs', 'w') as f:
    f.write(content)
print("Updated Designer file!")
