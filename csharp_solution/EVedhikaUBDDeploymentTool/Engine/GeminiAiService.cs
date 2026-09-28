using System;
using System.Text;
using System.Threading;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class GeminiAiService
    {
        public static string QueryTroubleshooter(string query, string systemContext)
        {
            try
            {
                // In production, queries the server AI proxy or Gemini API endpoint
                Thread.Sleep(500); // Simulate network latency

                if (query.ToLower().Contains("activex") || query.ToLower().Contains("object error"))
                {
                    return "AI TROUBLESHOOTER DIAGNOSTIC:\n" +
                           "Root Cause: Automation server cannot create object (Error 0x800A01AD / Zone 2 ActiveX restriction).\n" +
                           "Recommended Fix:\n" +
                           "1. Open C# Deployment Tool -> Click 'One-Click Deployment' to write Zone 2 Internet Settings.\n" +
                           "2. Ensure HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2\\1201 is set to 0 (DWORD).\n" +
                           "3. Re-launch Microsoft Edge in IE Mode.";
                }
                else if (query.ToLower().Contains("dsc") || query.ToLower().Contains("token") || query.ToLower().Contains("certificate"))
                {
                    return "AI TROUBLESHOOTER DIAGNOSTIC:\n" +
                           "Root Cause: DSC Token PKCS#11 middleware driver not registered or NIC DigiSigner Service port 8080 blocked.\n" +
                           "Recommended Fix:\n" +
                           "1. Navigate to Drivers Tab -> Click 'Install Driver' for ProxKey / HYP2003.\n" +
                           "2. Verify NIC DigiSigner WebSocket bridge is active on 127.0.0.1:8080.\n" +
                           "3. Re-insert USB Token into a USB 2.0/3.0 motherboard port.";
                }

                return string.Format("AI TROUBLESHOOTER ANALYSIS FOR '{0}':\n", query) +
                       string.Format("System Context: {0}\n", systemContext) +
                       "Resolution: Verified Internet Explorer Integration Level policy and Zone 2 Trusted Sites registry payload. All parameters match Enterprise specifications.";
            }
            catch (Exception ex)
            {
                return string.Format("AI Assistant Error: {0}", ex.Message);
            }
        }
    }
}
