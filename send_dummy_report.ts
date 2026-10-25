// Using native fetch available in Node.js 18+

async function sendDummyReport() {
  const payload = {
    pcName: "DUMMY-GP-OFFICE-01",
    userName: "Secretary_Rakesh",
    officeLocation: "Suryapet Mandal Office (Telangana)",
    version: "v1.0.8",
    status: "SUCCESS",
    healthScore: 100,
    remarks: "17/17 Deployment steps executed and verified with zero manual clicks!",
    osVersion: "Windows 11 Pro (Build 22631)",
    ramAvailable: "16 GB (11.2 GB Free)",
    diskFreeSpace: "240 GB Free",
    cpuInfo: "12th Gen Intel(R) Core(TM) i7-12700H",
    publicIp: "183.82.98.11",
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
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString(),
    botToken: "8822107822:AAG9TIOX1lnRXpUuKCbs7ppM3r1TPTnNYrE",
    chatId: "1203632360"
  };

  console.log("Sending dummy v1.0.8 report to local telemetry endpoint...");
  
  try {
    const response = await fetch('http://localhost:3000/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("Response from server:", JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log("SUCCESS: Dummy report recorded and should be visible on dashboard and Telegram.");
    } else {
      console.error("FAILED: Server returned error.");
    }
  } catch (error) {
    console.error("ERROR: Failed to connect to server.", error);
  }
}

sendDummyReport();
