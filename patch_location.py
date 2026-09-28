import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/SystemInfoHelper.cs', 'r') as f:
    content = f.read()

new_method = """        public static string GetLiveLocation()
        {
            try
            {
                using (System.Net.WebClient client = new System.Net.WebClient())
                {
                    client.Headers.Add("User-Agent", "EVedhika/1.0");
                    string response = client.DownloadString("https://get.geojs.io/v1/ip/geo.json");
                    System.Text.RegularExpressions.Match cityMatch = System.Text.RegularExpressions.Regex.Match(response, "\\\"city\\\":\\\"([^\\\"]+)\\\"");
                    System.Text.RegularExpressions.Match regionMatch = System.Text.RegularExpressions.Regex.Match(response, "\\\"region\\\":\\\"([^\\\"]+)\\\"");
                    
                    string city = cityMatch.Success ? cityMatch.Groups[1].Value : "Unknown City";
                    string region = regionMatch.Success ? regionMatch.Groups[1].Value : "Unknown Region";
                    
                    if (city != "Unknown City")
                    {
                        if (region != "Unknown Region") return city + ", " + region;
                        return city;
                    }
                }
            }
            catch { }
            return "Unknown Location";
        }"""

content = re.sub(r'public static string GetLiveLocation\(\).*?return "Unknown Location";\s*\}', new_method, content, flags=re.DOTALL)

with open('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/SystemInfoHelper.cs', 'w') as f:
    f.write(content)
