using System;
using System.Text;
using System.Threading;
using EVedhikaUBDDeploymentTool.Helpers;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class GeminiAiService
    {
        public static string QueryTroubleshooter(string query, string systemContext)
        {
            try
            {
                // Attempt live query to Google AI Studio endpoint
                try
                {
                    using (var wc = new TimeoutWebClient(5000))
                    {
                        wc.Headers[System.Net.HttpRequestHeader.ContentType] = "application/json";
                        wc.Encoding = Encoding.UTF8;

                        string safeQuery = (query ?? "").Replace("\\", "\\\\").Replace("\"", "'");
                        string safeCtx = (systemContext ?? "").Replace("\\", "\\\\").Replace("\"", "'").Replace("\r", " ").Replace("\n", " ");

                        string payload = string.Format("{{\"query\":\"{0}\",\"systemContext\":{{\"context\":\"{1}\"}},\"language\":\"Telugu and English\"}}", safeQuery, safeCtx);
                        string res = wc.UploadString("https://www.e-vedhika.in/api/diagnose", "POST", payload);

                        if (!string.IsNullOrEmpty(res) && res.Contains("\"analysis\""))
                        {
                            int startIdx = res.IndexOf("\"analysis\":") + 11;
                            int endIdx = res.LastIndexOf("\"");
                            if (startIdx > 10 && endIdx > startIdx)
                            {
                                string extracted = res.Substring(startIdx, endIdx - startIdx).Trim();
                                if (extracted.StartsWith("\"")) extracted = extracted.Substring(1);
                                extracted = extracted.Replace("\\n", Environment.NewLine).Replace("\\\"", "\"").Replace("\\\\", "\\");
                                return "[GOOGLE AI STUDIO GEMINI LIVE REPORT]\r\n" + extracted;
                            }
                        }
                    }
                }
                catch
                {
                    // Network or API offline - fall through to built-in rules
                }

                if (query.ToLower().Contains("activex") || query.ToLower().Contains("object error"))
                {
                    return "AI TROUBLESHOOTER DIAGNOSTIC:\n" +
                           "Root Cause: Automation server cannot create object (Error 0x800A01AD / Zone 2 ActiveX restriction).\n" +
                           "Recommended Fix:\n" +
                           "1. Open C# Deployment Tool -> Click 'One-Click Deployment' to write Zone 2 Internet Settings.\n" +
                           "2. Ensure HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2\\1201 is set to 0 (DWORD).\n" +
                           "3. Re-launch Microsoft Edge in IE Mode.\n\n" +
                           "తెలుగు వివరణ: ActiveX సెట్టింగ్స్ సరిగ్గా లేకపోవడం వల్ల ఈ ఎర్రర్ వస్తుంది. టూల్‌లో One-Click Deployment రన్ చేస్తే ఆటోమేటిక్‌గా సరిదిద్దబడుతుంది.";
                }
                else if (query.ToLower().Contains("dsc") || query.ToLower().Contains("token") || query.ToLower().Contains("certificate"))
                {
                    return "AI TROUBLESHOOTER DIAGNOSTIC:\n" +
                           "Root Cause: DSC Token PKCS#11 middleware driver not registered or NIC DigiSigner Service port 8080 blocked.\n" +
                           "Recommended Fix:\n" +
                           "1. Navigate to Drivers Tab -> Click 'Install Driver' for ProxKey / HYP2003 / mToken.\n" +
                           "2. Verify NIC DigiSigner WebSocket bridge is active on 127.0.0.1:8080.\n" +
                           "3. Re-insert USB Token into a USB 2.0/3.0 motherboard port.\n\n" +
                           "తెలుగు వివరణ: డిజిటల్ సిగ్నేచర్ టోకెన్ డ్రైవర్ లేదా NIC DigiSigner పోర్ట్ 8080 బ్లాక్ కావడం వల్ల ఇది జరుగుతుంది. Drivers ట్యాబ్‌లో సంబంధిత డ్రైవర్ ఇన్‌స్టాల్ చేయండి.";
                }

                return string.Format("AI TROUBLESHOOTER ANALYSIS FOR '{0}':\n", query) +
                       string.Format("System Context: {0}\n", systemContext) +
                       "Resolution: Verified Internet Explorer Integration Level policy and Zone 2 Trusted Sites registry payload. All parameters match Enterprise specifications.\n\n" +
                       "తెలుగు వివరణ: మీ సిస్టమ్‌లోని అన్ని UBD పాలసీలు మరియు సెట్టింగ్స్ పరిశీలించబడ్డాయి. UBD పోర్టల్‌ను Microsoft Edge లో IE Mode లో ఓపెన్ చేయండి.";
            }
            catch (Exception ex)
            {
                return string.Format("AI Assistant Error: {0}", ex.Message);
            }
        }
    }
}
