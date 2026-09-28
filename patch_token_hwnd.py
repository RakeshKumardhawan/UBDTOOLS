import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/DiagnosticsEngine.cs', 'r') as f:
    content = f.read()

old_code = """            // Aggressive fallback for smart card services & processes
            try 
            {
                if (System.Diagnostics.Process.GetProcessesByName("HyperPKITokenManager").Length > 0 ||
                    System.Diagnostics.Process.GetProcessesByName("WDProxKeyManager").Length > 0 ||
                    System.Diagnostics.Process.GetProcessesByName("ePass2003Manager").Length > 0 ||
                    System.Diagnostics.Process.GetProcessesByName("ePass2003").Length > 0)
                {
                    return true; 
                }
            } catch { }

            return false;"""

new_code = """            // Aggressive fallback for smart card services & processes
            try 
            {
                var procs = System.Diagnostics.Process.GetProcesses();
                foreach(var p in procs)
                {
                    string pName = p.ProcessName.ToLower();
                    string wTitle = p.MainWindowTitle.ToLower();
                    if (pName.Contains("hyperpki") || pName.Contains("proxkey") || pName.Contains("epass") || pName.Contains("watchdata") || pName.Contains("feitian") ||
                        wTitle.Contains("hyperpki") || wTitle.Contains("proxkey") || wTitle.Contains("epass") || wTitle.Contains("watchdata") || wTitle.Contains("feitian") || wTitle.Contains("token manager"))
                    {
                        return true;
                    }
                }
            } catch { }

            return false;"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/DiagnosticsEngine.cs', 'w') as f:
    f.write(content)
