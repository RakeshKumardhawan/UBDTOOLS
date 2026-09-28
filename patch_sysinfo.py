import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/SystemInfoHelper.cs', 'r') as f:
    content = f.read()

old_code = """        public static string GetEdgeVersion()
        {
            try
            {
                using (RegistryKey key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{56EB18F8-B008-4CBD-B6D2-8C97FE7E9062}"))
                {
                    if (key != null)
                    {
                        object version = key.GetValue("pv");
                        if (version != null) return version.ToString();
                    }
                }
            }
            catch { }
            return "Not Installed / Unknown";
        }
    }
}"""

new_code = """        public static string GetEdgeVersion()
        {
            try
            {
                using (RegistryKey key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{56EB18F8-B008-4CBD-B6D2-8C97FE7E9062}"))
                {
                    if (key != null)
                    {
                        object version = key.GetValue("pv");
                        if (version != null) return version.ToString();
                    }
                }
            }
            catch { }
            return "Not Installed / Unknown";
        }

        public static string GetWindowsActivationStatus()
        {
            try
            {
                using (ManagementObjectSearcher searcher = new ManagementObjectSearcher("SELECT LicenseStatus FROM SoftwareLicensingProduct WHERE PartialProductKey IS NOT NULL"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        int status = Convert.ToInt32(obj["LicenseStatus"]);
                        if (status == 1) return "Activated (Genuine)";
                    }
                }
            }
            catch { }
            return "Not Activated / Pending";
        }
    }
}"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/SystemInfoHelper.cs', 'w') as f:
    f.write(content)
