
import re

with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'r') as f:
    content = f.read()

# 1. Update CleanOldBatSettings to take backup first
old_clean = """        public static void CleanOldBatSettings()
        {
            try
            {
                // Forcefully remove old settings using system CMD (reg delete) to ensure maximum cleanup power"""

new_clean = """        public static void CleanOldBatSettings()
        {
            try
            {
                // STEP 1: Always take safety pre-deployment backup BEFORE any cleanup or modification
                try
                {
                    string backupFile = BackupEngine.CreatePreDeploymentBackup();
                    if (!string.IsNullOrEmpty(backupFile))
                    {
                        Logger.LogInfo("Backup", "Pre-deployment registry snapshot saved to: " + backupFile);
                    }
                }
                catch (Exception bEx)
                {
                    Logger.LogWarn("Backup", "Pre-deployment backup warning: " + bEx.Message);
                }

                // Forcefully remove old settings using system CMD (reg delete) to ensure maximum cleanup power"""

if old_clean in content:
    content = content.replace(old_clean, new_clean, 1)
    print("Replaced CleanOldBatSettings backup logic")
else:
    print("WARNING: old_clean not matched")

# 2. Update ConfigureTrustedSites for duplicate check & HTTPS server verification
old_trusted = """                if (!string.IsNullOrEmpty(targetDomain))
                {
                    if (targetDomain == "ubd.telangana.gov.in" && !domainPaths.Contains(@"telangana.gov.in\\ubd"))
                        domainPaths.Add(@"telangana.gov.in\\ubd");
                    else if (targetDomain == "ubd.ap.gov.in" && !domainPaths.Contains(@"ap.gov.in\\ubd"))
                        domainPaths.Add(@"ap.gov.in\\ubd");
                    else if (!domainPaths.Contains(targetDomain))
                        domainPaths.Add(targetDomain);
                }"""

new_trusted = """                if (!string.IsNullOrEmpty(targetDomain))
                {
                    if (targetDomain == "ubd.telangana.gov.in" && !domainPaths.Contains(@"telangana.gov.in\\ubd"))
                        domainPaths.Add(@"telangana.gov.in\\ubd");
                    else if (targetDomain == "ubd.ap.gov.in" && !domainPaths.Contains(@"ap.gov.in\\ubd"))
                        domainPaths.Add(@"ap.gov.in\\ubd");
                    else if (!domainPaths.Contains(targetDomain))
                        domainPaths.Add(targetDomain);
                }

                // Check if target website https://ubd.telangana.gov.in/ is ALREADY configured in Trusted Sites to avoid duplicate entries
                bool ubdAlreadyExists = false;
                try
                {
                    using (RegistryKey chkKey = Registry.CurrentUser.OpenSubKey($@"{Zone2KeyPath}\\ubd.telangana.gov.in"))
                    {
                        if (chkKey != null && chkKey.GetValue("https") != null && Convert.ToInt32(chkKey.GetValue("https")) == 2)
                        {
                            ubdAlreadyExists = true;
                        }
                    }
                    if (!ubdAlreadyExists)
                    {
                        using (RegistryKey chkKey2 = Registry.CurrentUser.OpenSubKey($@"{Zone2KeyPath}\\telangana.gov.in\\ubd"))
                        {
                            if (chkKey2 != null && chkKey2.GetValue("https") != null && Convert.ToInt32(chkKey2.GetValue("https")) == 2)
                            {
                                ubdAlreadyExists = true;
                            }
                        }
                    }
                }
                catch { }

                if (ubdAlreadyExists)
                {
                    Logger.LogInfo("Registry", "[VERIFIED] https://ubd.telangana.gov.in/ is already registered in Trusted Sites (Zone 2). Duplicate entry avoided.");
                }
                else
                {
                    Logger.LogInfo("Registry", "[ADDING] Registering https://ubd.telangana.gov.in/ into Trusted Sites (Zone 2)...");
                }"""

if old_trusted in content:
    content = content.replace(old_trusted, new_trusted, 1)
    print("Replaced ConfigureTrustedSites duplicate check")
else:
    print("WARNING: old_trusted not matched")

# 3. Update HTTPS Server Verification in ConfigureTrustedSites
old_acl = """                // Protect core government domains from deletion while keeping user ability to add/delete other domains
                ProtectGovernmentDomainACL(@"telangana.gov.in\\ubd");
                ProtectGovernmentDomainACL(@"ubd.telangana.gov.in");
                ProtectGovernmentDomainACL(@"telangana.gov.in");
                ProtectGovernmentDomainACL(@"ap.gov.in\\ubd");
                ProtectGovernmentDomainACL(@"ubd.ap.gov.in");

                return true;"""

new_acl = """                // Ensure HTTPS Server Verification setting for Zone 2 (Trusted Sites) is configured
                try
                {
                    using (RegistryKey z2 = Registry.CurrentUser.CreateSubKey(SecurityZonesKeyPath))
                    {
                        if (z2 != null)
                        {
                            // Flags = 0x47 enforces 'Require server verification (https:) for all sites in this zone' (bit 0x04)
                            z2.SetValue("Flags", 0x00000047, RegistryValueKind.DWord);
                            Logger.LogInfo("Registry", "[VERIFIED] Trusted Sites Server Verification (HTTPS) enforced with Flags = 0x47.");
                        }
                    }
                }
                catch { }

                // Protect core government domains from deletion while keeping user ability to add/delete other domains
                ProtectGovernmentDomainACL(@"telangana.gov.in\\ubd");
                ProtectGovernmentDomainACL(@"ubd.telangana.gov.in");
                ProtectGovernmentDomainACL(@"telangana.gov.in");
                ProtectGovernmentDomainACL(@"ap.gov.in\\ubd");
                ProtectGovernmentDomainACL(@"ubd.ap.gov.in");

                return true;"""

if old_acl in content:
    content = content.replace(old_acl, new_acl, 1)
    print("Replaced ConfigureTrustedSites HTTPS server verification")
else:
    print("WARNING: old_acl not matched")

# Write changes back
with open('csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs', 'w') as f:
    f.write(content)
print("Updated basic TrustedSites and CleanOldBatSettings in RegistryManager.cs")
