import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Code, 
  FileText, 
  Zap, 
  RefreshCw, 
  Terminal, 
  FileCode, 
  AlertTriangle,
  Lock,
  Globe,
  Building,
  Shield,
  Layers
} from 'lucide-react';
import { DepartmentProfile } from '../types';

interface RegistryViewProps {
  selectedProfile: DepartmentProfile;
  onImportRegistry: () => void;
  isImporting: boolean;
}

interface ZoneItem {
  id: string;
  name: string;
  category: string;
  value: string;
  status: string;
  color: string;
}

const ZONE1_SETTINGS: ZoneItem[] = [
  {
    "id": "1001",
    "name": "Download signed ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1004",
    "name": "Download unsigned ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1200",
    "name": "Run ActiveX controls and plug-ins",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1201",
    "name": "Initialize and script ActiveX not marked safe",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1206",
    "name": "Allow scripting of Microsoft web browser control",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1208",
    "name": "Allow previously unused ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1209",
    "name": "Scriptlets",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "120A",
    "name": "Display video and animation without external player",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "120B",
    "name": "Override SmartScreen filter for ActiveX",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1400",
    "name": "Active scripting (JavaScript Execution)",
    "category": "Scripting",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1402",
    "name": "Scripting of Java applets",
    "category": "Scripting",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1405",
    "name": "Script ActiveX controls marked safe",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1406",
    "name": "Access data sources across domains",
    "category": "Security",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1407",
    "name": "Allow Programmatic clipboard access",
    "category": "Clipboard",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1409",
    "name": "Scripting of XSLT elements",
    "category": "Scripting",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1604",
    "name": "Font download",
    "category": "Downloads",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1606",
    "name": "Userdata persistence",
    "category": "Miscellaneous",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1607",
    "name": "Navigate windows and frames across domains",
    "category": "Navigation",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1608",
    "name": "Allow META REFRESH",
    "category": "Miscellaneous",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1609",
    "name": "Display mixed content (HTTP inside HTTPS)",
    "category": "Mixed Content",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1802",
    "name": "Drag and drop or copy and paste files",
    "category": "Miscellaneous",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1803",
    "name": "File download",
    "category": "Downloads",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1804",
    "name": "Launching programs and files in an IFRAME",
    "category": "Frames",
    "value": "dword:00000001 (1)",
    "status": "PROMPT (1)",
    "color": "amber"
  },
  {
    "id": "1806",
    "name": "Launching applications and unsafe files",
    "category": "Security",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1809",
    "name": "Use Pop-up Blocker",
    "category": "Pop-up Blocker",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2000",
    "name": "Binary and script behaviors",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2001",
    "name": "Run components signed with Authenticode / .NET",
    "category": ".NET",
    "value": "dword:00000003 (3)",
    "status": "DISABLED",
    "color": "red"
  },
  {
    "id": "2004",
    "name": "Run components not signed with Authenticode",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2007",
    "name": "Run components signed with Authenticode (Secondary)",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2100",
    "name": "Open files based on content (MIME Sniffing)",
    "category": "Downloads",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2102",
    "name": "Script-initiated windows without constraints",
    "category": "Windows",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2103",
    "name": "Allow status bar updates via script",
    "category": "Status Bar",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2104",
    "name": "Allow websites to open windows without address/status",
    "category": "Windows",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2105",
    "name": "Allow scripted prompt windows",
    "category": "Windows",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2201",
    "name": "Automatic prompting for ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2300",
    "name": "Web sites in less privileged zone navigation",
    "category": "Navigation",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2301",
    "name": "Use SmartScreen Filter",
    "category": "SmartScreen",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2400",
    "name": ".NET Framework: XAML browser applications",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2401",
    "name": ".NET Framework: XPS documents",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2402",
    "name": ".NET Framework: Loose XAML",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2600",
    "name": "Enable .NET Framework setup",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2702",
    "name": "ActiveX Filtering",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2708",
    "name": "Allow approved domains to use ActiveX",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2709",
    "name": "Run Antimalware against ActiveX",
    "category": "Security",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1A00",
    "name": "User Authentication Logon",
    "category": "Authentication",
    "value": "dword:00020000",
    "status": "INTRANET LOGON (0x20000)",
    "color": "blue"
  },
  {
    "id": "1A04",
    "name": "Don't prompt for client certificate selection",
    "category": "Certificates",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  }
];
const ZONE2_SETTINGS: ZoneItem[] = [
  {
    "id": "1001",
    "name": "Download signed ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1004",
    "name": "Download unsigned ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1200",
    "name": "Run ActiveX controls and plug-ins",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1201",
    "name": "Initialize and script ActiveX not marked safe",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1206",
    "name": "Allow scripting of Microsoft web browser control",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1208",
    "name": "Allow previously unused ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1209",
    "name": "Scriptlets",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "120A",
    "name": "Display video and animation without external player",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "120B",
    "name": "Override SmartScreen filter for ActiveX",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1400",
    "name": "Active scripting (JavaScript Execution)",
    "category": "Scripting",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1402",
    "name": "Scripting of Java applets",
    "category": "Scripting",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1405",
    "name": "Script ActiveX controls marked safe",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1406",
    "name": "Access data sources across domains",
    "category": "Security",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1407",
    "name": "Allow Programmatic clipboard access",
    "category": "Clipboard",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1409",
    "name": "Scripting of XSLT elements",
    "category": "Scripting",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1604",
    "name": "Font download",
    "category": "Downloads",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1606",
    "name": "Userdata persistence",
    "category": "Miscellaneous",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1607",
    "name": "Navigate windows and frames across domains",
    "category": "Navigation",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1608",
    "name": "Allow META REFRESH",
    "category": "Miscellaneous",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1609",
    "name": "Display mixed content (HTTP inside HTTPS)",
    "category": "Mixed Content",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1802",
    "name": "Drag and drop or copy and paste files",
    "category": "Miscellaneous",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1803",
    "name": "File download",
    "category": "Downloads",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1804",
    "name": "Launching programs and files in an IFRAME",
    "category": "Frames",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1806",
    "name": "Launching applications and unsafe files",
    "category": "Security",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1809",
    "name": "Use Pop-up Blocker",
    "category": "Pop-up Blocker",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2000",
    "name": "Binary and script behaviors",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2001",
    "name": "Run components signed with Authenticode / .NET",
    "category": ".NET",
    "value": "dword:00000003 (3)",
    "status": "DISABLED",
    "color": "red"
  },
  {
    "id": "2004",
    "name": "Run components not signed with Authenticode",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2007",
    "name": "Run components signed with Authenticode (Secondary)",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2100",
    "name": "Open files based on content (MIME Sniffing)",
    "category": "Downloads",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2102",
    "name": "Script-initiated windows without constraints",
    "category": "Windows",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2103",
    "name": "Allow status bar updates via script",
    "category": "Status Bar",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2104",
    "name": "Allow websites to open windows without address/status",
    "category": "Windows",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2105",
    "name": "Allow scripted prompt windows",
    "category": "Windows",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2201",
    "name": "Automatic prompting for ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2300",
    "name": "Web sites in less privileged zone navigation",
    "category": "Navigation",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2301",
    "name": "Use SmartScreen Filter",
    "category": "SmartScreen",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2400",
    "name": ".NET Framework: XAML browser applications",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2401",
    "name": ".NET Framework: XPS documents",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2402",
    "name": ".NET Framework: Loose XAML",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2600",
    "name": "Enable .NET Framework setup",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2702",
    "name": "ActiveX Filtering",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2708",
    "name": "Allow approved domains to use ActiveX",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2709",
    "name": "Run Antimalware against ActiveX",
    "category": "Security",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1A00",
    "name": "User Authentication Logon",
    "category": "Authentication",
    "value": "dword:00020000",
    "status": "INTRANET LOGON (0x20000)",
    "color": "blue"
  },
  {
    "id": "1A04",
    "name": "Don't prompt for client certificate selection",
    "category": "Certificates",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  }
];
const ZONE3_SETTINGS: ZoneItem[] = [
  {
    "id": "1001",
    "name": "Download signed ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1004",
    "name": "Download unsigned ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1200",
    "name": "Run ActiveX controls and plug-ins",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1201",
    "name": "Initialize and script ActiveX not marked safe",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1206",
    "name": "Allow scripting of Microsoft web browser control",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1208",
    "name": "Allow previously unused ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1209",
    "name": "Scriptlets",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "120A",
    "name": "Display video and animation without external player",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "120B",
    "name": "Override SmartScreen filter for ActiveX",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1400",
    "name": "Active scripting (JavaScript Execution)",
    "category": "Scripting",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1402",
    "name": "Scripting of Java applets",
    "category": "Scripting",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1405",
    "name": "Script ActiveX controls marked safe",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1406",
    "name": "Access data sources across domains",
    "category": "Security",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1407",
    "name": "Allow Programmatic clipboard access",
    "category": "Clipboard",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1409",
    "name": "Scripting of XSLT elements",
    "category": "Scripting",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1604",
    "name": "Font download",
    "category": "Downloads",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1606",
    "name": "Userdata persistence",
    "category": "Miscellaneous",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1607",
    "name": "Navigate windows and frames across domains",
    "category": "Navigation",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1608",
    "name": "Allow META REFRESH",
    "category": "Miscellaneous",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1609",
    "name": "Display mixed content (HTTP inside HTTPS)",
    "category": "Mixed Content",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1802",
    "name": "Drag and drop or copy and paste files",
    "category": "Miscellaneous",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1803",
    "name": "File download",
    "category": "Downloads",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1804",
    "name": "Launching programs and files in an IFRAME",
    "category": "Frames",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1806",
    "name": "Launching applications and unsafe files",
    "category": "Security",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1809",
    "name": "Use Pop-up Blocker",
    "category": "Pop-up Blocker",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2000",
    "name": "Binary and script behaviors",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2001",
    "name": "Run components signed with Authenticode / .NET",
    "category": ".NET",
    "value": "dword:00000003 (3)",
    "status": "DISABLED",
    "color": "red"
  },
  {
    "id": "2004",
    "name": "Run components not signed with Authenticode",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2007",
    "name": "Run components signed with Authenticode (Secondary)",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2100",
    "name": "Open files based on content (MIME Sniffing)",
    "category": "Downloads",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2102",
    "name": "Script-initiated windows without constraints",
    "category": "Windows",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2103",
    "name": "Allow status bar updates via script",
    "category": "Status Bar",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2104",
    "name": "Allow websites to open windows without address/status",
    "category": "Windows",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2105",
    "name": "Allow scripted prompt windows",
    "category": "Windows",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2201",
    "name": "Automatic prompting for ActiveX controls",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2300",
    "name": "Web sites in less privileged zone navigation",
    "category": "Navigation",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2301",
    "name": "Use SmartScreen Filter",
    "category": "SmartScreen",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2400",
    "name": ".NET Framework: XAML browser applications",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2401",
    "name": ".NET Framework: XPS documents",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2402",
    "name": ".NET Framework: Loose XAML",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2600",
    "name": "Enable .NET Framework setup",
    "category": ".NET",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2702",
    "name": "ActiveX Filtering",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2708",
    "name": "Allow approved domains to use ActiveX",
    "category": "ActiveX",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "2709",
    "name": "Run Antimalware against ActiveX",
    "category": "Security",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  },
  {
    "id": "1A00",
    "name": "User Authentication Logon",
    "category": "Authentication",
    "value": "dword:00020000",
    "status": "INTRANET LOGON (0x20000)",
    "color": "blue"
  },
  {
    "id": "1A04",
    "name": "Don't prompt for client certificate selection",
    "category": "Certificates",
    "value": "dword:00000000 (0)",
    "status": "ENABLED",
    "color": "emerald"
  }
];

