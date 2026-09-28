import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

# Replace the bodyPanel layout logic with TableLayoutPanel
old_logic = """            // Move sidebar and tab control to the body panel
            if (tabControlMain != null) bodyPanel.Controls.Add(tabControlMain);
            bodyPanel.Controls.Add(sidebar);

            sidebar.Dock = DockStyle.Left;
            if (tabControlMain != null) 
            {
                tabControlMain.Dock = DockStyle.Fill;
                tabControlMain.Margin = new Padding(0);
            }

            // Proper Z-Order within body panel
            sidebar.SendToBack(); // Takes left edge first
            if (tabControlMain != null) tabControlMain.BringToFront(); // Fills the rest"""

new_logic = """            // Table Layout - 100% Bulletproof no overlap
            TableLayoutPanel tlp = new TableLayoutPanel();
            tlp.Dock = DockStyle.Fill;
            tlp.RowCount = 1;
            tlp.ColumnCount = 2;
            tlp.Margin = new Padding(0);
            tlp.Padding = new Padding(0);
            tlp.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 200F));
            tlp.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            
            bodyPanel.Controls.Add(tlp);
            
            sidebar.Dock = DockStyle.Fill;
            sidebar.Margin = new Padding(0);
            tlp.Controls.Add(sidebar, 0, 0);

            if (tabControlMain != null)
            {
                tabControlMain.Dock = DockStyle.Fill;
                tabControlMain.Margin = new Padding(0);
                tlp.Controls.Add(tabControlMain, 1, 0);
            }"""

content = content.replace(old_logic, new_logic)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
print("TableLayoutPanel injected!")
