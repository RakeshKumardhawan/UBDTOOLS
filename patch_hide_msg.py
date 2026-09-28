import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

old_code = """            DialogResult dscResult = MessageBox.Show("Deployment Completed!\\n\\n" +
                            "The UBD Portal has been opened in Microsoft Edge (IE Mode).\\n" +
                            "Please login and complete your DSC Digital Signature process now.\\n\\n" +
                            "Our engine will run a 3-Layer Genuine Verification (SmartCard API, Browser Engine, and DSC Logs).\\n" +
                            "Click 'OK' ONLY AFTER you have successfully signed with your DSC.",
                            "Waiting for DSC Signature", MessageBoxButtons.OKCancel, MessageBoxIcon.Information);"""

new_code = """            DialogResult dscResult = MessageBox.Show("Deployment Completed!\\n\\n" +
                            "The UBD Portal has been opened in Microsoft Edge (IE Mode).\\n" +
                            "Please login and complete your DSC Digital Signature process now.\\n\\n" +
                            "Click 'OK' ONLY AFTER you have successfully signed with your DSC.",
                            "Waiting for DSC Signature", MessageBoxButtons.OKCancel, MessageBoxIcon.Information);"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
