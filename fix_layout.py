import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

# Find the Z-ordering block and replace it with manual sizing
z_order_block = """            // Proper Z-Ordering to ensure standard WinForms Docking works
            // Control sent to BACK is evaluated FIRST for docking.
            // Control brought to FRONT is evaluated LAST (Fill should be evaluated last).
            if (panelHeader != null) panelHeader.SendToBack(); // Takes top entirely
            sidebar.SendToBack(); // Takes left side of remaining area
            if (panelHeader != null) panelHeader.SendToBack(); // Ensure header is above sidebar in evaluation
            if (tabControlMain != null) tabControlMain.BringToFront(); // Takes remaining space"""

new_block = """            // Bulletproof Layout: Remove Docking and manually Anchor TabControl
            if (tabControlMain != null)
            {
                tabControlMain.Dock = DockStyle.None;
                int headerHeight = (panelHeader != null) ? panelHeader.Height : 65;
                tabControlMain.Location = new Point(200, headerHeight);
                tabControlMain.Size = new Size(this.ClientSize.Width - 200, this.ClientSize.Height - headerHeight - (statusStrip1 != null ? statusStrip1.Height : 22));
                tabControlMain.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
                tabControlMain.BringToFront();
            }
            if (panelHeader != null) panelHeader.SendToBack();
            sidebar.BringToFront();"""

content = content.replace(z_order_block, new_block)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
print("Fixed layout!")
