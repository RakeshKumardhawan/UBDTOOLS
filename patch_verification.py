import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

old_code = """            // Ask user to complete DSC Sign in UBD Portal before sending the report
            DialogResult dscResult = MessageBox.Show("Deployment Completed!\\n\\n" +
                            "The UBD Portal has been opened in Microsoft Edge (IE Mode).\\n" +
                            "Please login and complete your DSC Digital Signature process now.\\n\\n" +
                            "Click 'OK' ONLY AFTER you have successfully signed with your DSC to submit the Telemetry Report.\\n" +
                            "If you close this window or click Cancel, the report will still be sent but marked as 'DSC Skipped'.",
                            "Waiting for DSC Signature", MessageBoxButtons.OKCancel, MessageBoxIcon.Information);
                            
            if (dscResult == DialogResult.OK)
            {
                telemData["remarks"] = "All 90 parameters verified successfully. (DSC Confirmed by User)";
                Logger.SendCentralTelemetry(telemData);
                LogMessage("TELEMETRY", "Live telemetry report submitted after DSC signature confirmation.");
            }
            else
            {
                telemData["remarks"] = "All 90 parameters verified successfully. (DSC Confirmation Skipped/Closed)";
                Logger.SendCentralTelemetry(telemData);
                LogMessage("TELEMETRY", "Live telemetry report submitted (User skipped DSC confirmation).");
            }"""

new_code = """            // Ask user to complete DSC Sign in UBD Portal before sending the report
            DialogResult dscResult = MessageBox.Show("Deployment Completed!\\n\\n" +
                            "The UBD Portal has been opened in Microsoft Edge (IE Mode).\\n" +
                            "Please login and complete your DSC Digital Signature process now.\\n\\n" +
                            "Our engine will run a 3-Layer Genuine Verification (SmartCard API, Browser Engine, and DSC Logs).\\n" +
                            "Click 'OK' ONLY AFTER you have successfully signed with your DSC.",
                            "Waiting for DSC Signature", MessageBoxButtons.OKCancel, MessageBoxIcon.Information);
                            
            if (dscResult == DialogResult.OK)
            {
                var verifyResult = Helpers.DscVerificationHelper.VerifyDscSignature();
                if (verifyResult.isGenuine)
                {
                    telemData["remarks"] = $"100% Genuine DSC Detected! Details: {verifyResult.details} (Score: {verifyResult.score}%)";
                    telemData["status"] = "SUCCESS (DSC VERIFIED)";
                }
                else
                {
                    telemData["remarks"] = $"DSC Verification Failed. User clicked OK without genuine signing. Details: {verifyResult.details}";
                    telemData["status"] = "WARNING (DSC FAILED)";
                }
                Logger.SendCentralTelemetry(telemData);
                LogMessage("TELEMETRY", "Live telemetry report submitted. DSC Verification: " + (verifyResult.isGenuine ? "Passed" : "Failed"));
            }
            else
            {
                telemData["remarks"] = "All 90 parameters verified successfully. (DSC Confirmation Skipped by User)";
                telemData["status"] = "SUCCESS (DSC SKIPPED)";
                Logger.SendCentralTelemetry(telemData);
                LogMessage("TELEMETRY", "Live telemetry report submitted (User skipped DSC confirmation).");
            }"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
