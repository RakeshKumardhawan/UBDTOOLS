with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.Designer.cs', 'r') as f:
    content = f.read()

lines = content.split('\n')
new_lines = []
for line in lines:
    if "this.tabControlMain.Anchor" in line: continue
    if "this.tabControlMain.Dock" in line: continue
    if "this.tabControlMain.Location" in line: continue
    if "this.tabControlMain.Size" in line: continue
    new_lines.append(line)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.Designer.cs', 'w') as f:
    f.write('\n'.join(new_lines))
print("Cleaned Designer!")
