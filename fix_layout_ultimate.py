import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

# Remove the old layout fixes
content = re.sub(r'// Strict WinForms Layout Enforcement.*?}\n', '', content, flags=re.DOTALL)
content = re.sub(r'// Bulletproof Layout:.*?}\n', '', content, flags=re.DOTALL)
content = re.sub(r'if \(panelHeader != null\).*?sidebar\.BringToFront\(\);', '', content, flags=re.DOTALL)

# Add the new container-based layout logic
container_logic = """
            // Ultimate Container-based Layout
            Panel bodyPanel = new Panel();
            bodyPanel.Dock = DockStyle.Fill;
            bodyPanel.BackColor = bgDark;
            this.Controls.Add(bodyPanel);

            // Move sidebar and tab control to the body panel
            bodyPanel.Controls.Add(tabControlMain);
            bodyPanel.Controls.Add(sidebar);

            sidebar.Dock = DockStyle.Left;
            if (tabControlMain != null) 
            {
                tabControlMain.Dock = DockStyle.Fill;
                tabControlMain.Margin = new Padding(0);
            }

            // Proper Z-Order within body panel
            sidebar.SendToBack(); // Takes left edge first
            if (tabControlMain != null) tabControlMain.BringToFront(); // Fills the rest

            // Proper Z-Order in main form
            if (panelHeader != null) 
            {
                panelHeader.Dock = DockStyle.Top;
                panelHeader.SendToBack();
            }
            if (statusStrip1 != null) 
            {
                statusStrip1.Dock = DockStyle.Bottom;
                statusStrip1.SendToBack();
            }
            bodyPanel.BringToFront(); // Fills the remaining middle area
"""

# Insert the logic after adding sidebar to controls
content = content.replace("this.Controls.Add(sidebar);", container_logic)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
print("Updated Code file with Container layout!")
