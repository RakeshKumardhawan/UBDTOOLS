import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.Designer.cs', 'r') as f:
    content = f.read()

# 1. Add declaration
decl_old = "private System.Windows.Forms.Button btnRunDiagnostics;"
decl_new = """private System.Windows.Forms.Button btnRunDiagnostics;
        private System.Windows.Forms.Button btnActivateWindows;"""
content = content.replace(decl_old, decl_new)

# 2. Add to tabDiagnostics
tab_old = "this.tabDiagnostics.Controls.Add(this.btnRunDiagnostics);"
tab_new = """this.tabDiagnostics.Controls.Add(this.btnRunDiagnostics);
            this.tabDiagnostics.Controls.Add(this.btnActivateWindows);"""
content = content.replace(tab_old, tab_new)

# 3. Add button properties
btn_old = """            // 
            // btnRunDiagnostics
            // """
btn_new = """            // 
            // btnActivateWindows
            // 
            this.btnActivateWindows.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(255)))), ((int)(((byte)(152)))), ((int)(((byte)(0)))));
            this.btnActivateWindows.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnActivateWindows.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.btnActivateWindows.ForeColor = System.Drawing.Color.White;
            this.btnActivateWindows.Location = new System.Drawing.Point(300, 20);
            this.btnActivateWindows.Name = "btnActivateWindows";
            this.btnActivateWindows.Size = new System.Drawing.Size(200, 36);
            this.btnActivateWindows.TabIndex = 2;
            this.btnActivateWindows.Text = "Activate Windows (KMS)";
            this.btnActivateWindows.UseVisualStyleBackColor = false;
            this.btnActivateWindows.Click += new System.EventHandler(this.btnActivateWindows_Click);
            // 
            // btnRunDiagnostics
            // """
content = content.replace(btn_old, btn_new)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.Designer.cs', 'w') as f:
    f.write(content)
