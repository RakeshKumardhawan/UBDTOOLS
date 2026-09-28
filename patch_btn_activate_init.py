import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.Designer.cs', 'r') as f:
    content = f.read()

old_code = "            this.btnRunDiagnostics = new System.Windows.Forms.Button();"
new_code = """            this.btnRunDiagnostics = new System.Windows.Forms.Button();
            this.btnActivateWindows = new System.Windows.Forms.Button();"""
content = content.replace(old_code, new_code)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.Designer.cs', 'w') as f:
    f.write(content)
