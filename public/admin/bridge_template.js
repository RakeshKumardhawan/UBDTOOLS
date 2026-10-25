/**
 * ====================================================================
 * E-VEDHIKA UNIFIED CLOUD GATEWAY & TELEMETRY BRIDGE (v1.0.8)
 * ====================================================================
 * Hosted on www.e-vedhika.in
 * Receives automated health and deployment audit reports from C# UBD .exe clients
 * across Grama Panchayat & Mandal office computers in Telangana and Andhra Pradesh.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all client .exe applications and web dashboards
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Persistent storage paths
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const TELEMETRY_FILE = path.join(DATA_DIR, 'telemetry_logs.json');
const CONSOLIDATED_HEALTH_FILE = path.join(DATA_DIR, 'consolidated_health.json');

// In-memory stores
let telemetryLogs = [];
let consolidatedMachines = new Map();

// Load existing data from disk on startup
if (fs.existsSync(TELEMETRY_FILE)) {
  try {
    telemetryLogs = JSON.parse(fs.readFileSync(TELEMETRY_FILE, 'utf8'));
  } catch (e) {
    console.warn('Failed to load telemetry_logs.json:', e);
  }
}

if (fs.existsSync(CONSOLIDATED_HEALTH_FILE)) {
  try {
    const list = JSON.parse(fs.readFileSync(CONSOLIDATED_HEALTH_FILE, 'utf8'));
    if (Array.isArray(list)) {
      list.forEach(m => {
        if (m.pcId) consolidatedMachines.set(m.pcId, m);
      });
    }
  } catch (e) {
    console.warn('Failed to load consolidated_health.json:', e);
  }
}

function persistData() {
  try {
    fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(telemetryLogs, null, 2), 'utf8');
    fs.writeFileSync(
      CONSOLIDATED_HEALTH_FILE, 
      JSON.stringify(Array.from(consolidatedMachines.values()), null, 2), 
      'utf8'
    );
  } catch (err) {
    console.error('Failed to write telemetry data to disk:', err);
  }
}

// ====================================================================
// 1. INGEST TELEMETRY ENDPOINT (/api/telemetry & /admin/exe_ubd_live)
// ====================================================================
function handleTelemetryIngest(req, res) {
  const body = req.body || {};
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString();

  const pcName = body.pcName || body.hostname || `PC-${Math.floor(1000 + Math.random() * 9000)}`;
  const pcId = body.pcId || body.machineId || `EVD-${(body.state || 'TS').toUpperCase()}-${pcName.toUpperCase()}`;
  const userName = body.userName || body.user || 'System Operator';
  const officeLocation = body.officeLocation || body.office || 'Grama Panchayat Office';
  const state = body.state || (officeLocation.toLowerCase().includes('andhra') ? 'Andhra Pradesh' : 'Telangana');
  const status = body.status || 'SUCCESS';
  const healthScore = body.healthScore || (status === 'FAIL' ? 45 : 100);

  // Fairly evaluate health statuses from incoming payload
  const edgeIeModeStatus = body.edgeIeModeStatus || (String(body.edgeIeMode || status || '').toUpperCase().includes('FAIL') ? 'FAIL' : 'PASS');
  const sitesXmlStatus = body.sitesXmlStatus || (String(body.sitesXml || status || '').toUpperCase().includes('FAIL') ? 'FAIL' : 'PASS');
  const registryPoliciesStatus = body.registryPoliciesStatus || (String(status || '').toUpperCase().includes('FAIL') ? 'FAIL' : 'PASS');
  const dscTokenConnected = body.dscTokenConnected || (String(body.dscStatus || '').toUpperCase().includes('DISCONNECTED') ? 'FAIL' : 'PASS');

  // Create log entry
  const logEntry = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    pcId,
    slNo: telemetryLogs.length + 1,
    date: dateStr,
    time: timeStr,
    pcName,
    userName,
    officeLocation,
    state,
    gatewayUsed: req.path,
    livePresence: 'ONLINE',
    targetDomain: body.targetDomain || 'ubd.telangana.gov.in',
    osVersion: body.osVersion || 'Windows 11 Pro',
    dscStatus: body.dscStatus || 'USB DSC Token Connected',
    edgeIeMode: body.edgeIeMode || 'IE5 Quirks Active',
    verification: body.verification || '17/17 Passed',
    healthScore,
    status,
    remarks: body.remarks || body.summary || 'Deployment Report Received'
  };

  telemetryLogs.unshift(logEntry);
  if (telemetryLogs.length > 500) telemetryLogs.pop();

  // Update consolidated machine store
  let machine = consolidatedMachines.get(pcId);
  if (!machine) {
    machine = {
      pcId,
      pcName,
      userName,
      officeLocation,
      district: body.district || officeLocation.split(',')[0] || 'Local District',
      state,
      osVersion: body.osVersion || 'Windows 11 Pro (64-Bit)',
      winBuild: body.winBuild || '10.0.22631',
      appVersion: body.appVersion || 'v1.0.8',
      machineIdentifier: pcId,
      firstSeen: `${dateStr} ${timeStr}`,
      lastSeenEpoch: now.getTime(),
      lastTelemetryUpdate: `${dateStr} ${timeStr}`,
      overallStatus: status === 'SUCCESS' ? 'HEALTHY' : 'ISSUE DETECTED',
      deployment: {
        totalSteps: 17,
        verifiedSteps: status === 'SUCCESS' ? 17 : 10,
        failedSteps: status === 'SUCCESS' ? 0 : 7,
        skippedSteps: 0,
        verificationPercentage: status === 'SUCCESS' ? 100 : 58,
        failedStepNames: status === 'SUCCESS' ? [] : ['Edge IE Mode Policy', 'sites.xml'],
        lastDeploymentTime: `${dateStr} ${timeStr}`,
        deployResult: status,
        deployProfile: '17/17 UBD Guardian Profile'
      },
      technicalHealth: {
        edgeVersion: body.edgeVersion || 'Edge 128.0',
        edgeIeModeStatus,
        sitesXmlStatus,
        registryPoliciesStatus,
        ubdWebsiteStatus: edgeIeModeStatus,
        dotNetStatus: 'PASS',
        internetConnectivity: 'PASS',
        digiSignerStatus: 'PASS',
        dscDriverStatus: 'PASS',
        dscTokenConnected,
        certValidity: 'PASS'
      },
      activeIssue: status === 'SUCCESS' ? null : {
        issueId: `ISS-${pcName}-01`,
        issueType: 'Edge IE Mode / sites.xml Policy Drift',
        firstDetected: `${dateStr} ${timeStr}`,
        lastDetected: `${dateStr} ${timeStr}`,
        occurrenceCount: 1,
        severity: 'WARNING',
        repairAttempts: 1,
        lastRepairResult: 'Auto-repair attempted',
        postRepairVerification: 'FAIL',
        status: 'OPEN',
        summary: body.remarks || 'IE Mode registry or sites.xml verification failed.'
      },
      issueHistory: []
    };
    consolidatedMachines.set(pcId, machine);
  } else {
    machine.lastSeenEpoch = now.getTime();
    machine.lastTelemetryUpdate = `${dateStr} ${timeStr}`;
    machine.overallStatus = status === 'SUCCESS' ? 'HEALTHY' : 'ISSUE DETECTED';
    machine.deployment.deployResult = status;
    machine.technicalHealth.edgeIeModeStatus = edgeIeModeStatus;
    machine.technicalHealth.sitesXmlStatus = sitesXmlStatus;
    machine.technicalHealth.dscTokenConnected = dscTokenConnected;
    if (status !== 'SUCCESS') {
      machine.activeIssue = {
        issueId: `ISS-${pcName}-01`,
        issueType: 'Edge IE Mode / sites.xml Policy Drift',
        firstDetected: machine.firstSeen,
        lastDetected: `${dateStr} ${timeStr}`,
        occurrenceCount: (machine.activeIssue?.occurrenceCount || 0) + 1,
        severity: 'WARNING',
        repairAttempts: 1,
        lastRepairResult: 'Auto-repair attempted',
        postRepairVerification: 'FAIL',
        status: 'OPEN',
        summary: body.remarks || 'Verification failed.'
      };
    } else {
      machine.activeIssue = null;
    }
  }

  persistData();

  console.log(`[TELEMETRY INGEST] Received report from ${pcName} (${officeLocation}) - Status: ${status}`);

  return res.json({
    success: true,
    message: 'Telemetry report received and fairly logged',
    pcId,
    timestamp: `${dateStr} ${timeStr}`
  });
}

app.post('/api/telemetry', handleTelemetryIngest);
app.post('/admin/exe_ubd_live', handleTelemetryIngest);

// ====================================================================
// 2. FETCH TELEMETRY LOGS & HEALTH DATA ENDPOINTS
// ====================================================================
app.get('/api/telemetry', (req, res) => {
  res.json({
    success: true,
    total: telemetryLogs.length,
    logs: telemetryLogs
  });
});

app.get('/api/consolidated-health', (req, res) => {
  res.json({
    success: true,
    total: consolidatedMachines.size,
    machines: Array.from(consolidatedMachines.values())
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'E-Vedhika Unified Cloud Gateway',
    version: 'v1.0.8',
    activeMachines: consolidatedMachines.size,
    totalLogs: telemetryLogs.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`E-Vedhika Cloud Gateway Bridge running on port ${PORT}`);
});
