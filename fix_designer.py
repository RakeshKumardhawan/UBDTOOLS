with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.Designer.cs', 'r') as f:
    content = f.read()

# Remove ANY Anchor or Docking properties from tabControlMain
lines = content.split('\n')
new_lines = []
for line in lines:
    if "this.tabControlMain.Dock =" in line: continue
    if "this.tabControlMain.Anchor =" in line: continue
    new_lines.append(line)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.Designer.cs', 'w') as f:
    f.write('\n'.join(new_lines))
print("Cleaned designer!")
