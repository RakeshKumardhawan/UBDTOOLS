import re

with open("public/scripts/Configure_UBD_Registry.ps1", "r") as f:
    text = f.read()

ps1_z3_pattern = r"# 3\. ZONE 3: INTERNET.*?(?=\)\s*\n\s*\$RegRoots)"
ps1_z3_new = """# 3. ZONE 3: INTERNET (Strict Security: Unsigned ActiveX Blocked, Mixed Content Prompt)
    # ==========================================
    @{ ZoneId=3; ZoneName="Internet"; ID="CurrentLevel"; Name="Zone Security Level (Custom)"; Value=0; Desc="Sets zone security template to 0 (Custom Level)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="Flags";        Name="Zone Capabilities & Flags"; Value=1; Desc="Internet Zone base permissions" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1001"; Name="Download signed ActiveX controls"; Value=1; Desc="Prompt for signed ActiveX controls (1 = Prompt)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1004"; Name="Download unsigned ActiveX controls"; Value=3; Desc="Disable unsigned ActiveX controls on Internet (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1200"; Name="Run ActiveX controls and plug-ins"; Value=0; Desc="Run ActiveX controls and plug-ins" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1201"; Name="Initialize and script ActiveX not marked safe"; Value=3; Desc="Disable scripting of unapproved ActiveX (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1208"; Name="Allow previously unused ActiveX controls"; Value=3; Desc="Disable unused ActiveX controls without prompt (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1209"; Name="Scriptlets"; Value=1; Desc="Prompt for Scriptlet execution (1 = Prompt)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="120A"; Name="Override Antivirus protection for ActiveX"; Value=0; Desc="Video and animation playback support" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1400"; Name="Active scripting (JavaScript Execution)"; Value=0; Desc="Enable JavaScript on Internet websites" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1402"; Name="Scripting of Java applets"; Value=3; Desc="Disable legacy Java applets on Internet (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1405"; Name="Script ActiveX controls marked safe"; Value=0; Desc="Run safe ActiveX controls" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1406"; Name="Access data sources across domains"; Value=3; Desc="Disable cross-domain data sources on Internet (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1407"; Name="Allow programmatic clipboard access"; Value=1; Desc="Prompt for clipboard access on Internet (1 = Prompt)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1604"; Name="Font download"; Value=0; Desc="Allow web font download" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1607"; Name="Navigate windows and frames across domains"; Value=3; Desc="Disable cross-domain navigation on Internet (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1608"; Name="Allow META REFRESH"; Value=0; Desc="Allow page meta refresh" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1609"; Name="Display mixed content (HTTP inside HTTPS)"; Value=1; Desc="Prompt for mixed content on Internet (1 = Prompt)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="160A"; Name="Include local directory path when uploading"; Value=3; Desc="Disable uploading local directory path (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1802"; Name="Drag and drop or copy and paste files"; Value=0; Desc="Allow drag and drop files" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1803"; Name="File download"; Value=0; Desc="Allow file downloads on Internet" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1804"; Name="Launching programs and files in an IFRAME"; Value=0; Desc="Allow iframe rendering" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1806"; Name="Launching applications and unsafe files"; Value=1; Desc="Prompt before launching unsafe files (1 = Prompt)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1809"; Name="Use Pop-up Blocker"; Value=0; Desc="Enable Pop-up Blocker on Internet Zone (0 = On)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1A00"; Name="User Authentication Logon"; Value=0x20000; Desc="Automatic logon only in Intranet zone (0x20000)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1A04"; Name="Don't prompt for client certificate selection"; Value=3; Desc="Prompt for client certificate if requested (3 = Prompt)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="1E05"; Name="Software channel permissions"; Value=0x20000; Desc="Medium safety software channel permissions" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2000"; Name="Binary and script behaviors"; Value=0; Desc="Enable binary and script behaviors" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2001"; Name="Run components signed with Authenticode"; Value=0; Desc="Run signed .NET components" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2004"; Name="Run components not signed with Authenticode"; Value=3; Desc="Disable unsigned .NET components (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2100"; Name="Open files based on content (MIME Sniffing)"; Value=0; Desc="Open files based on content" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2102"; Name="Script-initiated windows without constraints"; Value=3; Desc="Disable unconstrained script windows (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2103"; Name="Allow status bar updates via script"; Value=3; Desc="Disable status bar updates via script (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2200"; Name="Automatic prompting for file downloads"; Value=3; Desc="Disable automatic download prompt (3 = Disable)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2201"; Name="Automatic prompting for ActiveX controls"; Value=0; Desc="Enable automatic prompting for ActiveX" },
    @{ ZoneId=3; ZoneName="Internet"; ID="2301"; Name="Use SmartScreen Filter"; Value=0; Desc="Enable SmartScreen on Internet Zone (0 = On)" },
    @{ ZoneId=3; ZoneName="Internet"; ID="270B"; Name="Only allow approved domains to use ActiveX"; Value=3; Desc="Disable unapproved domain restrictions (3 = Off)" }
"""

text = re.sub(ps1_z3_pattern, lambda m: ps1_z3_new, text, flags=re.DOTALL)
with open("public/scripts/Configure_UBD_Registry.ps1", "w") as f:
    f.write(text)

print("Updated Configure_UBD_Registry.ps1 successfully!")
