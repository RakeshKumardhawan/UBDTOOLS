import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

old_code = """            // Ask user to complete DSC Sign in UBD Portal before sending the report
            DialogResult dscResult = MessageBox.Show("Deployment Completed!\\n\\n" +
                            "The UBD Portal has been opened in Microsoft Edge (IE Mode).\\n" +
                            "Please login and complete your DSC Digital Signature process now.\\n\\n" +
                            "You can test DSC using these links in the portal:\\n" +
                            "1. /regisertoken.do\\n" +
                            "2. /BDS/birthDispDSUnported.do\\n" +
                            "3. /BDS/bdsBirthRegFilterBulkDS.do\\n" +
                            "4. /BDS/bdsDeathRegFilterBulkDS.do\\n" +
                            "5. /BDS/bdsDeathRegFilterDS.do\\n\\n" +
                            "Our engine will run a 3-Layer Genuine Verification (SmartCard API, Browser Engine, and DSC Logs).\\n" +
                            "Click 'OK' ONLY AFTER you have successfully signed with your DSC.",
                            "Waiting for DSC Signature", MessageBoxButtons.OKCancel, MessageBoxIcon.Information);"""

new_code = """            // Ask user to complete DSC Sign in UBD Portal before sending the report
            DialogResult dscResult = MessageBox.Show("Deployment Completed!\\n\\n" +
                            "The UBD Portal has been opened in Microsoft Edge (IE Mode).\\n" +
                            "Please login and complete your DSC Digital Signature process now.\\n\\n" +
                            "Our engine will run a 3-Layer Genuine Verification (SmartCard API, Browser Engine, and DSC Logs).\\n" +
                            "Click 'OK' ONLY AFTER you have successfully signed with your DSC.",
                            "Waiting for DSC Signature", MessageBoxButtons.OKCancel, MessageBoxIcon.Information);"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
