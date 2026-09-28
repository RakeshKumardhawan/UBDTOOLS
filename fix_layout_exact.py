import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """            // Ultimate Container-based Layout
            Panel bodyPanel = new Panel();
            bodyPanel.Dock = DockStyle.Fill;
            bodyPanel.BackColor = Color.FromArgb(15, 23, 42);
            this.Controls.Add(bodyPanel);

            // Table Layout - 100% Bulletproof no overlap
            TableLayoutPanel tlp = new TableLayoutPanel();
            tlp.Dock = DockStyle.Fill;
            tlp.RowCount = 1;
            tlp.ColumnCount = 2;
            tlp.Margin = new Padding(0);
            tlp.Padding = new Padding(0);
            tlp.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 240F));
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
            }

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
            bodyPanel.BringToFront(); // Fills the remaining middle area"""

new_block = """            sidebar.Width = 210;
            sidebar.Dock = DockStyle.Left;
            this.Controls.Add(sidebar);

            // Strict WinForms Layout Enforcement (As requested)
            if (tabControlMain != null)
            {
                // సైడ్బార్ వెడల్పు 210 కాబట్టి కంటెంట్ సరిగ్గా 210 తర్వాత ప్రారంభం కావాలి
                int sidebarWidth = 210;
                int headerHeight = (panelHeader != null) ? panelHeader.Height : 65;
                int footerHeight = (statusStrip1 != null) ? statusStrip1.Height : 22;

                tabControlMain.Dock = DockStyle.None;
                tabControlMain.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
                
                // లొకేషన్ మరియు సైజ్ ఖచ్చితంగా సెట్ చేయడం
                tabControlMain.Location = new Point(sidebarWidth, headerHeight);
                tabControlMain.Size = new Size(this.ClientSize.Width - sidebarWidth, this.ClientSize.Height - headerHeight - footerHeight);
                tabControlMain.BringToFront();
            }
            if (panelHeader != null) panelHeader.SendToBack();
            sidebar.BringToFront();
"""

content = content.replace("sidebar.Width = 200;", "")
content = content.replace(old_block, new_block)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied exact requested layout code!")
