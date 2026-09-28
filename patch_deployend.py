import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

old_code = """            Logger.SendCentralTelemetry(telemData);

            // Auto-launch UBD Portal in Microsoft Edge (IE Mode) and E-Vedhika Web App in default browser upon deployment completion
            try
            {
                LogMessage("DEPLOY", "Auto-launching UBD Portal in Microsoft Edge (IE Mode) and E-Vedhika Web App...");

                // 1. Launch UBD Portal in Microsoft Edge
                string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
                if (File.Exists(edgePath))
                {
                    System.Diagnostics.Process.Start(edgePath, "https://ubd.telangana.gov.in");
                }
                else
                {
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo { FileName = "https://ubd.telangana.gov.in", UseShellExecute = true });
                }

                // 2. Launch E-Vedhika Web App in Default Browser
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo { FileName = "https://www.e-vedhika.in/?postId=qkQ9PDCxO0myy5l2seda&tab=home", UseShellExecute = true });
            }
            catch (Exception ex)
            {
                LogMessage("WARN", "Could not auto-launch browsers: " + ex.Message);
            }

            MessageBox.Show("==========================================\\n" +
                            "E-VEDHIKA UBD DEPLOYMENT REPORT\\n" +
                            "==========================================\\n\\n" +
                            "Total Checks        : 90\\n" +
                            "Passed              : 90\\n" +
                            "Warnings            : 0\\n" +
                            "Failed              : 0\\n\\n" +
                            "Overall Health      : 100%\\n" +
                            "Deployment Status   : SUCCESS\\n" +
                            "Verification        : COMPLETED\\n\\n" +
                            $"Generated On        : {DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss")}\\n" +
                            "Software Version    : E-Vedhika Software Enterprise\\n" +
                            "==========================================",
                            "E-Vedhika Deployment Summary", MessageBoxButtons.OK, MessageBoxIcon.Information);"""

new_code = """            // Auto-launch UBD Portal in Microsoft Edge (IE Mode) and E-Vedhika Web App in default browser upon deployment completion
            try
            {
                LogMessage("DEPLOY", "Auto-launching UBD Portal in Microsoft Edge (IE Mode) and E-Vedhika Web App...");

                // 1. Launch UBD Portal in Microsoft Edge
                string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
                if (File.Exists(edgePath))
                {
                    System.Diagnostics.Process.Start(edgePath, "https://ubd.telangana.gov.in");
                }
                else
                {
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo { FileName = "https://ubd.telangana.gov.in", UseShellExecute = true });
                }

                // 2. Launch E-Vedhika Web App in Default Browser
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo { FileName = "https://www.e-vedhika.in/?postId=qkQ9PDCxO0myy5l2seda&tab=home", UseShellExecute = true });
            }
            catch (Exception ex)
            {
                LogMessage("WARN", "Could not auto-launch browsers: " + ex.Message);
            }
            
            // Ask user to complete DSC Sign in UBD Portal before sending the report
            DialogResult dscResult = MessageBox.Show("Deployment Completed!\\n\\n" +
                            "The UBD Portal has been opened in Microsoft Edge (IE Mode).\\n" +
                            "Please login and complete your DSC Digital Signature process now.\\n\\n" +
                            "Click 'OK' ONLY AFTER you have successfully signed with your DSC to submit the Telemetry Report.",
                            "Waiting for DSC Signature", MessageBoxButtons.OK, MessageBoxIcon.Information);
                            
            if (dscResult == DialogResult.OK)
            {
                Logger.SendCentralTelemetry(telemData);
                LogMessage("TELEMETRY", "Live telemetry report submitted after DSC signature confirmation.");
            }

            MessageBox.Show("==========================================\\n" +
                            "E-VEDHIKA UBD DEPLOYMENT REPORT\\n" +
                            "==========================================\\n\\n" +
                            "Total Checks        : 90\\n" +
                            "Passed              : 90\\n" +
                            "Warnings            : 0\\n" +
                            "Failed              : 0\\n\\n" +
                            "Overall Health      : 100%\\n" +
                            "Deployment Status   : SUCCESS\\n" +
                            "Verification        : COMPLETED\\n\\n" +
                            $"Generated On        : {DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss")}\\n" +
                            "Software Version    : E-Vedhika Software Enterprise\\n" +
                            "==========================================",
                            "E-Vedhika Deployment Summary", MessageBoxButtons.OK, MessageBoxIcon.Information);"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
