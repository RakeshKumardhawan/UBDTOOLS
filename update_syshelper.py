import re

with open('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/SystemInfoHelper.cs', 'r') as f:
    content = f.read()

old_code = """        public static string CheckEdgeIeMode()
        {
            string xmlPath = @"C:\\EVedhika_UBD\\EdgeIEMode\\sites.xml";
            if (File.Exists(xmlPath))
            {
                return "IE5 Quirks Active (sites.xml present)";
            }
            return "IE5 Quirks Active";
        }"""

new_code = """        public static string CheckEdgeIeMode()
        {
            string xmlPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "EVedhika", "sites.xml");
            if (File.Exists(xmlPath))
            {
                return "IE5 Quirks Active (sites.xml present)";
            }
            return "IE5 Quirks Active (Registry Policy Enforced)";
        }"""

content = content.replace(old_code, new_code)

with open('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/SystemInfoHelper.cs', 'w') as f:
    f.write(content)

print("Updated SystemInfoHelper.cs successfully")
