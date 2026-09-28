import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

restore_code = """            this.ForeColor = textPrimary;

            if (panelHeader != null)
            {
                panelHeader.BackColor = Color.FromArgb(2, 6, 23); // slate-950
                panelHeader.ForeColor = textPrimary;
            }
            if (tabControlMain != null)
            {
                // Remove ugly tab borders
                tabControlMain.Appearance = TabAppearance.FlatButtons;
                tabControlMain.ItemSize = new Size(0, 1);
                tabControlMain.SizeMode = TabSizeMode.Fixed;
            }
"""

content = content.replace("this.ForeColor = textPrimary;", restore_code)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
print("Styling restored!")
