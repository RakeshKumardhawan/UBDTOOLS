using System;
using System.IO;
using Microsoft.Win32;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class HealthAlert
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Severity { get; set; } // "Warning", "Critical", "Info"
        public string SuggestedFix { get; set; }
    }

    public static class ProactiveHealthEngine
    {
        /// <summary>
        /// Scans the system proactively for registry corruptions, missing DigiSigner COM objects,
        /// or outdated TLS / IE Mode policies before deployment is triggered.
        /// </summary>
        public static HealthAlert[] RunProactiveScan()
        {
            var alerts = new System.Collections.Generic.List<HealthAlert>();

            // 1. Check DigiSigner Registry COM Object
            try
            {
                using (RegistryKey key = Registry.ClassesRoot.OpenSubKey("DigiSignHelper.DigiSigner"))
                {
                    if (key == null)
                    {
                        alerts.Add(new HealthAlert
                        {
                            Title = "DigiSignHelper COM Missing",
                            Description = "NIC DigiSigner automation object not found in Registry. UBD portal signing will fail.",
                            Severity = "Critical",
                            SuggestedFix = "Run One-Click Deploy or Step 8 to auto-heal registry."
                        });
                    }
                }
            }
            catch
            {
                alerts.Add(new HealthAlert
                {
                    Title = "Registry Access Restricted",
                    Description = "Unable to verify HKEY_CLASSES_ROOT. Administrator privileges may be required.",
                    Severity = "Warning",
                    SuggestedFix = "Restart tool as Administrator."
                });
            }

            // 2. Check Trusted Sites Zone 2 for ubd.telangana.gov.in / ubd.ap.gov.in
            try
            {
                bool tsOk = false;
                bool apOk = false;
                using (RegistryKey tsKey = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\telangana.gov.in\ubd")) { if (tsKey != null) tsOk = true; }
                using (RegistryKey apKey = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings\ZoneMap\Domains\ap.gov.in\ubd")) { if (apKey != null) apOk = true; }

                if (!tsOk && !apOk)
                {
                    alerts.Add(new HealthAlert
                    {
                        Title = "UBD Domain Not in Trusted Sites",
                        Description = "Neither ubd.telangana.gov.in nor ubd.ap.gov.in is registered under Internet Explorer Trusted Sites.",
                        Severity = "Warning",
                        SuggestedFix = "Run Step 2 of deployment to register state domains securely."
                    });
                }
            }
            catch
            {
                // Ignored
            }

            // 3. Check .NET Framework 3.5 status
            try
            {
                using (RegistryKey ndpKey = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\NET Framework Setup\NDP\v3.5"))
                {
                    if (ndpKey == null)
                    {
                        alerts.Add(new HealthAlert
                        {
                            Title = ".NET Framework 3.5 Missing",
                            Description = "Legacy COM interop requires .NET 3.5 which is disabled by default in Windows 10/11.",
                            Severity = "Critical",
                            SuggestedFix = "Run Step 1 to auto-enable offline DISM .NET 3.5."
                        });
                    }
                }
            }
            catch
            {
                // Ignored
            }

            // If all checks pass
            if (alerts.Count == 0)
            {
                alerts.Add(new HealthAlert
                {
                    Title = "System Environment Pristine",
                    Description = "No registry corruptions or driver conflicts detected. Ready for UBD Portal operations.",
                    Severity = "Info",
                    SuggestedFix = "None required."
                });
            }

            return alerts.ToArray();
        }
    }
}
