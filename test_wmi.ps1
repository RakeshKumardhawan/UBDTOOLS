Get-WmiObject Win32_PnPEntity | Where-Object { $_.Name -match "ProxKey|ePass2003|HYP2003|Token|Smart" } | Select-Object Name, DeviceID
