import re
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/DiagnosticsEngine.cs', 'r') as f:
    content = f.read()

old_code = """            catch
            {
                // Fallback check
            }
            return false;
        }"""

new_code = """            catch
            {
                // Fallback check
            }
            
            // Aggressive fallback for smart card services & processes
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

            return false;
        }"""

content = content.replace(old_code, new_code)
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/DiagnosticsEngine.cs', 'w') as f:
    f.write(content)
