import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

# Comment out initial startup telemetry report
content = content.replace('btnSendTelemetryManual_Click(this, EventArgs.Empty);', '// btnSendTelemetryManual_Click(this, EventArgs.Empty);')

# Fix text size issue
content = content.replace('lblStatusStep.Text = $"Status: [Step {stepNumber}/15] {stepName}  |  ⏳ మిగిలిన సమయం: ~{estRemainingSecs} సెకన్లు (~{estRemainingSecs}s remaining)";', 'lblStatusStep.Text = $"[Step {stepNumber}/15] {stepName} | ⏳ Time Left: {estRemainingSecs}s";')

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)
