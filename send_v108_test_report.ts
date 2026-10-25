// Test report script for E-Vedhika Unified Cloud Gateway (v1.0.8 Guardian Build)

async function sendTestReport() {
  const payload = {
    pcName: "GUARDIAN-GP-MANDAL-01",
    userName: "Secretary_Test_User",
    officeLocation: "Khammam Mandal Office (Telangana)",
    version: "v1.0.8",
    status: "SUCCESS",
    healthScore: 100,
    remarks: "17/17 Deployment steps executed and verified with zero manual clicks! 24*7 Guardian Active.",
    osVersion: "Windows 11 Pro (Build 22631)",
    ramAvailable: "16 GB (12.4 GB Free)",
    diskFreeSpace: "180 GB Free",
    cpuInfo: "Intel(R) Core(TM) i7-12700H @ 2.70GHz",
    publicIp: "183.82.98.22",
    verification: "Passed (17/17)",
    adminRights: "Active",
    dotnet35: "Repaired",
    siteListPolicy: "Active",
    edgeIeMode: "Active",
    trustedSites: "Active",
    activeXConfig: "Active",
    smartCardService: "Active",
    dscDriverInstalled: "Active",
    nicDigiSigner: "Port 8080 Active",
    sslConfig: "Active",
    tls12: "Active",
    popupConfig: "Active",
    guardianStatus: "Active (System Tray 24*7)",
    dscStatus: "USB Token Connected (ProxKey SHA256)",
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString(),
    botToken: "8822107822:AAG9TIOX1lnRXpUuKCbs7ppM3r1TPTnNYrE",
    chatId: "1203632360"
  };

  console.log("Sending v1.0.8 Guardian Test Report to Unified Gateway...");

  try {
    const response = await fetch('http://localhost:3000/admin/exe_ubd_live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("Unified Gateway Response:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("SUCCESS: v1.0.8 Test Report successfully logged and synced to Central Cloud Telemetry!");
    } else {
      console.error("FAILED: Gateway returned error.");
    }
  } catch (error) {
    console.error("ERROR: Failed to reach Unified Gateway.", error);
  }
}

sendTestReport();
