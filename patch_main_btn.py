import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

# Add event handler
old_code = """        private void btnRunDiagnostics_Click(object sender, EventArgs e)
        {
            RunSystemDiagnostics();
        }"""

new_code = """        private void btnRunDiagnostics_Click(object sender, EventArgs e)
        {
            RunSystemDiagnostics();
        }

        private void btnActivateWindows_Click(object sender, EventArgs e)
        {
            txtDiagnosticOutput.AppendText("\\r\\n=========================================\\r\\n");
            txtDiagnosticOutput.AppendText("Initializing Windows Activation Process...\\r\\n");
            txtDiagnosticOutput.AppendText("=========================================\\r\\n");
            Task.Run(() =>
            {
                Engine.WindowsActivationEngine.AutoActivateWindows((msg) =>
                {
                    Invoke((MethodInvoker)delegate
                    {
                        txtDiagnosticOutput.AppendText(msg + "\\r\\n");
                        txtDiagnosticOutput.SelectionStart = txtDiagnosticOutput.Text.Length;
                        txtDiagnosticOutput.ScrollToCaret();
                    });
                });
            });
        }"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
