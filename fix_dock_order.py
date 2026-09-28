import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    content = f.read()

new_layout = """
            // -------------------------------------------------------------
            // BULLETPROOF WINFORMS LAYOUT (GUARANTEED NO OVERLAP)
            // -------------------------------------------------------------
            
            // 1. Ensure all controls are in the form's Controls collection
            if (!this.Controls.Contains(sidebar)) this.Controls.Add(sidebar);
            if (tabControlMain != null && !this.Controls.Contains(tabControlMain)) this.Controls.Add(tabControlMain);

            // 2. Set Docks
            if (statusStrip1 != null) statusStrip1.Dock = DockStyle.Bottom;
            if (panelHeader != null) panelHeader.Dock = DockStyle.Top;
            sidebar.Dock = DockStyle.Left;
            if (tabControlMain != null) tabControlMain.Dock = DockStyle.Fill;

            // 3. ENFORCE Z-ORDER FOR DOCKING (Critical for no-overlap)
            // The last control SentToBack is evaluated FIRST for docking.
            
            sidebar.SendToBack();                 // Evaluated 3rd -> Claims Left edge (between Header and Footer)
            if (statusStrip1 != null) statusStrip1.SendToBack(); // Evaluated 2nd -> Claims full Bottom width
            if (panelHeader != null) panelHeader.SendToBack();   // Evaluated 1st -> Claims full Top width
            
            if (tabControlMain != null) tabControlMain.BringToFront(); // Evaluated LAST -> Fills remaining center space

            // Adjust header text for Hamburger
            if (panelHeader != null) {
                foreach(Control c in panelHeader.Controls) {
                    if (c is Label lbl && lbl.Location.X < 50) {
                        lbl.Location = new Point(70, lbl.Location.Y);
                    }
                }
            }

            // Hamburger Button
            Button btnMenuToggle = new Button();
            btnMenuToggle.Text = " ≡ ";
            btnMenuToggle.Font = new Font("Segoe UI", 16, FontStyle.Bold);
            btnMenuToggle.Size = new Size(45, 45);
            btnMenuToggle.Location = new Point(10, 10);
            btnMenuToggle.FlatStyle = FlatStyle.Flat;
            btnMenuToggle.FlatAppearance.BorderSize = 0;
            btnMenuToggle.BackColor = Color.Transparent;
            btnMenuToggle.ForeColor = Color.White;
            btnMenuToggle.Cursor = Cursors.Hand;
            btnMenuToggle.Anchor = AnchorStyles.Top | AnchorStyles.Left;

            bool isSidebarExpanded = true;
            btnMenuToggle.Click += (s, ev) => {
                isSidebarExpanded = !isSidebarExpanded;
                sidebar.Width = isSidebarExpanded ? 210 : 50;
                foreach (Control c in sidebar.Controls)
                {
                    if (c is Button b && b.Tag is TabPage) b.Text = isSidebarExpanded ? ((TabPage)b.Tag).Text : "";
                }
            };

            if (panelHeader != null)
            {
                panelHeader.Controls.Add(btnMenuToggle);
                btnMenuToggle.BringToFront();
            }
            // -------------------------------------------------------------
"""

content = re.sub(r'// -------------------------------------------------------------.*?// -------------------------------------------------------------', new_layout, content, flags=re.DOTALL)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied mathematically perfect Docking Z-Order!")
