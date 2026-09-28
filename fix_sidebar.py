import re

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    content = f.read()

bad_str = "    public partial class MainForm : Form\n        private Panel sidebar;\n    {"
good_str = "    public partial class MainForm : Form\n    {\n        private Panel sidebar;"

content = content.replace(bad_str, good_str)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed sidebar placement!")
