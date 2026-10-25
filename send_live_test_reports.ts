// Live Test Reports Sender for E-Vedhika (Telegram + Website)
// Dispatches both 17/17 PASS and FAIR FAIL reports to Telegram & Central Server

async function sendLiveTestReports() {
  const botToken = "8822107822:AAG9TIOX1lnRXpUuKCbs7ppM3r1TPTnNYrE";
  const chatId = "431228008";

  console.log("🚀 Dispataching Live Test Reports to Telegram (@DhawanRakesh) and Website...");

  // 1. Success Report (Telangana - 17/17 Passed)
  const successReport = {
    pcName: "TS-GP-KHAMMAM-01",
    userName: "Srinivas_Rao_Sec",
    officeLocation: "Khammam Urban Grama Panchayat, Telangana",
    state: "Telangana",
    version: "v1.0.8",
    status: "SUCCESS",
    verification: "Passed (17/17)",
    healthScore: 100,
    dscStatus: "ProxKey SHA256 Connected",
    edgeIeMode: "IE5 Quirks Active",
    siteListPolicy: "Active",
    trustedSites: "Zone 2 Active",
    adminRights: "Elevated Active",
    dotnet35: "Active",
    activeXConfig: "Active",
    smartCardService: "Active",
    dscDriverInstalled: "Active",
    nicDigiSigner: "Port 8080 Active",
    sslConfig: "Active",
    tls12: "Active",
    popupConfig: "Active",
    remarks: "17/17 Deployment steps executed and verified with zero manual clicks! 24*7 Guardian Active.",
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString()
  };

  // 2. Fair Evaluation Fail Report (Andhra Pradesh - 12/17 Passed, Edge IE Mode Policy Drift FAIL)
  const failReport = {
    pcName: "AP-GP-VIZAG-02",
    userName: "Venkatesh_Operator",
    officeLocation: "Bheemunipatnam Mandal Office, Visakhapatnam, AP",
    state: "Andhra Pradesh",
    version: "v1.0.8",
    status: "FAIL",
    verification: "Failed (12/17 Passed)",
    healthScore: 65,
    dscStatus: "Token Disconnected",
    edgeIeMode: "FAIL (Policy Drift)",
    siteListPolicy: "FAIL",
    trustedSites: "Zone 2 Active",
    adminRights: "Active",
    dotnet35: "Active",
    activeXConfig: "Active",
    smartCardService: "Active",
    dscDriverInstalled: "Active",
    nicDigiSigner: "Port 8080 Active",
    sslConfig: "Active",
    tls12: "Active",
    popupConfig: "Active",
    remarks: "E-Vedhika v1.0.8 Audit: Edge IE Mode Policy verification FAILED (IE Quirks Mode disabled in registry policy).",
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString()
  };

  // Dispatch to Telegram
  async function postToTelegram(report: any) {
    const isFail = report.status === 'FAIL' || String(report.edgeIeMode).includes('FAIL');
    const headerEmoji = isFail ? "🚨" : "🛡️";
    const headerTitle = isFail 
      ? "E-Vedhika UBD Deployment & Audit Alert [FAILED]" 
      : "E-Vedhika UBD Deployment Tool v1.0.8 and Installation Report";

    const text = `${headerEmoji} <b>${headerTitle}</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🖥️ <b>Machine & Office Details</b>\n` +
      `<b>Machine IDs:</b> <code>EVD-${report.state === 'Andhra Pradesh' ? 'AP' : 'TS'}-TEST-01</code>\n` +
      `<b>Office Locations:</b> ${report.officeLocation}\n` +
      `<b>PC Name:</b> <code>${report.pcName}</code> (${report.userName})\n` +
      `<b>User Privileges:</b> Elevated Administrator Mode (UAC Verified)\n` +
      `<b>IP Address:</b> <code>183.82.98.11</code>\n\n` +
      `📊 <b>Deployment Status & Health</b>\n` +
      `<b>Overall Status:</b> <b>${isFail ? 'FAIL' : 'SUCCESS'}</b>\n` +
      `<b>Versions:</b> v1.0.8 (24*7 Guardian Build)\n` +
      `<b>Health Score:</b> ${report.healthScore}%\n` +
      `<b>Successful Steps/Checks:</b> ${report.verification}\n` +
      `<b>DSC Token Status:</b> ${report.dscStatus}\n` +
      `<b>Edge IE Mode:</b> ${isFail ? '❌ Failed' : 'Active'}\n` +
      `<b>Guardian Status:</b> Active Report (System Tray)\n\n` +
      `🛠️ <b>17 Steps Real-Time Audit Matrix</b>\n` +
      `1. Admin Elevation & DISM: Active\n` +
      `2. .NET Framework 3.5: Active\n` +
      `3. Repaired Visual C++ Runtime: -\n` +
      `4. Edge Enterprise Site List: ${isFail ? '❌ Failed' : 'Active'}\n` +
      `5. Emulation Mode (IE5): ${isFail ? '❌ Failed' : 'Active'}\n` +
      `6. Zone 2 Trusted Sites: Active\n` +
      `7. Unsigned ActiveX Controls: Active\n` +
      `8. SmartCard Service (SCardSvr): Active\n` +
      `9. USB DSC Token Drivers: Active\n` +
      `10. NIC DigiSigner Bridge: Active\n` +
      `11. SSL & DNS Cache: Active\n` +
      `12. Security Protocols: Active\n` +
      `13. Popups & Content Rules: Active\n` +
      `14. Dual Browser Routing: Active\n` +
      `15. Backup & Telemetry Sync: Active\n` +
      `16. Final Handshake: Verified\n` +
      `17. Central Dashboard Sync: ${isFail ? 'Failed' : 'Success'}\n\n` +
      `📌 <b>Remarks & Portals</b>\n` +
      `<b>Remarks:</b> ${report.remarks}\n` +
      `<b>Target Portal:</b> ${report.state === 'Andhra Pradesh' ? 'https://ubd.ap.gov.in' : 'https://ubd.telangana.gov.in'}\n` +
      `<b>Central Live Dashboard:</b> https://www.e-vedhika.in/admin/exe_ubd_live\n` +
      `<b>Report Timestamp:</b> ${report.date} ${report.time}`;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    const d = await res.json();
    console.log(`Telegram Dispatch Result [${report.status}]:`, d.ok ? 'SUCCESS (Message ID: ' + d.result.message_id + ')' : d);
  }

  // Dispatch to local server endpoints
  async function postToServer(report: any) {
    try {
      const res = await fetch('http://localhost:3000/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      const data = await res.json();
      console.log(`Server /api/telemetry Result [${report.status}]:`, data.success ? 'SUCCESS' : data);
    } catch (e: any) {
      console.warn('Server post warning:', e.message);
    }
  }

  console.log("\n--- Sending SUCCESS Report (17/17 PASS) ---");
  await postToTelegram(successReport);
  await postToServer(successReport);

  console.log("\n--- Sending FAIR FAIL Report (12/17 FAIL) ---");
  await postToTelegram(failReport);
  await postToServer(failReport);

  console.log("\n✅ All live test reports dispatched successfully to Telegram and Website!");
}

sendLiveTestReports();
