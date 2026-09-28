import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the old layout enforcement
content = re.sub(r'// Strict WinForms Layout Enforcement.*?sidebar\.BringToFront\(\);', '', content, flags=re.DOTALL)

# Remove the old hamburger code
content = re.sub(r'// 1\. హ్యాంబర్గర్ బటన్.*?btnMenuToggle\.BringToFront\(\);\s*}', '', content, flags=re.DOTALL)

new_code = """
            // -------------------------------------------------------------
            // BULLETPROOF Z-ORDER DOCKING (Fixes DPI & Resize Overlaps)
            // -------------------------------------------------------------
            
            // 1. Footer takes bottom
            if (statusStrip1 != null) {
                statusStrip1.Dock = DockStyle.Bottom;
                statusStrip1.SendToBack();
            }
            
            // 2. Header takes top
            if (panelHeader != null) {
                panelHeader.Dock = DockStyle.Top;
                panelHeader.SendToBack();
                
                // Move header text to the right to make room for Hamburger menu
                foreach(Control c in panelHeader.Controls) {
                    if (c is Label lbl && lbl.Location.X < 50) {
                        lbl.Location = new Point(70, lbl.Location.Y);
                    }
                }
            }
            
            // 3. Sidebar takes left (under header)
            sidebar.Width = 210;
            sidebar.Dock = DockStyle.Left;
            this.Controls.Add(sidebar);
            sidebar.BringToFront(); // Bring to front relative to everything except tabControl
            
            // 4. TabControl fills the remaining space exactly
            if (tabControlMain != null)
            {
                tabControlMain.Dock = DockStyle.Fill;
                tabControlMain.Margin = new Padding(0);
                tabControlMain.BringToFront(); // Lowest docking priority = fills remaining
            }

            // 5. Hamburger Button
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
                
                // Show/Hide text on buttons
                foreach (Control c in sidebar.Controls)
                {
                    if (c is Button b)
                    {
                        b.Text = isSidebarExpanded ? (string)b.Tag.GetType().GetProperty("Text").GetValue(b.Tag) : "";
                        // Tooltip could be added here for collapsed state
                    }
                }
            };

            if (panelHeader != null)
            {
                panelHeader.Controls.Add(btnMenuToggle);
                btnMenuToggle.BringToFront();
            }
            // -------------------------------------------------------------
"""

# Insert the new code right after setting up the sidebar properties
content = content.replace("this.Controls.Add(sidebar);", "this.Controls.Add(sidebar);\n" + new_code)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied perfect layout code!")
