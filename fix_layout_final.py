import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

# Completely override the Form Load layout handler to forcefully fix the bounds
resize_handler = """
        private void MainForm_Resize(object sender, EventArgs e)
        {
            if (tabControlMain != null && sidebar != null)
            {
                int headerHeight = (panelHeader != null) ? panelHeader.Height : 65;
                int footerHeight = (statusStrip1 != null) ? statusStrip1.Height : 22;
                
                // Force absolute dimensions on every resize frame
                tabControlMain.Location = new Point(200, headerHeight);
                tabControlMain.Size = new Size(this.ClientSize.Width - 200, this.ClientSize.Height - headerHeight - footerHeight);
                sidebar.Height = this.ClientSize.Height - headerHeight - footerHeight;
            }
        }
"""

if "MainForm_Resize" not in content:
    content = content.replace("private void MainForm_Load(object sender, EventArgs e)", resize_handler + "\n        private void MainForm_Load(object sender, EventArgs e)")
    
    # Hook the event in the Load method
    load_hook = """            this.Resize += MainForm_Resize;
            MainForm_Resize(null, null);"""
    
    content = content.replace("ApplyExtraModernDarkTheme();", "ApplyExtraModernDarkTheme();\n" + load_hook)

# Now, go to Designer and remove any Anchors or Docking from tabControlMain
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
print("Injected Resize Handler!")
