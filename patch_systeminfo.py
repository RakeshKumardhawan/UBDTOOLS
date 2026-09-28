import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/SystemInfoHelper.cs', 'r') as f:
    content = f.read()

new_method = """
        public static string GetLiveLocation()
        {
            try
            {
                using (System.Net.WebClient client = new System.Net.WebClient())
                {
                    client.Headers.Add("User-Agent", "EVedhika/1.0");
                    string response = client.DownloadString("http://ip-api.com/csv/");
                    // Format: success,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query
                    string[] parts = response.Split(',');
                    if (parts.Length > 5 && parts[0] == "success")
                    {
                        return parts[5] + ", " + parts[4]; // City, RegionName
                    }
                }
            }
            catch { }
            return "Unknown Location";
        }

        public static string GetWindowsVersion()"""

content = content.replace("        public static string GetWindowsVersion()", new_method)
with open('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/SystemInfoHelper.cs', 'w') as f:
    f.write(content)
