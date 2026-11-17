import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolvePcModalDisplay,
  extractTelegramField,
  filterPcModalReports
} from '../src/utils/reportHelpers';

test('resolvePcModalDisplay avoids hardcoded fake hardware metrics when optional fields are absent', () => {
  const normalized = resolvePcModalDisplay('EVD-TS-MNCL-01', {
    pcId: 'EVD-TS-MNCL-01',
    pcName: 'GP-NASPOOR-PC',
    userName: 'Srinivas',
    district: 'Mancherial',
    state: 'Telangana',
    officeLocation: 'Naspoor GP (Telangana)',
    osVersion: 'Microsoft Windows 11 Pro (Build 22631)',
    appVersion: 'v1.1.0',
    resourceBuild: '2026.11.16.R9',
    pcConnectivity: 'ONLINE',
    appState: 'RUNNING',
    healthScore: 97,
    verification: '17/17 steps passed.',
    dscStatus: 'USB Token Driver Active',
    edgeIeMode: 'IE5 Quirks Active (sites.xml present)'
  });

  assert.equal(normalized.pcName, 'GP-NASPOOR-PC');
  assert.equal(normalized.healthScore, 97);
  assert.equal(normalized.ipAddress, 'Not Reported');
  assert.equal(normalized.macAddress, 'Not Reported');
  assert.equal(normalized.memoryDisplay, 'Cloud Synced');
  assert.notEqual(normalized.ipAddress, '192.168.1.104');
  assert.notEqual(normalized.macAddress, '48:2A:E3:10:BF:C9');
});

test('extractTelegramField accurately parses updated System Resources and Workstation Health report output', () => {
  const sampleReport = `📋 E-Vedhika UBD Deployment Tool - Live PC Deployment Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖥️ Machine & Office Identity
Report ID: RPT-20261117-ABC123
Machine ID: EVD-TS-MNCL-42
PC Name: GP-CHENNOOR-01
User Name: Ramesh
Office Location: Chennoor GP, Mancherial (Telangana)

⚙️ System Resources & Storage
RAM (Memory): 8 GB Installed (7.8 GB Usable | 4.1 GB Used, 3.7 GB Free - 53% Load)
Storage (Total): 465.8 GB Total (180.2 GB Used, 285.6 GB Free - 61% Free)
Drive Partitions: C: 42.1/119.0 GB Free | D: 243.5/346.8 GB Free
CPU: Intel(R) Core(TM) i3-10100 CPU @ 3.60GHz

📊 Workstation Health & Deployment
Deployment Result: SUCCESS (17/17 Steps Passed)
PC Health Score: 100/100 (Excellent - Ready for UBD & DSC Signing)
Readiness Check: All 17/17 deployment steps passed; Edge IE Mode, DigiSigner (Port 8080) & DSC services are active.
Application Version: v1.1.0
Build Version: 2026.11.16.R9
Step Counts: Passed: 17 | Failed: 0 | Warnings: 0
Summary: 17/17 steps passed.

🔐 Security, Port & DSC Services
USB DSC Token: USB Token Driver Active
Edge IE Mode: IE5 Quirks Active (sites.xml present)`;

  assert.equal(extractTelegramField(sampleReport, ['Report ID']), 'RPT-20261117-ABC123');
  assert.equal(extractTelegramField(sampleReport, ['Machine ID', 'PC ID']), 'EVD-TS-MNCL-42');
  assert.equal(extractTelegramField(sampleReport, ['Application Version']), 'v1.1.0');
  assert.equal(extractTelegramField(sampleReport, ['Build Version']), '2026.11.16.R9');
  assert.equal(extractTelegramField(sampleReport, ['Summary', 'Final Verification']), '17/17 steps passed.');
  assert.equal(extractTelegramField(sampleReport, ['USB DSC Token']), 'USB Token Driver Active');
  assert.equal(extractTelegramField(sampleReport, ['Edge IE Mode']), 'IE5 Quirks Active (sites.xml present)');
  assert.match(extractTelegramField(sampleReport, ['RAM (Memory)']), /8 GB Installed/);
  assert.match(extractTelegramField(sampleReport, ['Storage (Total)']), /465\.8 GB Total/);
});

test('filterPcModalReports separates audit, ota, and failed events cleanly', () => {
  const sampleEvents = [
    { eventId: '1', reportType: 'DEPLOYMENT_REPORT', status: 'SUCCESS', details: '17/17 passed' },
    { eventId: '2', reportType: 'VERSION_UPGRADE', status: 'SUCCESS', details: 'v1.0.9 -> v1.1.0' },
    { eventId: '3', reportType: 'DEPLOYMENT_AUDIT', status: 'FAILED', details: 'Port 8080 blocked' }
  ];

  assert.equal(filterPcModalReports(sampleEvents, 'audit', '').length, 2);
  assert.equal(filterPcModalReports(sampleEvents, 'ota', '').length, 1);
  assert.equal(filterPcModalReports(sampleEvents, 'errors', '').length, 1);
  assert.equal(filterPcModalReports(sampleEvents, 'audit', 'Port 8080').length, 1);
});
