# Enterprise Mode Site List XML Templates (State-Isolated UBD Only)

At runtime, `EdgePolicyEngine.GenerateSiteListXmlForState(...)` generates a strictly state-isolated `sites.xml` containing ONLY the installed state's UBD portal URLs:

- **Telangana installations** (`enterprise_mode_site_list_ts.xml` / default `enterprise_mode_site_list.xml`): Contains ONLY `ubd.telangana.gov.in` (`IE5` -> `IE11`). Zero Andhra Pradesh or non-UBD sites.
- **Andhra Pradesh installations** (`enterprise_mode_site_list_ap.xml`): Contains ONLY `ubd.ap.gov.in` / `www.ubd.ap.gov.in:8080/UBDNEW/` (`IE7` -> `IE11`). Zero Telangana or non-UBD sites.

`www.e-vedhika.in` and non-UBD portals (PFMS, eGramSwaraj, Treasury/IFMIS) are strictly excluded.
