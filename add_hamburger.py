import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    content = f.read()

hamburger_code = """
            // 1. హ్యాంబర్గర్ బటన్ క్రియేట్ చేయడం (3 లైన్స్ సింబల్ '≡')
            Button btnMenuToggle = new Button();
            btnMenuToggle.Text = " ≡ ";
            btnMenuToggle.Font = new Font("Segoe UI", 14, FontStyle.Bold);
            btnMenuToggle.Size = new Size(45, 35);
            btnMenuToggle.Location = new Point(15, 12);
            btnMenuToggle.FlatStyle = FlatStyle.Flat;
            btnMenuToggle.FlatAppearance.BorderSize = 0;
            btnMenuToggle.BackColor = Color.FromArgb(30, 41, 59);
            btnMenuToggle.ForeColor = Color.White;
            btnMenuToggle.Cursor = Cursors.Hand;
            btnMenuToggle.Anchor = AnchorStyles.Top | AnchorStyles.Left;

            // బటన్ క్లిక్ చేసినప్పుడు సైడ్బార్ ఓపెన్/క్లోజ్ అయ్యేలా లాజిక్
            bool isSidebarExpanded = true;
            btnMenuToggle.Click += (s, ev) => {
                isSidebarExpanded = !isSidebarExpanded;
                if (isSidebarExpanded)
                {
                    sidebar.Width = 210;
                    // ట్యాబ్ కంట్రోల్ లొకేషన్ వెనక్కి సర్దుకోవడం
                    if (tabControlMain != null) 
                    {
                        tabControlMain.Location = new Point(210, tabControlMain.Location.Y);
                        tabControlMain.Size = new Size(this.ClientSize.Width - 210, tabControlMain.Size.Height);
                    }
                    // Show text on buttons
                    foreach (Control c in sidebar.Controls)
                    {
                        if (c is Button b)
                        {
                            b.TextAlign = ContentAlignment.MiddleLeft;
                        }
                    }
                }
                else
                {
                    sidebar.Width = 50; // కేవలం ఐకాన్స్ మాత్రమే కనిపించేలా చిన్నగా మారుతుంది
                    if (tabControlMain != null) 
                    {
                        tabControlMain.Location = new Point(50, tabControlMain.Location.Y);
                        tabControlMain.Size = new Size(this.ClientSize.Width - 50, tabControlMain.Size.Height);
                    }
                    // Hide text on buttons if needed, here just keeping it simple
                    foreach (Control c in sidebar.Controls)
                    {
                        if (c is Button b)
                        {
                            b.TextAlign = ContentAlignment.MiddleCenter; // Just shift align if we had icons
                        }
                    }
                }
            };

            // హెడర్లో లేదా ఫామ్లో ఈ బటన్ను యాడ్ చేయండి
            if (panelHeader != null)
            {
                panelHeader.Controls.Add(btnMenuToggle);
                btnMenuToggle.BringToFront();
            }
"""

# Insert right before the end of ApplyExtraModernDarkTheme()
# Let's find where to insert. We can insert it in MainForm_Load as well.
# In MainForm_Load, after ApplyExtraModernDarkTheme();

content = content.replace("ApplyExtraModernDarkTheme();", "ApplyExtraModernDarkTheme();\n" + hamburger_code)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w', encoding='utf-8') as f:
    f.write(content)
print("Hamburger menu added!")