export const RegistryView: React.FC<RegistryViewProps> = ({
  selectedProfile,
  onImportRegistry,
  isImporting,
}) => {
  const [activeTab, setActiveTab] = useState<'reg' | 'ps1' | 'bat' | 'csharp'>('reg');
  const [selectedZone, setSelectedZone] = useState<1 | 2 | 3>(2);
  const [copied, setCopied] = useState<string | null>(null);

  const regContent = "Windows Registry Editor Version 5.00\n\n; ==============================================================================\n; E-VEDHIKA UBD DEPLOYMENT TOOL v2.0 - MASTER SECURITY ZONES REGISTRY\n; STRICTLY CONFIGURED TO USER SPECIFICATION\n; ==============================================================================\n\n; ZoneMap Domain Mapping for Telangana UBD Portal\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in\\ubd]\n\"https\"=dword:00000002\n\"http\"=dword:00000002\n\"*\"=dword:00000002\n\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\ubd.telangana.gov.in]\n\"https\"=dword:00000002\n\"http\"=dword:00000002\n\"*\"=dword:00000002\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\telangana.gov.in\\ubd]\n\"https\"=dword:00000002\n\"http\"=dword:00000002\n\"*\"=dword:00000002\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\ZoneMap\\Domains\\ubd.telangana.gov.in]\n\"https\"=dword:00000002\n\"http\"=dword:00000002\n\"*\"=dword:00000002\n\n; ==============================================================================\n; ZONE 0: MY COMPUTER\n; ==============================================================================\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\0]\n\"DisplayName\"=\"My Computer\"\n\"CurrentLevel\"=dword:00000000\n\"Flags\"=dword:00000021\n\"1200\"=dword:00000000\n\"1400\"=dword:00000000\n\"2000\"=dword:00000000\n\"2001\"=dword:00000003\n\"2004\"=dword:00000003\n\n; ==============================================================================\n; ZONE 1: LOCAL INTRANET ZONE\n; ==============================================================================\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\1]\n\"DisplayName\"=\"Local intranet\"\n\"CurrentLevel\"=dword:00000000\n\"MinLevel\"=dword:00010000\n\"Flags\"=dword:000000db\n\"1001\"=dword:00000000\n\"1004\"=dword:00000000\n\"1200\"=dword:00000000\n\"1201\"=dword:00000000\n\"1206\"=dword:00000000\n\"1208\"=dword:00000000\n\"1209\"=dword:00000000\n\"120A\"=dword:00000000\n\"120B\"=dword:00000000\n\"1400\"=dword:00000000\n\"1402\"=dword:00000000\n\"1405\"=dword:00000000\n\"1406\"=dword:00000000\n\"1407\"=dword:00000000\n\"1409\"=dword:00000000\n\"1604\"=dword:00000000\n\"1606\"=dword:00000000\n\"1607\"=dword:00000000\n\"1608\"=dword:00000000\n\"1609\"=dword:00000000\n\"1802\"=dword:00000000\n\"1803\"=dword:00000000\n\"1804\"=dword:00000001\n\"1806\"=dword:00000000\n\"1809\"=dword:00000000\n\"2000\"=dword:00000000\n\"2001\"=dword:00000003\n\"2004\"=dword:00000000\n\"2007\"=dword:00000000\n\"2100\"=dword:00000000\n\"2102\"=dword:00000000\n\"2103\"=dword:00000000\n\"2104\"=dword:00000000\n\"2105\"=dword:00000000\n\"2201\"=dword:00000000\n\"2300\"=dword:00000000\n\"2301\"=dword:00000000\n\"2400\"=dword:00000000\n\"2401\"=dword:00000000\n\"2402\"=dword:00000000\n\"2600\"=dword:00000000\n\"2702\"=dword:00000000\n\"2708\"=dword:00000000\n\"2709\"=dword:00000000\n\"1A00\"=dword:00020000\n\"1A04\"=dword:00000000\n\n; ==============================================================================\n; ZONE 2: TRUSTED SITES ZONE\n; ==============================================================================\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2]\n\"DisplayName\"=\"Trusted sites\"\n\"CurrentLevel\"=dword:00000000\n\"MinLevel\"=dword:00010000\n\"Flags\"=dword:00000047\n\"1001\"=dword:00000000\n\"1004\"=dword:00000000\n\"1200\"=dword:00000000\n\"1201\"=dword:00000000\n\"1206\"=dword:00000000\n\"1208\"=dword:00000000\n\"1209\"=dword:00000000\n\"120A\"=dword:00000000\n\"120B\"=dword:00000000\n\"1400\"=dword:00000000\n\"1402\"=dword:00000000\n\"1405\"=dword:00000000\n\"1406\"=dword:00000000\n\"1407\"=dword:00000000\n\"1409\"=dword:00000000\n\"1604\"=dword:00000000\n\"1606\"=dword:00000000\n\"1607\"=dword:00000000\n\"1608\"=dword:00000000\n\"1609\"=dword:00000000\n\"1802\"=dword:00000000\n\"1803\"=dword:00000000\n\"1804\"=dword:00000000\n\"1806\"=dword:00000000\n\"1809\"=dword:00000000\n\"2000\"=dword:00000000\n\"2001\"=dword:00000003\n\"2004\"=dword:00000000\n\"2007\"=dword:00000000\n\"2100\"=dword:00000000\n\"2102\"=dword:00000000\n\"2103\"=dword:00000000\n\"2104\"=dword:00000000\n\"2105\"=dword:00000000\n\"2201\"=dword:00000000\n\"2300\"=dword:00000000\n\"2301\"=dword:00000000\n\"2400\"=dword:00000000\n\"2401\"=dword:00000000\n\"2402\"=dword:00000000\n\"2600\"=dword:00000000\n\"2702\"=dword:00000000\n\"2708\"=dword:00000000\n\"2709\"=dword:00000000\n\"1A00\"=dword:00020000\n\"1A04\"=dword:00000000\n\n; ==============================================================================\n; ZONE 3: INTERNET ZONE\n; ==============================================================================\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\3]\n\"DisplayName\"=\"Internet\"\n\"CurrentLevel\"=dword:00000000\n\"Flags\"=dword:00000001\n\"1001\"=dword:00000000\n\"1004\"=dword:00000000\n\"1200\"=dword:00000000\n\"1201\"=dword:00000000\n\"1206\"=dword:00000000\n\"1208\"=dword:00000000\n\"1209\"=dword:00000000\n\"120A\"=dword:00000000\n\"120B\"=dword:00000000\n\"1400\"=dword:00000000\n\"1402\"=dword:00000000\n\"1405\"=dword:00000000\n\"1406\"=dword:00000000\n\"1407\"=dword:00000000\n\"1409\"=dword:00000000\n\"1604\"=dword:00000000\n\"1606\"=dword:00000000\n\"1607\"=dword:00000000\n\"1608\"=dword:00000000\n\"1609\"=dword:00000000\n\"1802\"=dword:00000000\n\"1803\"=dword:00000000\n\"1804\"=dword:00000000\n\"1806\"=dword:00000000\n\"1809\"=dword:00000000\n\"2000\"=dword:00000000\n\"2001\"=dword:00000003\n\"2004\"=dword:00000000\n\"2007\"=dword:00000000\n\"2100\"=dword:00000000\n\"2102\"=dword:00000000\n\"2103\"=dword:00000000\n\"2104\"=dword:00000000\n\"2105\"=dword:00000000\n\"2201\"=dword:00000000\n\"2300\"=dword:00000000\n\"2301\"=dword:00000000\n\"2400\"=dword:00000000\n\"2401\"=dword:00000000\n\"2402\"=dword:00000000\n\"2600\"=dword:00000000\n\"2702\"=dword:00000000\n\"2708\"=dword:00000000\n\"2709\"=dword:00000000\n\"1A00\"=dword:00020000\n\"1A04\"=dword:00000000\n\n; ==============================================================================\n; ZONE 4: RESTRICTED SITES\n; ==============================================================================\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\4]\n\"DisplayName\"=\"Restricted sites\"\n\"CurrentLevel\"=dword:00012000\n\"Flags\"=dword:00000003\n\"1001\"=dword:00000003\n\"1004\"=dword:00000003\n\"1200\"=dword:00000003\n\"1201\"=dword:00000003\n\"1400\"=dword:00000003\n\"1803\"=dword:00000003\n\n; ==============================================================================\n; ZONE 2 HKLM MIRROR\n; ==============================================================================\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\2]\n\"DisplayName\"=\"Trusted sites\"\n\"CurrentLevel\"=dword:00000000\n\"MinLevel\"=dword:00010000\n\"Flags\"=dword:00000047\n\"1001\"=dword:00000000\n\"1004\"=dword:00000000\n\"1200\"=dword:00000000\n\"1201\"=dword:00000000\n\"1206\"=dword:00000000\n\"1208\"=dword:00000000\n\"1209\"=dword:00000000\n\"120A\"=dword:00000000\n\"120B\"=dword:00000000\n\"1400\"=dword:00000000\n\"1402\"=dword:00000000\n\"1405\"=dword:00000000\n\"1406\"=dword:00000000\n\"1407\"=dword:00000000\n\"1409\"=dword:00000000\n\"1604\"=dword:00000000\n\"1606\"=dword:00000000\n\"1607\"=dword:00000000\n\"1608\"=dword:00000000\n\"1609\"=dword:00000000\n\"1802\"=dword:00000000\n\"1803\"=dword:00000000\n\"1804\"=dword:00000000\n\"1806\"=dword:00000000\n\"1809\"=dword:00000000\n\"2000\"=dword:00000000\n\"2001\"=dword:00000003\n\"2004\"=dword:00000000\n\"2007\"=dword:00000000\n\"2100\"=dword:00000000\n\"2102\"=dword:00000000\n\"2103\"=dword:00000000\n\"2104\"=dword:00000000\n\"2105\"=dword:00000000\n\"2201\"=dword:00000000\n\"2300\"=dword:00000000\n\"2301\"=dword:00000000\n\"2400\"=dword:00000000\n\"2401\"=dword:00000000\n\"2402\"=dword:00000000\n\"2600\"=dword:00000000\n\"2702\"=dword:00000000\n\"2708\"=dword:00000000\n\"2709\"=dword:00000000\n\"1A00\"=dword:00020000\n\"1A04\"=dword:00000000\n\n; ==============================================================================\n; ADVANCED TAB & TLS CONFIGURATION\n; ==============================================================================\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings]\n\"SecureProtocols\"=dword:00002aa0\n\"CertificateRevocation\"=dword:00000000\n\"PublisherRevocation\"=dword:00000000\n\"WarnonBadCertRecving\"=dword:00000000\n\"WarnOnZoneCrossing\"=dword:00000000\n\"WarnOnPostRedirect\"=dword:00000000\n\"AllowInvalidCertificates\"=dword:00000001\n\"DisableCachingOfSSLPages\"=dword:00000000\n\"SyncMode5\"=dword:00000003\n\"CheckExeSignatures\"=\"no\"\n\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_LOCALMACHINE_LOCKDOWN]\n\"iexplore.exe\"=dword:00000000\n\"msedge.exe\"=dword:00000000\n\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\New Windows]\n\"PopupMgr\"=\"no\"\n\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\Main]\n\"TabProcGrowth\"=dword:00000001\n\"DOMStorage\"=dword:00000001\n\n; ==============================================================================\n; MICROSOFT EDGE ENTERPRISE SITE LIST POLICIES\n; ==============================================================================\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Edge]\n\"InternetExplorerIntegrationLevel\"=dword:00000001\n\"InternetExplorerIntegrationSiteList\"=\"C:\\\\enterprise_compat\\\\sites.xml\"\n\"InternetExplorerIntegrationReloadInIEModeAllowed\"=dword:00000001\n\n[HKEY_CURRENT_USER\\SOFTWARE\\Policies\\Microsoft\\Edge]\n\"InternetExplorerIntegrationLevel\"=dword:00000001\n\"InternetExplorerIntegrationSiteList\"=\"C:\\\\enterprise_compat\\\\sites.xml\"\n\"InternetExplorerIntegrationReloadInIEModeAllowed\"=dword:00000001\n";

  const batContent = `@echo off
:: ============================================================================
:: E-Vedhika One-Click Launcher for UBD Telangana Registry Configuration
:: Target: https://ubd.telangana.gov.in/
:: ============================================================================
title E-Vedhika UBD Registry Automation Launcher
color 0B

echo ======================================================================
echo    E-VEDHIKA ONE-CLICK UBD REGISTRY CONFIGURATION LAUNCHER
echo    Target: https://ubd.telangana.gov.in/
echo ======================================================================
echo.

:: Check for Administrative Privileges and Auto-Elevate if needed
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrative Elevation...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\\getadmin.vbs"
    "%temp%\\getadmin.vbs"
    del "%temp%\\getadmin.vbs"
    exit /b
)

cd /d "%~dp0"
echo [1/3] Administrative privileges confirmed.
echo [2/3] Bypassing PowerShell execution restriction for deployment script...
echo [3/3] Launching Configure_UBD_Registry.ps1 ...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Configure_UBD_Registry.ps1"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] An error occurred during PowerShell execution (Exit Code: %errorlevel%).
    pause
    exit /b %errorlevel%
)

echo.
echo ======================================================================
echo  [SUCCESS] All UBD Registry settings configured and verified!
echo  Audit Report has been saved to C:\\EVedhika_UBD_Backups\\
echo ======================================================================
echo.
pause
`;

  const csharpCodeSnippet = `// C# WinForms Implementation: RegistryManager.cs
// Location: /csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs

public static void ApplyDirectZoneDwords()
{
    // Applies Zone 1, Zone 2, Zone 3 settings directly to HKCU and HKLM
    var catalog = GetZoneSettingsCatalog();
    RegistryKey[] rootHives = new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine };
    
    foreach (var root in rootHives)
    {
        for (int zoneId = 1; zoneId <= 3; zoneId++)
        {
            string subPath = $@"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\{zoneId}";
            using (var zk = root.CreateSubKey(subPath))
            {
                if (zk != null)
                {
                    var zoneItems = catalog.FindAll(x => x.ZoneId == zoneId);
                    foreach (var item in zoneItems)
                    {
                        // Sets item: '2001' = 3 (Disabled), all others = 0 (Enabled)
                        zk.SetValue(item.ValueName, item.ExpectedValue, RegistryValueKind.DWord);
                    }
                }
            }
        }
    }
}

// Verification method: reads actual value from HKCU/HKLM and validates
public static List<ZoneVerificationResult> VerifyAllSecurityZones()
{
    // Every setting is read back from Windows Registry and verified!
    // Result: PASS if Actual == Expected, else FAILED with explicit failure reason.
}`;

  const ps1DownloadUrl = "/scripts/Configure_UBD_Registry.ps1";
  const batDownloadUrl = "/scripts/Launch_UBD_Deployment.bat";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentZoneSettings = selectedZone === 1 
    ? ZONE1_SETTINGS 
    : selectedZone === 2 
    ? ZONE2_SETTINGS 
    : ZONE3_SETTINGS;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">UBD Registry & Security Zones Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% User Order Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly applied configuration across <b>Zone 1 (Local Intranet)</b>, <b>Zone 2 (Trusted Sites)</b>, and <b>Zone 3 (Internet Zone)</b>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-import-reg-now"
            onClick={onImportRegistry}
            disabled={isImporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
            <span>{isImporting ? 'Applying to Registry...' : 'One-Click Apply Now'}</span>
          </button>

          <button
            onClick={() => downloadFile('evedhika_master_zones.reg', regContent)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .REG</span>
          </button>

          <a
            href={ps1DownloadUrl}
            download="Configure_UBD_Registry.ps1"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .PS1</span>
          </a>
        </div>
      </div>

      {/* User Specification Notice Card */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-900">మీ ఆర్డర్ ప్రకారం అమలు చేసిన నిబంధన (User Order Active): </span>
            Zone 1, Zone 2, Zone 3 లలో కేవలం <code className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold font-mono">"2001"=3 (Disable)</code> మాత్రమే డిసేబుల్ చేయబడింది. మిగిలిన అన్ని సెట్టింగ్స్ <code className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">0 (Enable)</code> గానే అమర్చబడ్డాయి.
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 shadow-xs">
            Zone 1: 46 Keys
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 shadow-xs">
            Zone 2: 46 Keys
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 shadow-xs">
            Zone 3: 46 Keys
          </span>
        </div>
      </div>

      {/* Visual Interactive Zone Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Interactive Security Zones Inspector</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a security zone below to see all 46 configured values with their exact DWORD data:
            </p>
          </div>

          {/* Zone Selector Buttons */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedZone(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedZone === 1 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Zone 1: Local Intranet</span>
            </button>

            <button
              onClick={() => setSelectedZone(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedZone === 2 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Zone 2: Trusted Sites</span>
            </button>

            <button
              onClick={() => setSelectedZone(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedZone === 3 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Zone 3: Internet Zone</span>
            </button>
          </div>
        </div>

        {/* Zone Header Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-mono text-[10px] block">ZONE REGISTRY PATH</span>
            <span className="font-mono font-bold text-slate-800">
              HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\{selectedZone}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[10px] block">SECURITY TEMPLATE LEVEL</span>
            <span className="font-mono font-bold text-blue-700">CurrentLevel = 0 (Custom Level)</span>
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[10px] block">FLAGS & VERIFICATION</span>
            <span className="font-mono font-bold text-emerald-700">
              {selectedZone === 1 ? 'Flags = 0xdb' : selectedZone === 2 ? 'Flags = 0x47 (HTTPS Verification)' : 'Flags = 0x1'}
            </span>
          </div>
        </div>

        {/* 46 Settings Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Registry ID</th>
                <th className="py-2.5 px-3">Official Setting Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Registry DWORD Value</th>
                <th className="py-2.5 px-3 text-right">Configured Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentZoneSettings.map((item, idx) => (
                <tr 
                  key={item.id} 
                  className={`transition-colors ${
                    item.id === '2001' 
                      ? 'bg-red-50/60 hover:bg-red-50' 
                      : item.id === '1804' && selectedZone === 1
                      ? 'bg-amber-50/50 hover:bg-amber-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{item.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{item.category}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 font-semibold">{item.value}</td>
                  <td className="py-2.5 px-3 text-right">
                    {item.id === '2001' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300">
                        <Lock className="w-3 h-3" />
                        DISABLED (3)
                      </span>
                    ) : item.id === '1804' && selectedZone === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        PROMPT / ENABLE (1)
                      </span>
                    ) : item.id === '1A00' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        INTRANET LOGON (0x20000)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        ENABLED (0)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Viewer Tabs (REG / C# / PS1 / BAT) */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('reg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'reg' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Registry File (.reg)</span>
            </button>

            <button
              onClick={() => setActiveTab('csharp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'csharp' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>C# RegistryManager.cs</span>
            </button>

            <button
              onClick={() => setActiveTab('ps1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'ps1' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PowerShell Script (.ps1)</span>
            </button>

            <button
              onClick={() => setActiveTab('bat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'bat' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>BAT Launcher (.bat)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentContent = activeTab === 'reg' 
                  ? regContent 
                  : activeTab === 'csharp'
                  ? csharpCodeSnippet
                  : activeTab === 'bat'
                  ? batContent
                  : 'PowerShell script content from /scripts/Configure_UBD_Registry.ps1';
                handleCopy(currentContent, activeTab);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied === activeTab ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied === activeTab ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => {
                if (activeTab === 'reg') downloadFile('evedhika_master_zones.reg', regContent);
                else if (activeTab === 'bat') downloadFile('Launch_UBD_Deployment.bat', batContent);
                else {
                  const link = document.createElement('a');
                  link.href = ps1DownloadUrl;
                  link.download = 'Configure_UBD_Registry.ps1';
                  link.click();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Tab Code View */}
        {activeTab === 'reg' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Full Master Registry File (.reg) containing Zone 1, Zone 2, and Zone 3 with 2001=3 and all others=0:</span>
              <span className="font-mono text-emerald-400">Location: public/evedhika_master_zones.reg</span>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[480px]">
              {regContent}
            </pre>
          </div>
        )}

        {activeTab === 'csharp' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>C# Source Code inside <code>csharp_solution/EVedhikaUBDDeploymentTool/Engine/RegistryManager.cs</code>:</span>
              <span className="font-mono text-indigo-400">Engine: RegistryManager.cs</span>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[480px]">
              {csharpCodeSnippet}
            </pre>
          </div>
        )}

        {activeTab === 'ps1' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>PowerShell Script: Configure_UBD_Registry.ps1</span>
              <span className="font-mono text-blue-400">Auto-Elevation + Auto-Backup + Deep Verification</span>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[480px]">
{`# Configure_UBD_Registry.ps1 (Contains full Zone 1, 2, 3 catalog with 2001=3 and all others=0)
# To view complete file or execute, download Configure_UBD_Registry.ps1 or run via 1-Click launcher.`}
            </pre>
          </div>
        )}

        {activeTab === 'bat' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400">
              1-Click Double-Click Launcher with built-in UAC VBS elevation shim:
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed custom-scrollbar max-h-[480px]">
              {batContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
