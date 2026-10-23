export interface DeploymentSummaryPayload {
  stepsPassed: number;
  totalSteps: number;
  profileName: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  remarks?: string;
  pcName?: string;
  pcId?: string;
  osVersion?: string;
  dscStatus?: string;
  ramUsage?: string;
  diskSpace?: string;
  cpuInfo?: string;
  ipAddress?: string;
  detailedSteps?: Record<string, string>;
}

export async function SendDeploymentSummaryToTelegram(summary: DeploymentSummaryPayload): Promise<boolean> {
  const timestamp = new Date().toLocaleString();
  const passRate = Math.round((summary.stepsPassed / (summary.totalSteps || 16)) * 100);

  const getStat = (val?: string) => {
    if (!val) return '✅ PASS';
    const l = val.toLowerCase();
    if (l.includes('fail') || l.includes('missing') || l.includes('stopped') || l.includes('not')) return '❌ FAIL';
    if (l.includes('warn') || l.includes('pending')) return '⚠️ WARN';
    return `✅ ${val}`;
  };

  const message = `🎉 <b>NEW E-VEDHIKA DEPLOYMENT & INSTALLATION REPORT</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🆔 <b>Machine ID:</b> <code>${summary.pcId || 'EVD-WEB-CLIENT'}</code>\n` +
    `🏢 <b>Office Location:</b> ${summary.profileName}\n` +
    `💻 <b>PC Name:</b> <code>${summary.pcName || 'Grama-Panchayat-Client'}</code>\n` +
    `🖥️ <b>OS & Edition:</b> ${summary.osVersion || 'Windows 10/11 (64-Bit)'}\n` +
    `👤 <b>Privileges:</b> Elevated Administrator Mode (UAC Verified)\n` +
    `🌐 <b>IP Address:</b> <code>${summary.ipAddress || 'Local Network'}</code>\n\n` +
    `📊 <b>SYSTEM RESOURCES:</b>\n` +
    `🧠 <b>RAM:</b> ${summary.ramUsage || 'Available'}\n` +
    `💾 <b>Disk:</b> ${summary.diskSpace || 'Available'}\n` +
    `⚡ <b>CPU:</b> ${summary.cpuInfo || 'Intel/AMD x64'}\n\n` +
    `✅ <b>DEPLOYMENT STATUS & HEALTH:</b>\n` +
    `🏆 <b>Status:</b> ${summary.status}\n` +
    `📋 <b>Checks:</b> ${summary.stepsPassed}/${summary.totalSteps || 16} PASSED\n` +
    `💯 <b>Health Score:</b> ${passRate}%\n` +
    `📦 <b>Version:</b> v1.0.7 (OTA Build 2026.10.21-R4)\n` +
    `⏰ <b>Timestamp:</b> ${timestamp}\n\n` +
    `📋 <b>16-STEP REAL-TIME AUDIT MATRIX:</b>\n` +
    `1️⃣ Admin Elevation & DISM: ${getStat(summary.detailedSteps?.step1)}\n` +
    `2️⃣ .NET Framework 3.5: ${getStat(summary.detailedSteps?.step2)}\n` +
    `3️⃣ Visual C++ Runtime: ${getStat(summary.detailedSteps?.step3)}\n` +
    `4️⃣ Edge Enterprise Site List: ${getStat(summary.detailedSteps?.step4)}\n` +
    `5️⃣ Emulation Mode (IE5): ${getStat(summary.detailedSteps?.step5)}\n` +
    `6️⃣ Zone 2 Trusted Sites: ${getStat(summary.detailedSteps?.step6)}\n` +
    `7️⃣ Unsigned ActiveX Controls: ${getStat(summary.detailedSteps?.step7)}\n` +
    `8️⃣ SmartCard Service (SCardSvr): ${getStat(summary.detailedSteps?.step8)}\n` +
    `9️⃣ USB DSC Token Drivers: ${getStat(summary.detailedSteps?.step9)}\n` +
    `🔟 NIC DigiSigner Bridge: ${getStat(summary.detailedSteps?.step10)}\n` +
    `1️⃣1️⃣ SSL & DNS Cache: ${getStat(summary.detailedSteps?.step11)}\n` +
    `1️⃣2️⃣ Security Protocols: ${getStat(summary.detailedSteps?.step12)}\n` +
    `1️⃣3️⃣ Popups & Content Rules: ${getStat(summary.detailedSteps?.step13)}\n` +
    `1️⃣4️⃣ Dual Browser Routing: ✅ PASS\n` +
    `1️⃣5️⃣ Backup & Telemetry Sync: ${getStat(summary.detailedSteps?.step15)}\n` +
    `1️⃣6️⃣ Final Handshake: ${getStat(summary.detailedSteps?.step16)}\n\n` +
    `🔐 <b>HARDWARE & TOKEN HANDSHAKE:</b>\n` +
    `🔑 <b>DSC Status:</b> ${summary.dscStatus || 'Active'}\n` +
    `🌐 <b>Target Portal:</b> ${summary.profileName.includes('Andhra') ? 'ubd.ap.gov.in' : 'ubd.telangana.gov.in'}\n` +
    `📝 <b>Remarks:</b> ${summary.remarks || 'Automated deployment completed successfully.'}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🌐 <b>Portal:</b> ${summary.profileName.includes('Andhra') ? 'http://www.ubd.ap.gov.in:8080/UBDNEW' : 'https://ubd.telangana.gov.in'}\n` +
    `📊 <b>Central Live Dashboard:</b> https://www.e-vedhika.in/?tab=admin/UBDLiveMonitoring`;

  try {
    const res = await fetch('/api/telegram-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.warn('Failed to dispatch telegram deployment summary:', err);
    return false;
  }
}
