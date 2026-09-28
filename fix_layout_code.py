import re

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's completely remove the resize handler we added earlier and rely solely on proper WinForms docking
if "private void MainForm_Resize(object sender, EventArgs e)" in content:
    # We need to remove the Resize method and the event hook
    content = re.sub(r'\s*private void MainForm_Resize.*?}\s*}', '', content, flags=re.DOTALL)
    content = content.replace("this.Resize += MainForm_Resize;\n            MainForm_Resize(null, null);", "")

# Now let's fix the Z-order explicitly in the Load method
layout_fix = """
            // Strict WinForms Layout Enforcement
            if (tabControlMain != null)
            {
                // Disable auto-docking to prevent overlap
                tabControlMain.Dock = DockStyle.None;
                
                // Set absolute anchors so it stretches when maximized
                tabControlMain.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
                
                // Position it exactly next to the sidebar and below the header
                int headerHeight = (panelHeader != null) ? panelHeader.Height : 65;
                tabControlMain.Location = new Point(200, headerHeight);
                
                // Calculate initial size
                int footerHeight = (statusStrip1 != null) ? statusStrip1.Height : 22;
                tabControlMain.Size = new Size(this.ClientSize.Width - 200, this.ClientSize.Height - headerHeight - footerHeight);
            }
"""

if "// Strict WinForms Layout Enforcement" not in content:
    content = content.replace("sidebar.BringToFront();", "sidebar.BringToFront();\n" + layout_fix)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Code file!")