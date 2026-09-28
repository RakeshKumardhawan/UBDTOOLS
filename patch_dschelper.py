import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/DscVerificationHelper.cs', 'r') as f:
    content = f.read()

old_code = """        public static (bool isGenuine, string details, int score) VerifyDscSignature()
        {
            int score = 0;
            string details = "";

            if (CheckSmartCardActivity()) { score += 33; details += "[1. SmartCard: Active] "; }
            else { details += "[1. SmartCard: Idle] "; }

            if (CheckBrowserSuccessWindow()) { score += 34; details += "[2. Browser: Success UI Found] "; }
            else { details += "[2. Browser: No Success UI] "; }

            if (CheckDscLogsForSuccess()) { score += 33; details += "[3. Token Logs: Success Flagged]"; }
            else { details += "[3. Token Logs: No Logs]"; }

            bool isGenuine = score >= 33;
            return (isGenuine, details, score);
        }"""

new_code = """        // 4. Silent UBD URL Endpoint Scanning (Background Process)
        public static bool SilentUbdUrlScan()
        {
            bool urlFound = false;
            string[] targetUrls = { 
                "regisertoken.do", 
                "birthDispDSUnported.do", 
                "bdsBirthRegFilterBulkDS.do", 
                "bdsDeathRegFilterBulkDS.do", 
                "bdsDeathRegFilterDS.do" 
            };
            
            EnumWindows((hWnd, lParam) =>
            {
                StringBuilder sb = new StringBuilder(256);
                GetWindowText(hWnd, sb, sb.Capacity);
                string title = sb.ToString().ToLower();
                
                foreach(var url in targetUrls)
                {
                    if (title.Contains(url.ToLower()) || title.Contains("ubd.telangana.gov.in"))
                    {
                        urlFound = true;
                        return false; 
                    }
                }
                return true;
            }, IntPtr.Zero);
            
            return urlFound;
        }

        public static (bool isGenuine, string details, int score) VerifyDscSignature()
        {
            int score = 0;
            string details = "";

            if (CheckSmartCardActivity()) { score += 25; details += "[1. SmartCard: Active] "; }
            else { details += "[1. SmartCard: Idle] "; }

            if (CheckBrowserSuccessWindow()) { score += 25; details += "[2. Browser: Success UI Found] "; }
            else { details += "[2. Browser: No Success UI] "; }

            if (CheckDscLogsForSuccess()) { score += 25; details += "[3. Token Logs: Success Flagged] "; }
            else { details += "[3. Token Logs: No Logs] "; }
            
            if (SilentUbdUrlScan()) { score += 25; details += "[4. UBD Endpoints: Scanned & Active]"; }
            else { details += "[4. UBD Endpoints: No Activity]"; }

            // Still passes if at least some DSC activity is found (e.g. >= 25)
            bool isGenuine = score >= 25;
            return (isGenuine, details, score);
        }"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/DscVerificationHelper.cs', 'w') as f:
    f.write(content)
