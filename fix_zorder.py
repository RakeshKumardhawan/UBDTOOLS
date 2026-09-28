import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's fix the docking order properly by clearing all docks and setting them in the correct sequence.
# Or better yet, we just add a TableLayoutPanel for the body to guarantee no overlap.
# Let's write a bulletproof layout script.

new_layout = """
            // -------------------------------------------------------------
            // BULLETPROOF WINFORMS LAYOUT (GUARANTEED NO OVERLAP)
            // -------------------------------------------------------------
            
            // 1. Remove controls from form to re-add them in strict order
            this.Controls.Remove(sidebar);
            if (tabControlMain != null) this.Controls.Remove(tabControlMain);
            if (panelHeader != null) this.Controls.Remove(panelHeader);
            if (statusStrip1 != null) this.Controls.Remove(statusStrip1);

            // 2. Set Docks
            if (statusStrip1 != null) statusStrip1.Dock = DockStyle.Bottom;
            if (panelHeader != null) panelHeader.Dock = DockStyle.Top;
            sidebar.Dock = DockStyle.Left;
            if (tabControlMain != null) tabControlMain.Dock = DockStyle.Fill;

            // 3. Add to Form in reverse order of evaluation (Top-most Z-order added first)
            // The last control added has the lowest Z-order (evaluated first for Docking)
            
            if (tabControlMain != null) this.Controls.Add(tabControlMain); // Evaluated last (Fill)
            this.Controls.Add(sidebar); // Evaluated 3rd (Claims Left)
            if (panelHeader != null) this.Controls.Add(panelHeader); // Evaluated 2nd (Claims Top)
            if (statusStrip1 != null) this.Controls.Add(statusStrip1); // Evaluated 1st (Claims Bottom)

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
                    if (c is Button b) b.Text = isSidebarExpanded ? ((TabPage)b.Tag).Text : "";
                }
            };

            if (panelHeader != null)
            {
                panelHeader.Controls.Add(btnMenuToggle);
                btnMenuToggle.BringToFront();
            }
            // -------------------------------------------------------------
"""

# Replace the previous layout code
content = re.sub(r'// -------------------------------------------------------------.*?// -------------------------------------------------------------', new_layout, content, flags=re.DOTALL)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied foolproof Control.Add sequence!")
