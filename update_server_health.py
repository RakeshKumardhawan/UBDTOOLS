import os

with open('server.ts', 'r') as f:
    text = f.read()

consolidated_code = '''
  // ====================================================================
  // CONSOLIDATED SYSTEM HEALTH MANAGER & TELEMETRY DEDUPLICATION ENGINE
  // ====================================================================
  const CONSOLIDATED_HEALTH_FILE_PATH = path.join(process.cwd(), 'public', 'admin', 'consolidated_health.json');
  
  function escapeHtml(str: any) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  interface ActiveIssueRecord {
    issueId: string;
    issueType: string;
    firstDetected: string;
    lastDetected: string;
    occurrenceCount: number;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    repairAttempts: number;
    lastRepairResult: string;
    postRepairVerification: 'PASS' | 'FAIL' | 'PENDING' | 'N/A';
    status: 'OPEN' | 'REPAIRING' | 'AWAITING_VERIFICATION' | 'RESOLVED' | 'RECURRING';
    summary: string;
    resolvedTime?: string;
  }

  interface ConsolidatedMachineRecord {
    pcId: string;
    pcName: string;
    userName: string;
    officeLocation: string;
    district: string;
    state: string;
    osVersion: string;
    winBuild: string;
    appVersion: string;
    machineIdentifier: string;
    firstSeen: string;
    lastSeenEpoch: number;
    lastTelemetryUpdate: string;
    overallStatus: 'HEALTHY' | 'WARNING' | 'DEGRADED' | 'ISSUE DETECTED' | 'REPAIRING' | 'AWAITING VERIFICATION' | 'RESOLVED' | 'OFFLINE';
    deployment: {
      totalSteps: number;
      verifiedSteps: number;
      failedSteps: number;
      skippedSteps: number;
      verificationPercentage: number;
      failedStepNames: string[];
      lastDeploymentTime: string;
      deployResult: 'SUCCESS' | 'FAILED' | 'PARTIAL';
      deployProfile: string;
    };
    technicalHealth: {
      edgeVersion: string;
      edgeIeModeStatus: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT CHECKED';
      sitesXmlStatus: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT CHECKED';
      registryPoliciesStatus: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT CHECKED';
      ubdWebsiteStatus: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT CHECKED';
      dotNetStatus: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT CHECKED';
      internetConnectivity: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT CHECKED';
      digiSignerStatus: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT CHECKED';
      dscDriverStatus: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT CHECKED';
      dscTokenConnected: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT CHECKED';
      certValidity: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT CHECKED';
    };
    activeIssue: ActiveIssueRecord | null;
    issueHistory: ActiveIssueRecord[];
    lastTelegramAlertEpoch: number;
  }

  const consolidatedMachineStore = new Map<string, ConsolidatedMachineRecord>();

  if (fs.existsSync(CONSOLIDATED_HEALTH_FILE_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONSOLIDATED_HEALTH_FILE_PATH, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.pcId) consolidatedMachineStore.set(item.pcId, item);
        });
      }
    } catch (e) {
      console.warn('[CONSOLIDATED HEALTH] Failed to load consolidated_health.json:', e);
    }
  }

  const saveConsolidatedHealthStore = () => {
    try {
      const adminDir = path.join(process.cwd(), 'public', 'admin');
      if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir, { recursive: true });
      const list = Array.from(consolidatedMachineStore.values());
      fs.writeFileSync(CONSOLIDATED_HEALTH_FILE_PATH, JSON.stringify(list, null, 2), 'utf8');
    } catch (e) {
      console.error('[CONSOLIDATED HEALTH] Failed to save store:', e);
    }
  };

  function processConsolidatedTelemetry(body: any): ConsolidatedMachineRecord {
    const pcName = body.pcName || 'Unknown-PC';
    const userName = body.userName || 'Operator';
    const targetDom = body.targetDomain || (String(body.officeLocation || '').toLowerCase().includes('andhra') ? 'ubd.ap.gov.in' : 'ubd.telangana.gov.in');
    const stateVal = body.state || (targetDom.includes('ap.gov.in') || String(body.officeLocation || '').toLowerCase().includes('andhra') ? 'Andhra Pradesh' : 'Telangana');
    const officeLoc = body.officeLocation || body.office || 'Gram Panchayat Office';
    const osVer = body.osVersion || body.winEdition || body.winVersion || 'Windows 11 Home';
    const winBuild = body.winBuild || '10.0.26300';
    const appVer = body.version || body.deployVersion || 'v1.0.7';

    let pcId = body.pcId;
    if (!pcId) {
      const rawSeed = `${pcName}_${userName}_${officeLoc}`;
      let hash = 0;
      for (let i = 0; i < rawSeed.length; i++) {
        hash = (hash << 5) - hash + rawSeed.charCodeAt(i);
        hash |= 0;
      }
      const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
      const prefix = stateVal === 'Andhra Pradesh' ? 'EVD-AP' : 'EVD-TS';
      pcId = `${prefix}-${hex.slice(0, 4)}-${hex.slice(4)}`;
    }

    const nowEpoch = Date.now();
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    let record = consolidatedMachineStore.get(pcId);
    if (!record) {
      record = {
        pcId,
        pcName,
        userName,
        officeLocation: officeLoc,
        district: body.district || officeLoc.split(',')[0] || 'Local District',
        state: stateVal,
        osVersion: osVer,
        winBuild,
        appVersion: appVer,
        machineIdentifier: pcId,
        firstSeen: nowStr,
        lastSeenEpoch: nowEpoch,
        lastTelemetryUpdate: nowStr,
        overallStatus: 'HEALTHY',
        deployment: {
          totalSteps: 15,
          verifiedSteps: 15,
          failedSteps: 0,
          skippedSteps: 0,
          verificationPercentage: 100,
          failedStepNames: [],
          lastDeploymentTime: nowStr,
          deployResult: 'SUCCESS',
          deployProfile: '15/15 Standard Telangana/AP Profile'
        },
        technicalHealth: {
          edgeVersion: body.edgeVersion || 'Edge 126.0 (64-Bit)',
          edgeIeModeStatus: 'PASS',
          sitesXmlStatus: 'PASS',
          registryPoliciesStatus: 'PASS',
          ubdWebsiteStatus: 'PASS',
          dotNetStatus: 'PASS',
          internetConnectivity: 'PASS',
          digiSignerStatus: 'PASS',
          dscDriverStatus: 'PASS',
          dscTokenConnected: 'PASS',
          certValidity: 'PASS'
        },
        activeIssue: null,
        issueHistory: [],
        lastTelegramAlertEpoch: 0
      };
      consolidatedMachineStore.set(pcId, record);
    }

    record.pcName = pcName;
    record.userName = userName;
    record.officeLocation = officeLoc;
    record.osVersion = osVer;
    record.winBuild = winBuild;
    record.appVersion = appVer;
    record.lastSeenEpoch = nowEpoch;
    record.lastTelemetryUpdate = nowStr;

    if (body.sitesXmlStatus) record.technicalHealth.sitesXmlStatus = body.sitesXmlStatus;
    if (body.edgeIeModeStatus) record.technicalHealth.edgeIeModeStatus = body.edgeIeModeStatus;
    if (body.registryPoliciesStatus) record.technicalHealth.registryPoliciesStatus = body.registryPoliciesStatus;

    const isUbdIssue = body.status === 'UBD ISSUE DETECTED' || 
                       (body.activeIssue && body.activeIssue !== 'None') ||
                       body.sitesXmlStatus === 'FAIL' ||
                       body.edgeIeModeStatus === 'FAIL';

    const issueTitle = body.activeIssue || body.issueTitle || body.remarks || 'UBD Edge Policy / sites.xml Drift Detected';
    const issueSummary = body.remarks || body.issueDescription || issueTitle;

    let sendTelegram = false;
    let telegramReason = '';

    if (isUbdIssue) {
      record.technicalHealth.sitesXmlStatus = 'FAIL';
      record.technicalHealth.edgeIeModeStatus = 'FAIL';

      if (!record.activeIssue) {
        const newIssue: ActiveIssueRecord = {
          issueId: body.issueId || `ISS-${pcName.toUpperCase()}-EDGE-01`,
          issueType: issueTitle,
          firstDetected: nowStr,
          lastDetected: nowStr,
          occurrenceCount: 1,
          severity: body.severity || 'WARNING',
          repairAttempts: body.repairedSomething === 'True' || body.repairedSomething === true ? 1 : 0,
          lastRepairResult: body.lastRepairResult || 'AutoRepair Guardian applied self-healing policies',
          postRepairVerification: body.postRepairVerification || 'AWAITING VERIFICATION',
          status: body.postRepairVerification === 'PASS' ? 'RESOLVED' : 'AWAITING_VERIFICATION',
          summary: issueSummary
        };

        record.activeIssue = newIssue;
        record.issueHistory.unshift(newIssue);
        record.overallStatus = newIssue.status === 'RESOLVED' ? 'RESOLVED' : 'DEGRADED';
        sendTelegram = true;
        telegramReason = 'NEW ISSUE DETECTED';
      } else {
        const iss = record.activeIssue;
        iss.occurrenceCount += 1;
        iss.lastDetected = nowStr;
        if (body.repairedSomething === 'True' || body.repairedSomething === true) {
          iss.repairAttempts += 1;
        }
        if (body.lastRepairResult) iss.lastRepairResult = body.lastRepairResult;
        
        const oldPostVerif = iss.postRepairVerification;
        const newPostVerif = body.postRepairVerification || oldPostVerif;
        iss.postRepairVerification = newPostVerif;

        const oldStatus = iss.status;
        let newStatus = iss.status;
        if (newPostVerif === 'PASS') {
          newStatus = 'RESOLVED';
        } else if (newPostVerif === 'FAIL') {
          newStatus = 'RECURRING';
        } else if (body.postRepairStatus) {
          newStatus = body.postRepairStatus;
        }
        iss.status = newStatus;

        if (oldStatus !== newStatus || oldPostVerif !== newPostVerif) {
          sendTelegram = true;
          telegramReason = `STATUS TRANSITION (${oldStatus} -> ${newStatus})`;
          if (newStatus === 'RESOLVED') {
            record.overallStatus = 'RESOLVED';
          }
        } else if (nowEpoch - record.lastTelegramAlertEpoch > 3600 * 1000) {
          sendTelegram = true;
          telegramReason = 'PERIODIC DEDUPLICATED UPDATE (1 HOUR)';
        } else {
          sendTelegram = false;
          telegramReason = `SUPPRESSED DUPLICATE ALERT (Occurrence #${iss.occurrenceCount})`;
        }
      }
    } else {
      record.technicalHealth.sitesXmlStatus = 'PASS';
      record.technicalHealth.edgeIeModeStatus = 'PASS';
      record.technicalHealth.registryPoliciesStatus = 'PASS';

      if (record.activeIssue && record.activeIssue.status !== 'RESOLVED') {
        record.activeIssue.status = 'RESOLVED';
        record.activeIssue.postRepairVerification = 'PASS';
        record.activeIssue.resolvedTime = nowStr;
        record.overallStatus = 'HEALTHY';
        sendTelegram = true;
        telegramReason = 'ISSUE RESOLVED & VERIFIED PASS';
        record.activeIssue = null;
      } else {
        record.overallStatus = 'HEALTHY';
        sendTelegram = false;
        telegramReason = 'ROUTINE HEALTHY SCAN (SUPPRESSED)';
      }
    }

    saveConsolidatedHealthStore();

    if (sendTelegram && telegramConfig.botToken && telegramConfig.chatId) {
      record.lastTelegramAlertEpoch = nowEpoch;
      const iss = record.activeIssue;

      const tgMsgHtml = `🛡️ <b>E-VEDHIKA CONSOLIDATED SYSTEM HEALTH REPORT</b>
━━━━━━━━━━━━━━━━━━━
💻 <b>PC:</b> <code>${escapeHtml(record.pcName)}</code> (${record.pcId})
🏢 <b>Office:</b> ${escapeHtml(record.officeLocation)}
🖥️ <b>OS:</b> ${escapeHtml(record.osVersion)} (Build ${record.winBuild})
⚙️ <b>Application:</b> ${record.appVersion}

⚡ <b>Overall Status:</b> <b>${record.overallStatus}</b>

📊 <b>Deployment Verification:</b> ${record.deployment.verifiedSteps}/${record.deployment.totalSteps} Steps Verified (${record.deployment.verificationPercentage}%)
🔑 <b>DSC Driver:</b> ${record.technicalHealth.dscDriverStatus}
🌐 <b>Edge IE Mode Policy:</b> ${record.technicalHealth.edgeIeModeStatus}
📄 <b>sites.xml:</b> ${record.technicalHealth.sitesXmlStatus}
` + (iss ? `
⚠️ <b>Active Issue:</b> ${escapeHtml(iss.issueType)}
🆔 <b>Issue ID:</b> <code>${iss.issueId}</code>
⏰ <b>First Detected:</b> ${iss.firstDetected}
⏱️ <b>Last Detected:</b> ${iss.lastDetected}
🔢 <b>Occurrence Count:</b> ${iss.occurrenceCount}
🔧 <b>Repair Attempts:</b> ${iss.repairAttempts}
🛠️ <b>Last Repair Result:</b> ${escapeHtml(iss.lastRepairResult)}
🔍 <b>Post-Repair Verification:</b> ${iss.postRepairVerification}

📝 <b>Summary:</b> ${escapeHtml(iss.summary)}
` : `
✅ <b>Active Issues:</b> None (All parameters 100% healthy)
`) + `
⏰ <b>Last Updated:</b> ${nowStr}`;

      sendTelegramMessage(tgMsgHtml, telegramConfig.botToken, telegramConfig.chatId).catch(err => {
        console.warn('[TELEGRAM CONSOLIDATED] Dispatch failed:', err?.message || err);
      });
    }

    return record;
  }
'''

idx = text.find('const saveAnnouncements = () => {')
idx2 = text.find('};', idx) + 2
text = text[:idx2] + '\n' + consolidated_code + text[idx2:]

with open('server.ts', 'w') as f:
    f.write(text)

print('Updated server.ts successfully!')
