import re

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r') as f:
    content = f.read()

old_greeting = """            if (issuesFound)
            {
                MessageBox.Show("తనిఖీ పూర్తయింది! (Check Completed!)\\n\\nకొన్ని సెట్టింగ్స్ మారినట్లు గుర్తించబడ్డాయి మరియు వాటిని ఆటోమెటిక్ గా సరిచేయడం జరిగింది. సింక్ పూర్తయింది.\\n(Some settings were modified and have been auto-repaired successfully. Sync completed.)", "E-Vedhika UBD Status", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            else
            {
                MessageBox.Show("తనిఖీ పూర్తయింది! (Check Completed!)\\n\\nమీ UBD సెట్టింగ్స్ మరియు సిస్టమ్ అంతా సక్రమంగా పని చేస్తున్నాయి. సింక్ చేయబడింది.\\n(Your UBD settings and system are working perfectly. Synced successfully.)", "E-Vedhika UBD Status", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }"""

new_greeting = """            if (issuesFound)
            {
                MessageBox.Show("⚠️ UBD సెట్టింగ్స్ ఆటో-రికవరీ అయ్యాయి! (Settings Restored!)\\n\\n" +
                    "మీ సిస్టమ్‌లో తొలగించబడిన UBD సెట్టింగ్స్, sites.xml ఫైల్ మరియు Edge IE Mode పాలసీలను E-Vedhika Self-Healing Engine ఆటోమేటిక్ గా సరిచేసి రీ-అప్లై చేసింది.\\n\\n" +
                    "UBD పోర్టల్ లో 'Improper data found' రాకుండా లాగిన్ అవ్వడానికి Desktop లోని 'UBD Portal (Edge IE Mode)' షార్ట్‌కట్ ఉపయోగించండి.\\n\\n" +
                    "(Deleted or altered UBD settings, sites.xml, and Edge IE Mode policies have been automatically repaired and synced by E-Vedhika Engine.)",
                    "E-Vedhika UBD Self-Healing Status", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            else
            {
                MessageBox.Show("✓ తనిఖీ పూర్తయింది! (Check Completed!)\\n\\n" +
                    "మీ UBD సెట్టింగ్స్, sites.xml ఫైల్, Edge IE Mode మరియు ActiveX సర్టిఫికేట్లు 100% సక్రమంగా ఉన్నాయి.\\n\\n" +
                    "(Your UBD settings, sites.xml file, Edge IE Mode policies, and ActiveX drivers are 100% verified and active.)",
                    "E-Vedhika UBD Status", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }"""

content = content.replace(old_greeting, new_greeting)

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'w') as f:
    f.write(content)

print("Updated greeting in MainForm.cs successfully")
